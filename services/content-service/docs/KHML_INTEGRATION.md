# KHML Integration Guide

## Overview

This guide explains how to integrate the KHML (KHub Markup Language) system into your application workflows, from content creation to display.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Content Creation Flow](#content-creation-flow)
3. [Content Storage](#content-storage)
4. [Content Rendering](#content-rendering)
5. [Search Integration](#search-integration)
6. [Caching Strategy](#caching-strategy)
7. [Migration from Existing Content](#migration-from-existing-content)
8. [API Integration Examples](#api-integration-examples)

## Architecture Overview

```
┌─────────────────┐
│   KHML Editor   │
│   (Frontend)    │
└────────┬────────┘
         │ Raw KHML Source
         ↓
┌─────────────────┐
│   KHML Parser   │ ← KHMLService.parseToJSONB()
│   (Backend)     │
└────────┬────────┘
         │ JSONB Document
         ↓
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
│  - body: JSONB  │
│  - body_source  │
└────────┬────────┘
         │ JSONB Document
         ↓
┌─────────────────┐
│  KHML Renderer  │ ← KHMLService.renderJSONBToHTML()
│   (Backend)     │
└────────┬────────┘
         │ HTML
         ↓
┌─────────────────┐
│   Web Browser   │
│   (Display)     │
└─────────────────┘
```

## Content Creation Flow

### 1. Frontend Editor Integration

#### Monaco Editor Example (Recommended)

```typescript
// services/content-editor/src/components/KHMLEditor.tsx
import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { khmlApi } from '../api/khml.api';

export const KHMLEditor: React.FC = () => {
  const [source, setSource] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  // Real-time validation
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (!source) return;

      const validation = await khmlApi.validate({ source });
      setErrors(validation.errors || []);
    }, 500);

    return () => clearTimeout(debounce);
  }, [source]);

  // Real-time preview
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (!source) return;

      try {
        const result = await khmlApi.render({ source });
        setPreview(result.html);
      } catch (error) {
        console.error('Render error:', error);
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [source]);

  return (
    <div className="khml-editor-layout">
      <div className="editor-pane">
        <Editor
          height="100%"
          language="khml"
          value={source}
          onChange={(value) => setSource(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            lineNumbers: 'on',
            wordWrap: 'on',
          }}
        />
        {errors.length > 0 && (
          <div className="error-panel">
            {errors.map((err, i) => (
              <div key={i} className="error-message">{err}</div>
            ))}
          </div>
        )}
      </div>
      <div className="preview-pane">
        <div dangerouslySetInnerHTML={{ __html: preview }} />
      </div>
    </div>
  );
};
```

#### API Client

```typescript
// services/content-editor/src/api/khml.api.ts
import axios from 'axios';

const API_BASE = 'http://localhost:3001/khml';

export const khmlApi = {
  validate: async (data: { source: string }) => {
    const response = await axios.post(`${API_BASE}/validate`, data);
    return response.data;
  },

  render: async (data: { source: string }) => {
    const response = await axios.post(`${API_BASE}/render`, data);
    return response.data;
  },

  parse: async (data: { source: string }) => {
    const response = await axios.post(`${API_BASE}/parse`, data);
    return response.data;
  },

  extractMetadata: async (data: { source: string }) => {
    const response = await axios.post(`${API_BASE}/extract-metadata`, data);
    return response.data;
  },
};
```

### 2. Saving Content

```typescript
// services/content-service/src/content/services/article.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { KHMLService } from '../../khml/services/khml.service';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    private khmlService: KHMLService,
  ) {}

  async createArticle(data: {
    title: string;
    bodySource: string; // Raw KHML
    authorId: string;
  }): Promise<Article> {
    // Parse KHML to JSONB
    const parseResult = await this.khmlService.parseToJSONB(data.bodySource);

    if (!parseResult.success) {
      throw new Error(`KHML parsing failed: ${parseResult.errors.join(', ')}`);
    }

    // Extract metadata for auto-population
    const metadata = await this.khmlService.extractMetadata(data.bodySource);

    // Extract plain text for search indexing
    const plainText = await this.khmlService.extractPlainText(data.bodySource);

    // Create article entity
    const article = this.articleRepository.create({
      title: data.title,
      body: parseResult.document, // Parsed JSONB
      bodySource: data.bodySource, // Raw KHML
      authorId: data.authorId,
      wordCount: plainText.split(/\s+/).length,
      readingTime: Math.ceil(plainText.split(/\s+/).length / 200), // ~200 words/min
      tags: metadata.tags,
      difficulty: metadata.difficulty,
    });

    return await this.articleRepository.save(article);
  }

  async updateArticle(id: string, data: { bodySource: string }): Promise<Article> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) throw new Error('Article not found');

    // Re-parse KHML
    const parseResult = await this.khmlService.parseToJSONB(data.bodySource);

    if (!parseResult.success) {
      throw new Error(`KHML parsing failed: ${parseResult.errors.join(', ')}`);
    }

    // Update fields
    article.body = parseResult.document;
    article.bodySource = data.bodySource;
    article.updatedAt = new Date();

    return await this.articleRepository.save(article);
  }
}
```

## Content Storage

### Database Schema

```sql
-- articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,

  -- KHML storage
  body JSONB NULL, -- Parsed KHML document
  body_source TEXT NULL, -- Raw KHML source

  -- Metadata
  author_id UUID NOT NULL,
  word_count INTEGER,
  reading_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Index on JSONB for queries
CREATE INDEX idx_articles_body_gin ON articles USING gin(body);

-- Index for full-text search
CREATE INDEX idx_articles_body_source_fts ON articles USING gin(to_tsvector('english', body_source));
```

### TypeORM Entity

```typescript
@Entity('articles')
export class Article extends Content {
  @Column({ type: 'jsonb', nullable: true })
  body: Record<string, unknown>; // KHMLDocument

  @Column({ type: 'text', nullable: true, name: 'body_source' })
  bodySource: string; // Raw KHML

  @Column({ type: 'int', nullable: true, name: 'word_count' })
  wordCount: number;

  @Column({ type: 'int', nullable: true, name: 'reading_time' })
  readingTime: number;
}
```

## Content Rendering

### Server-Side Rendering (SSR)

```typescript
// services/content-reader/src/pages/article/[id].tsx
import { GetServerSideProps } from 'next';
import { articleApi } from '../../api/article.api';

export default function ArticlePage({ html, metadata }) {
  return (
    <article className="khml-article">
      <h1>{metadata.title}</h1>
      <div className="article-meta">
        By {metadata.author} • {metadata.readingTime} min read
      </div>
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const article = await articleApi.getById(params.id as string);

  // Render KHML to HTML on server
  const html = await khmlApi.renderJSONB({
    jsonb: article.body,
    classPrefix: 'article-',
    sanitize: true,
  });

  return {
    props: {
      html,
      metadata: {
        title: article.title,
        author: article.author.name,
        readingTime: article.readingTime,
      },
    },
  };
};
```

### Client-Side Rendering

```typescript
// For dynamic content updates
const [html, setHtml] = useState<string>('');

useEffect(() => {
  const fetchAndRender = async () => {
    const article = await articleApi.getById(articleId);

    // Render on client
    const result = await khmlApi.renderJSONB({
      jsonb: article.body,
    });

    setHtml(result.html);
  };

  fetchAndRender();
}, [articleId]);
```

## Search Integration

### Elasticsearch Indexing

```typescript
// services/search-service/src/indexers/article.indexer.ts
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { KHMLService } from '../../khml/services/khml.service';

@Injectable()
export class ArticleIndexer {
  constructor(
    private elasticsearchService: ElasticsearchService,
    private khmlService: KHMLService,
  ) {}

  async indexArticle(article: Article): Promise<void> {
    // Extract plain text from KHML for search
    const plainText = await this.khmlService.extractPlainText(article.bodySource);

    await this.elasticsearchService.index({
      index: 'articles',
      id: article.id,
      body: {
        title: article.title,
        content: plainText, // Searchable plain text
        body_jsonb: article.body, // For result rendering
        author: article.author.name,
        tags: article.tags,
        created_at: article.createdAt,
      },
    });
  }

  async search(query: string): Promise<any[]> {
    const result = await this.elasticsearchService.search({
      index: 'articles',
      body: {
        query: {
          multi_match: {
            query,
            fields: ['title^3', 'content', 'tags^2'],
          },
        },
        highlight: {
          fields: {
            content: {
              fragment_size: 150,
              number_of_fragments: 3,
            },
          },
        },
      },
    });

    return result.hits.hits;
  }
}
```

## Caching Strategy

### Integration with Cache Service

```typescript
// services/content-service/src/khml/services/khml.service.ts
import { Injectable } from '@nestjs/common';
import { KHMLCacheService } from './khml-cache.service';

@Injectable()
export class KHMLService {
  constructor(private cacheService: KHMLCacheService) {}

  async renderToHTML(source: string, options?: RenderOptions): Promise<string> {
    // Check cache first
    const cached = this.cacheService.getCachedRender(source, options);
    if (cached) {
      return cached;
    }

    // Parse and render
    const parseResult = this.parser.parse(source);
    if (!parseResult.success) {
      throw new Error('Parsing failed');
    }

    const html = this.renderer.render(parseResult.document, options);

    // Cache result
    this.cacheService.setCachedRender(source, html, options);

    return html;
  }
}
```

### Redis Integration (Production)

```typescript
// For production, use Redis instead of in-memory cache
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class KHMLRedisCacheService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
  }

  async getCachedRender(source: string): Promise<string | null> {
    const key = `khml:render:${this.hash(source)}`;
    return await this.redis.get(key);
  }

  async setCachedRender(source: string, html: string): Promise<void> {
    const key = `khml:render:${this.hash(source)}`;
    await this.redis.setex(key, 3600, html); // 1 hour TTL
  }

  private hash(str: string): string {
    // Use crypto for production hashing
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
```

## Migration from Existing Content

### Bulk Migration Script

```typescript
// scripts/migrate-content-to-khml.ts
import { migrateMarkdownToKHML, batchMigrate } from '../src/khml/utils/migration.utils';
import { articleRepository } from '../src/repositories';

async function migrateAllArticles() {
  const articles = await articleRepository.find({
    where: { bodySource: null }, // Only migrate articles without KHML
  });

  console.log(`Found ${articles.length} articles to migrate`);

  for (const article of articles) {
    try {
      // Assuming articles currently have Markdown in a 'content' field
      const khml = migrateMarkdownToKHML(article.content);

      // Parse to JSONB
      const parsed = await khmlService.parseToJSONB(khml);

      if (!parsed.success) {
        console.error(`Failed to migrate article ${article.id}:`, parsed.errors);
        continue;
      }

      // Update article
      article.bodySource = khml;
      article.body = parsed.document;
      await articleRepository.save(article);

      console.log(`✅ Migrated article ${article.id}: "${article.title}"`);
    } catch (error) {
      console.error(`❌ Error migrating article ${article.id}:`, error);
    }
  }

  console.log('Migration complete!');
}

migrateAllArticles();
```

### Run Migration

```bash
npm run migration:khml
```

## API Integration Examples

### Create Article with KHML

```typescript
POST /api/articles
Content-Type: application/json

{
  "title": "Introduction to Algorithms",
  "bodySource": "@article{\n  @meta[title=\"Introduction to Algorithms\", author=\"John Doe\"]{}\n  @content{\n    @h1{Introduction}\n    @paragraph{Algorithms are fundamental...}\n  }\n}"
}
```

### Get Rendered Article

```typescript
GET /api/articles/:id/render

Response:
{
  "html": "<article class=\"khml-document\">...</article>",
  "metadata": {
    "title": "Introduction to Algorithms",
    "wordCount": 1500,
    "readingTime": 8
  }
}
```

### Validate KHML Before Saving

```typescript
POST /api/khml/validate

{
  "source": "@paragraph{Test content}"
}

Response:
{
  "valid": true,
  "errors": []
}
```

## Best Practices

1. **Always store both `body` (JSONB) and `bodySource` (raw KHML)**
   - JSONB for fast querying and rendering
   - Raw source for version control and re-parsing

2. **Use caching aggressively**
   - Cache rendered HTML
   - Invalidate cache on content updates

3. **Extract metadata automatically**
   - Use `extractMetadata()` to populate article fields
   - Reduces manual data entry

4. **Index plain text for search**
   - Use `extractPlainText()` for search indexing
   - Full-text search on raw KHML is less effective

5. **Validate before saving**
   - Always call `validate()` before `parseToJSONB()`
   - Provide user-friendly error messages

6. **Handle migration carefully**
   - Test migration on sample data first
   - Keep backups of original content
   - Log migration errors for manual review

## Next Steps

- [KHML Specification](../KHML_SPECIFICATION.md)
- [API Documentation](../README_PHASE_2.4.md#api-endpoints)
- [Testing Guide](./KHML_TESTING.md)
- [Frontend Editor Development](../../../docs/DEVELOPMENT_CHECKLIST.md#phase-25-frontend-khml-editor)
