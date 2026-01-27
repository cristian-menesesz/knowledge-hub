# Content Types Implementation - Phase 2.3

## Overview

Phase 2.3 introduces **four specialized content types** for the Knowledge Hub platform, each
optimized for different learning materials and documentation needs. This implementation extends the
base `Content` entity with type-specific fields and behaviors.

## Content Types

### 1. Article (`ContentType.ARTICLE`)

**Purpose**: Long-form educational content with structured sections and reading flow.

**Key Features**:

- **Structured Content**: Introduction, body (JSONB block-based), conclusion
- **Reading Experience**: Auto-calculated reading time and word count
- **Navigation**: Table of contents with anchor links
- **Learning Integration**: Part of learning paths with sequence numbers
- **Series Support**: Multi-part articles with series tracking
- **Metadata**: Key takeaways, prerequisites, related content
- **External Resources**: Curated links with type classification

**Example Use Cases**:

- "Complete Guide to TypeScript Generics"
- "Understanding React Hooks: A Deep Dive"
- "Database Normalization Explained"

**Entity**: `Article` ([article.entity.ts](../services/content-service/src/content/entities/article.entity.ts))  
**DTO**: `CreateArticleDto` ([create-article.dto.ts](../services/content-service/src/content/dto/create-article.dto.ts))  
**Table**: `articles`

### 2. Code Snippet (`ContentType.CODE_SNIPPET`)

**Purpose**: Reusable code examples with context, execution details, and quality metrics.

**Key Features**:

- **Code Storage**: Text-based with language detection (19 languages supported)
- **Execution Context**: Dependencies, setup instructions, expected output
- **Playground Integration**: Executable snippets marked with `is_executable` flag
- **Quality Metrics**: Lines of code, best practices, common pitfalls
- **Performance**: Time/space complexity analysis (Big O notation)
- **Variations**: Alternative implementations and approaches
- **Integration**: Related snippets for comparison

**Supported Languages**:
JavaScript, TypeScript, Python, Java, Go, Rust, C++, C#, PHP, Ruby, Swift, Kotlin, SQL, HTML, CSS,
Shell, YAML, JSON, and more.

**Example Use Cases**:

- "Fibonacci Sequence - Iterative vs Recursive"
- "React Custom Hook: useDebounce"
- "PostgreSQL Join Optimization"

**Entity**: `CodeSnippet` ([code-snippet.entity.ts](../services/content-service/src/content/entities/code-snippet.entity.ts))  
**DTO**: `CreateCodeSnippetDto` ([create-code-snippet.dto.ts](../services/content-service/src/content/dto/create-code-snippet.dto.ts))  
**Table**: `code_snippets`

### 3. Definition (`ContentType.DEFINITION`)

**Purpose**: Concise explanations of terms, concepts, and acronyms with cross-referencing.

**Key Features**:

- **Core Definition**: Term + concise definition (1-3 sentences)
- **Expanded Explanation**: Detailed description for complex concepts
- **Type Classification**: Concept, Term, Acronym, API, Pattern, Principle
- **Acronym Support**: Full form and alternative abbreviations
- **Examples**: Contextual examples and code examples
- **Cross-References**: Synonyms, antonyms, related terms
- **Hierarchy**: Parent/child concept relationships
- **Etymology**: Historical context and first usage
- **Visual Aids**: Diagrams and illustrations
- **Pronunciation**: IPA notation with optional audio
- **Full-Text Search**: Indexed for fast term lookup

**Example Use Cases**:

- "API - Application Programming Interface"
- "Recursion in Programming"
- "SOLID Principles"

**Entity**: `Definition` ([definition.entity.ts](../services/content-service/src/content/entities/definition.entity.ts))  
**DTO**: `CreateDefinitionDto` ([create-definition.dto.ts](../services/content-service/src/content/dto/create-definition.dto.ts))  
**Table**: `definitions`

### 4. Reference Guide (`ContentType.GUIDE`)

**Purpose**: Comprehensive guides, tutorials, and technical documentation with structured steps.

**Key Features**:

- **Guide Classification**: 7 types (Tutorial, How-To, Reference, Quick Start, Troubleshooting,
  Best Practices, Migration)
- **Format Options**: 5 formats (Step-by-Step, Checklist, Decision Tree, Comparison, Reference
  Sheet)
- **Technology Tracking**: Technology name and version compatibility
- **Step-by-Step Instructions**: Order, title, description, code, expected output, time estimates
- **Prerequisites**: Knowledge, software, hardware, account requirements
- **Learning Outcomes**: What users will learn and build
- **Reference Sections**: API reference, command reference, configuration options
- **Troubleshooting**: Common issues with causes and solutions
- **FAQs**: Frequently asked questions
- **Version Management**: Guide version, last verified date, compatibility
- **Migration Support**: From/to versions, breaking changes
- **Resources**: Official documentation links, source repository

