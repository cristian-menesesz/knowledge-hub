# Search Service

Full-text search service powered by Meilisearch for the Knowledge Hub platform.

## Features

- **Full-text search** across all content types
- **Faceted search** with filters (tags, categories, content type)
- **Typo tolerance** and relevance ranking
- **Autocomplete** suggestions
- **Real-time indexing** via event-driven architecture
- **Multi-language support**

## Tech Stack

- **NestJS**: Web framework
- **Meilisearch**: Search engine
- **TypeScript**: Type-safe development

## Getting Started

### Prerequisites

- Node.js 20+
- Meilisearch running (via Docker Compose)
- Content Service running (for indexing)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```env
PORT=3005
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=masterKey
CONTENT_SERVICE_URL=http://localhost:3001
```

### Running

```bash
# Development with hot-reload
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Search

```bash
# Search all content
GET /api/v1/search?q=query&limit=20&offset=0

# Search with filters
GET /api/v1/search?q=query&type=article&tags=javascript,typescript

# Autocomplete
GET /api/v1/search/autocomplete?q=query&limit=5
```

### Indexing (Admin)

```bash
# Index all content
POST /api/v1/search/index

# Index specific content
POST /api/v1/search/index/:id

# Delete from index
DELETE /api/v1/search/index/:id

# Rebuild index
POST /api/v1/search/reindex
```

## Search Features

### Supported Fields

- **Searchable**: title, content, excerpt, author
- **Facets**: type, tags, category, status, language
- **Sortable**: publishedAt, viewCount, likeCount, createdAt

### Query Syntax

```bash
# Simple query
q=typescript

# Phrase search
q="async await"

# Multiple terms (OR)
q=javascript OR typescript

# Filters
type=article
tags=javascript,typescript
status=published
```

## Development

### Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Linting

```bash
npm run lint
npm run format
```

## Architecture

```
┌─────────────────┐
│ Content Service │──┐
└─────────────────┘  │
                     │ Event Bus
┌─────────────────┐  │ (content.created/updated)
│ Search Service  │◄─┘
│  - API Layer    │
│  - Indexer      │
│  - Query        │
└────────┬────────┘
         │
         ▼
  ┌──────────────┐
  │ Meilisearch  │
  └──────────────┘
```

## Environment Variables

| Variable              | Description                    | Default                 |
| --------------------- | ------------------------------ | ----------------------- |
| `PORT`                | Service port                   | `3005`                  |
| `NODE_ENV`            | Environment mode               | `development`           |
| `MEILI_HOST`          | Meilisearch host URL           | `http://localhost:7700` |
| `MEILI_MASTER_KEY`    | Meilisearch master key         | `masterKey`             |
| `CONTENT_SERVICE_URL` | Content service URL for import | `http://localhost:3001` |

## License

MIT