**Example Use Cases**:

- "Docker Installation Tutorial"
- "PostgreSQL Performance Tuning Guide"
- "Migrating from React 17 to 18"

**Entity**: `Guide` ([guide.entity.ts](../services/content-service/src/content/entities/guide.entity.ts))  
**DTO**: `CreateGuideDto` ([create-guide.dto.ts](../services/content-service/src/content/dto/create-guide.dto.ts))  
**Table**: `guides`

## Technical Architecture

### Entity Inheritance

All content types extend the base `Content` entity using **Table Inheritance** pattern:

```typescript
@Entity('articles')
export class Article extends Content {
  constructor() {
    super();
    this.contentType = ContentType.ARTICLE;
  }
  // Article-specific fields...
}
```

**Base Content Fields** (inherited by all):

- ID, title, slug, description
- Status (draft, published, archived)
- Author ID
- Tags, concepts, category
- Difficulty level
- SEO metadata
- View/like counts
- Timestamps (created, updated, published, deleted)

### Database Schema

**Migration**: [002_create_content_types.sql](../services/content-service/migrations/002_create_content_types.sql)

**Key Design Decisions**:

1. **JSONB for Flexibility**: Body content, steps, examples stored as JSONB for nested structures
2. **Text Arrays**: Tags, prerequisites, dependencies stored as PostgreSQL text arrays
3. **Custom ENUMs**: Type-safe classification (ProgrammingLanguage, DefinitionType, GuideType, etc.)
4. **Foreign Key Constraints**: Each type table references `contents.id` with CASCADE delete
5. **Indexes**: Optimized for common queries (language, technology, term, reading time, etc.)
6. **Full-Text Search**: GIN index on definition terms for fast lookups

### DTOs and Validation

All DTOs use **class-validator** decorators for type-safe validation:

```typescript
export class CreateArticleDto extends CreateContentDto {
  @ApiProperty({ example: 'This article covers...' })
  @IsString()
  @IsOptional()
  introduction?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsInt()
  @Min(1)
  @IsOptional()
  readingTime?: number;
  // ...
}
```

**Swagger/OpenAPI Integration**: All DTOs include `@ApiProperty` decorators for automatic API
documentation generation.

## API Endpoints

All content types use the existing Content Service endpoints:

- `POST /api/v1/content` - Create content (discriminated by `contentType`)
- `GET /api/v1/content/:id` - Retrieve content with type-specific fields
- `GET /api/v1/content` - List content with filtering by type
- `PATCH /api/v1/content/:id` - Update content
- `DELETE /api/v1/content/:id` - Soft delete content

### Content Type Discrimination

The API automatically handles type-specific fields based on `contentType`:

```json
{
  "contentType": "article",
  "title": "Getting Started with TypeScript",
  "slug": "getting-started-typescript",
  "introduction": "TypeScript is a typed superset...",
  "readingTime": 15,
  "wordCount": 3500,
  "tableOfContents": [{ "level": 1, "title": "Introduction", "anchor": "introduction" }]
}
```

## Usage Examples

### Creating an Article

```bash
curl -X POST http://localhost:3001/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "article",
    "title": "TypeScript Generics Explained",
    "slug": "typescript-generics-explained",
    "authorId": "user-uuid",
    "introduction": "Generics provide a way to make components work with any data type...",
    "readingTime": 20,
    "wordCount": 4500,
    "keyTakeaways": [
      "Generics enable code reusability",
      "Type safety without sacrificing flexibility"
    ],
    "difficulty": "intermediate",
    "tags": ["typescript", "generics", "advanced-types"]
  }'
```

### Creating a Code Snippet

```bash
curl -X POST http://localhost:3001/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "code-snippet",
    "title": "Debounce Function",
    "slug": "debounce-function",
    "authorId": "user-uuid",
    "code": "function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }",
    "language": "javascript",
    "explanation": "Limits function execution rate by delaying invocation",
    "useCases": ["Search input optimization", "Scroll event handling"],
    "timeComplexity": "O(1)",
    "isExecutable": true,
    "tags": ["javascript", "performance", "debounce"]
  }'
```

### Creating a Definition

```bash
curl -X POST http://localhost:3001/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "definition",
    "title": "REST API",
    "slug": "rest-api",
    "authorId": "user-uuid",
    "term": "REST API",
    "definition": "An architectural style for designing networked applications",
    "definitionType": "api",
    "fullForm": "Representational State Transfer Application Programming Interface",
    "domain": "Web Development",
    "relatedTerms": ["HTTP", "RESTful", "API"],
    "tags": ["api", "rest", "web-services"]
  }'
```

### Creating a Guide

```bash
curl -X POST http://localhost:3001/api/v1/content \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "guide",
    "title": "Docker Installation Guide",
    "slug": "docker-installation",
    "authorId": "user-uuid",
    "guideType": "tutorial",
    "guideFormat": "step-by-step",
    "technology": "Docker",
    "technologyVersion": "24.0",
    "estimatedTime": 60,
    "steps": [
      {
        "order": 1,
        "title": "Download Docker Desktop",
        "description": "Visit docker.com and download the installer",
        "timeEstimate": 10
      }
    ],
    "tags": ["docker", "installation", "tutorial"]
  }'
```

## Future Enhancements

### Phase 2.4+ Integration

- **Block Editor**: JSONB `body` fields ready for block-based content from Slate.js/Lexical
- **Media Integration**: Featured images and diagram URLs ready for Media Service
- **Playground**: Code snippets with `is_executable: true` ready for interactive execution
- **Search Service**: Full-text search already indexed on definitions
- **Analytics**: View counts and likes tracked for popularity metrics

### Planned Features (Phase 3+)

- **Content Versioning**: Track changes to articles, snippets, definitions, guides
- **Translation Support**: Multi-language content with fallbacks
- **AI Enhancements**: Auto-generate reading time, extract key takeaways, suggest related content
- **Collaborative Editing**: Real-time collaboration on articles and guides
- **Review Workflow**: Peer review system for technical accuracy
- **Export Formats**: PDF, EPUB, Markdown export for all content types

## Testing

### Manual Testing

1. **Start Content Service**:

   ```bash
   cd services/content-service
   npm run build
   npm run start:dev
   ```

2. **Run Migration**:

   ```bash
   psql -h localhost -U postgres -d knowledge_hub_dev -f migrations/002_create_content_types.sql
   ```

3. **Test Endpoints**: Use curl examples above

### Automated Tests (Phase 2.9)

- Unit tests for DTOs (validation)
- Unit tests for services (business logic)
- Integration tests for repositories (database operations)
- E2E tests for API endpoints

## Performance Considerations

**Database Indexes**:

- All type-specific queries indexed (language, technology, term, etc.)
- JSONB columns use GIN indexes for nested queries
- Text arrays support containment queries (@> operator)

**Query Optimization**:

- Full-text search on definitions uses tsvector index
- Pagination supported on all list endpoints
- Eager loading configured for common joins

**Caching Strategy** (Phase 3):

- Redis cache for popular articles (high view count)
- CDN cache for static assets (diagrams, audio files)
- Cache invalidation on content updates

## Migration Notes

### Running the Migration

```bash
# Development
psql -h localhost -U postgres -d knowledge_hub_dev -f services/content-service/migrations/002_create_content_types.sql

# Production (via Docker)
docker exec -i postgres psql -U postgres -d knowledge_hub < services/content-service/migrations/002_create_content_types.sql
```

### Rollback

```sql
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS code_snippets CASCADE;
DROP TABLE IF EXISTS definitions CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TYPE IF EXISTS programming_language;
DROP TYPE IF EXISTS definition_type;
DROP TYPE IF EXISTS guide_type;
DROP TYPE IF EXISTS guide_format;
```

## File Structure

```
services/content-service/
├── src/content/
│   ├── entities/
│   │   ├── content.entity.ts         # Base entity
│   │   ├── article.entity.ts         # NEW
│   │   ├── code-snippet.entity.ts    # NEW
│   │   ├── definition.entity.ts      # NEW
│   │   ├── guide.entity.ts           # NEW
│   │   └── index.ts                  # NEW
│   ├── dto/
│   │   ├── create-content.dto.ts     # Base DTO
│   │   ├── create-article.dto.ts     # NEW
│   │   ├── create-code-snippet.dto.ts# NEW
│   │   ├── create-definition.dto.ts  # NEW
│   │   ├── create-guide.dto.ts       # NEW
│   │   └── index.ts                  # NEW
│   └── content.module.ts             # UPDATED
├── migrations/
│   └── 002_create_content_types.sql  # NEW
└── README_CONTENT_TYPES.md           # NEW (this file)
```

## Summary

Phase 2.3 delivers a robust, extensible content type system with:

- ✅ 4 specialized content types (Article, Code Snippet, Definition, Guide)
- ✅ Type-safe entities with inheritance
- ✅ Comprehensive DTOs with validation
- ✅ Database schema with optimized indexes
- ✅ API integration via existing endpoints
- ✅ Full Swagger/OpenAPI documentation
- ✅ Ready for Phase 2.4 Block Editor integration
- ✅ Scalable architecture for future content types

**Next Steps**: Phase 2.4 - Basic Block Editor (Slate.js/Lexical integration)

---

**Phase 2.3 Complete**: January 27, 2026
