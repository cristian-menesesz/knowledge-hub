# Phase 2.0 - MVP CMS Foundation - Architecture & Plan

**Status**: 🚧 In Progress  
**Start Date**: January 27, 2026  
**Duration**: 8 weeks (estimated)  
**Branch**: `feature/phase-2.0-content-service-setup`

---

## Overview

Phase 2.0 focuses on building the core Content Management System (CMS) functionality, establishing
the backend services, and creating the basic editor experience. This phase transitions from frontend
foundation (Phase 1) to full-stack implementation.

### Key Objectives

1. **Content Service Backend**: NestJS-based microservice for content CRUD operations
2. **Media Service**: Go-based service for asset management and optimization
3. **Basic Block Editor**: Implement block-based editing (Slate.js or Lexical)
4. **Content Reader**: Display published content with proper formatting
5. **Draft/Publish Workflow**: Enable content creation, editing, and publishing
6. **API Gateway Integration**: Register services in Kong for routing

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway (Kong)                       │
│                     Port 8000 (Dev: 8000)                       │
└───────────┬──────────────┬──────────────┬──────────────────────┘
            │              │              │
    ┌───────▼──────┐  ┌───▼──────┐  ┌───▼──────┐
    │   Content    │  │  Media   │  │   Auth   │
    │   Service    │  │  Service │  │  Service │
    │  (NestJS)    │  │   (Go)   │  │ (NestJS) │
    │  Port 3001   │  │ Port 3003│  │ Port 3002│
    └──────┬───────┘  └────┬─────┘  └────┬─────┘
           │               │              │
    ┌──────▼────────┐  ┌──▼───────┐  ┌──▼──────┐
    │  PostgreSQL   │  │   S3/    │  │   JWT   │
    │  + MongoDB    │  │Cloudinary│  │  Tokens │
    │  (Content     │  │ (Assets) │  │         │
    │   Storage)    │  │          │  │         │
    └───────────────┘  └──────────┘  └─────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React MFEs)                       │
├─────────────┬─────────────┬─────────────┬─────────────────────┤
│    Shell    │   Content   │   Content   │    Admin           │
│   (Host)    │   Editor    │   Reader    │   Dashboard        │
│  Port 4000  │  Port 4002  │  Port 4001  │   Port 4004        │
└─────────────┴─────────────┴─────────────┴─────────────────────┘
```

---

## Database Schema Design

### PostgreSQL - Content Metadata

```sql
-- Content table (main content metadata)
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- article, code-snippet, definition, guide
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, published, archived
  author_id UUID NOT NULL REFERENCES users(id),

  -- Metadata
  tags TEXT[], -- Array of tags
  concepts TEXT[], -- Array of concept IDs
  category VARCHAR(100),
  difficulty VARCHAR(20), -- beginner, intermediate, advanced

  -- SEO & Publishing
  seo_title VARCHAR(255),
  seo_description TEXT,
  canonical_url VARCHAR(500),
  featured_image_url VARCHAR(500),

  -- Stats
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  published_at TIMESTAMP,

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Content versions (for history tracking)
CREATE TABLE content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL, -- Full content snapshot
  change_summary TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  UNIQUE(content_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_contents_status ON contents(status);
CREATE INDEX idx_contents_author ON contents(author_id);
CREATE INDEX idx_contents_type ON contents(content_type);
CREATE INDEX idx_contents_published_at ON contents(published_at);
CREATE INDEX idx_contents_tags ON contents USING GIN(tags);
CREATE INDEX idx_contents_concepts ON contents USING GIN(concepts);
CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
```

### MongoDB - Draft Content & Blocks

```javascript
// Draft content documents (flexible schema for editing)
{
  _id: ObjectId,
  contentId: UUID, // References PostgreSQL content.id
  blocks: [
    {
      id: String, // Block UUID
      type: String, // paragraph, heading, code, image, etc.
      data: {
        // Type-specific data
        text: String,
        level: Number, // For headings
        language: String, // For code blocks
        code: String,
        url: String, // For images
        caption: String,
        // ... other block-specific fields
      },
      metadata: {
        createdAt: Date,
        updatedAt: Date
      }
    }
  ],
  metadata: {
    totalBlocks: Number,
    lastEditedBy: UUID,
    lastSavedAt: Date,
    wordCount: Number,
    readingTime: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## Service Architecture

### Content Service (NestJS)

**Responsibilities**:

- Content CRUD operations
- Publishing workflow (draft → published)
- Version control and history
- Tag and concept management
- Search indexing integration
- RESTful API + GraphQL (later)

**Technology Stack**:

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **ORM**: TypeORM (PostgreSQL) + Mongoose (MongoDB)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI 3.0

**Project Structure**:

```
services/content-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/                # Configuration (database, env)
│   ├── content/               # Content module
│   │   ├── content.controller.ts
│   │   ├── content.service.ts
│   │   ├── content.repository.ts
│   │   ├── dto/               # Data Transfer Objects
│   │   │   ├── create-content.dto.ts
│   │   │   ├── update-content.dto.ts
│   │   │   └── content-response.dto.ts
│   │   └── entities/          # TypeORM entities
│   │       ├── content.entity.ts
│   │       └── content-version.entity.ts
│   ├── draft/                 # Draft management
│   │   ├── draft.controller.ts
│   │   ├── draft.service.ts
│   │   └── schemas/           # MongoDB schemas
│   │       └── draft.schema.ts
│   ├── version/               # Version control
│   │   ├── version.controller.ts
│   │   └── version.service.ts
│   ├── tag/                   # Tag management
│   ├── concept/               # Concept management
│   ├── common/                # Shared utilities
│   │   ├── guards/            # Auth guards
│   │   ├── interceptors/      # Logging, transform
│   │   ├── pipes/             # Validation pipes
│   │   └── filters/           # Exception filters
│   └── health/                # Health check endpoint
├── test/                      # Integration tests
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

**API Endpoints**:

```
POST   /api/v1/contents           - Create content
GET    /api/v1/contents           - List contents (with pagination)
GET    /api/v1/contents/:id       - Get content by ID
PATCH  /api/v1/contents/:id       - Update content
DELETE /api/v1/contents/:id       - Delete content (soft delete)
POST   /api/v1/contents/:id/publish - Publish content
POST   /api/v1/contents/:id/versions - Create version
GET    /api/v1/contents/:id/versions - List versions
GET    /api/v1/drafts/:contentId  - Get draft
PUT    /api/v1/drafts/:contentId  - Save draft
POST   /api/v1/drafts/:contentId/autosave - Auto-save draft
```

---

### Media Service (Go)

**Responsibilities**:

- File upload to S3/Cloudinary
- Image optimization and resizing
- Video transcoding (future)
- CDN integration (CloudFront)
- Asset metadata management

**Technology Stack**:

- **Language**: Go 1.21+
- **Framework**: Gin or Fiber
- **Storage**: AWS S3 or Cloudinary
- **Image Processing**: go-image (libvips)
- **API**: gRPC for internal, REST for external

**Project Structure** (Phase 2 simplified):

```
services/media-service/
├── main.go
├── handlers/
│   └── upload.go
├── storage/
│   └── s3.go
├── processing/
│   └── image.go
└── proto/                 # gRPC definitions (future)
```

---

## Block Editor Implementation

### Technology Evaluation

| Feature               | Slate.js | Lexical      | ProseMirror   |
| --------------------- | -------- | ------------ | ------------- |
| **Maturity**          | Mature   | Newer (Meta) | Very mature   |
| **React Integration** | Native   | Excellent    | Via wrapper   |
| **Customization**     | High     | Very High    | High          |
| **Performance**       | Good     | Excellent    | Excellent     |
| **Documentation**     | Good     | Growing      | Comprehensive |
| **Bundle Size**       | ~45KB    | ~30KB        | ~55KB         |
| **Complexity**        | Medium   | Medium-High  | High          |

**Decision**: Start with **Lexical** (Meta's framework)

- Modern architecture
- Built for React
- Excellent performance
- Growing ecosystem
- Meta backing ensures longevity

### Block Types (MVP)

1. **Paragraph** - Rich text with inline formatting
2. **Heading** - H1-H6 with anchor links
3. **Code Block** - Syntax highlighted code
4. **Image** - Image with caption
5. **Bulleted List** - Unordered list
6. **Numbered List** - Ordered list
7. **Quote** - Blockquote
8. **Divider** - Horizontal rule

### Block Editor Features

- **Drag & Drop**: Reorder blocks
- **Slash Commands**: `/` to insert blocks
- **Toolbar**: Floating toolbar for formatting
- **Auto-save**: Save draft every 30 seconds
- **Undo/Redo**: Full history support
- **Keyboard Shortcuts**: Standard editing shortcuts

---

## API Gateway Configuration

### Kong Setup

```yaml
# kong.yml (declarative config)
_format_version: '3.0'
_transform: true

services:
  - name: content-service
    url: http://content-service:3001
    routes:
      - name: content-routes
        paths:
          - /api/v1/contents
          - /api/v1/drafts
        methods:
          - GET
          - POST
          - PUT
          - PATCH
          - DELETE
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: cors
      - name: jwt # JWT authentication

  - name: media-service
    url: http://media-service:3003
    routes:
      - name: media-routes
        paths:
          - /api/v1/media
        methods:
          - GET
          - POST
    plugins:
      - name: rate-limiting
        config:
          minute: 50
          hour: 500
```

---

## Development Workflow

### Phase 2.0 Task Breakdown

#### Iteration 1: Content Service Foundation (Week 1-2)

1. **MS-CONTENT-001**: Initialize NestJS project
   - Set up project structure
   - Configure TypeORM + Mongoose
   - Database connection
   - Health check endpoint
2. **MS-CONTENT-002**: Content CRUD operations
   - Create content entities
   - Implement repository pattern
   - Build service layer
   - Create REST endpoints
   - Add validation (DTOs)
3. **MS-CONTENT-003**: Version control
   - Version entity and service
   - Snapshot creation on publish
   - Version history API

#### Iteration 2: Draft Management & Editor Setup (Week 3-4)

4. **CMS-011**: Draft management system
   - MongoDB schema for drafts
   - Draft service (save, load, auto-save)
   - Draft API endpoints
5. **MFE-EDITOR-001**: Editor MFE setup
   - Create React app (Module Federation)
   - Install Lexical
   - Basic editor component
   - Connect to Shell

6. **CMS-001**: Block editor architecture
   - Implement block registry
   - Create base block components
   - Drag & drop functionality

#### Iteration 3: Block Types & Publishing (Week 5-6)

7. **CMS-002**: Text formatting capabilities
   - Paragraph block
   - Heading blocks (H1-H6)
   - Rich text toolbar
8. **CMS-003**: Code block functionality
   - Code block component
   - Syntax highlighting (Shiki)
   - Language selector
9. **CMS-012**: Publishing workflow
   - Publish endpoint
   - Status transitions (draft → published)
   - Validation before publish

#### Iteration 4: Media & Reader (Week 7-8)

10. **MS-MEDIA-001**: Go service setup
    - Initialize Go project (Gin)
    - S3 integration
    - Upload endpoint
11. **CMS-004**: Image block
    - Image block component
    - Upload integration with media service
    - Image preview and caption
12. **MFE-READER-001**: Content Reader MFE
    - Create React app
    - Content fetching
    - Block rendering engine
    - Syntax highlighting integration

---

## Testing Strategy

### Unit Tests

- **Service Layer**: 80%+ coverage
  - Content CRUD operations
  - Publishing logic
  - Version control
  - Draft auto-save
- **Components**: 70%+ coverage
  - Block components
  - Editor toolbar
  - Draft indicator

### Integration Tests

- **API Endpoints**: All endpoints tested
  - Happy paths
  - Error cases
  - Validation
  - Authentication

### E2E Tests (Future - Phase 3)

- Content creation flow
- Draft → Publish workflow
- Image upload

---

## Local Development Setup

### Prerequisites

- Node.js 20.x
- Go 1.21+
- PostgreSQL 16.x
- MongoDB 7.0+
- Redis 7.x
- Docker & Docker Compose

### Docker Compose Services

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: knowledge_hub
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev_password
    volumes:
      - ./infrastructure/docker/postgres/init:/docker-entrypoint-initdb.d

  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: knowledge_hub
    volumes:
      - ./infrastructure/docker/mongodb/init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  content-service:
    build: ./services/content-service
    ports:
      - '3001:3001'
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://dev:dev_password@postgres:5432/knowledge_hub
      MONGODB_URL: mongodb://mongodb:27017/knowledge_hub
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - mongodb
      - redis
```

### Start Development Environment

```bash
# Start databases
npm run docker:dev:up

# Terminal 1: Content Service
cd services/content-service
npm run start:dev

# Terminal 2: Shell MFE
cd apps/shell
npm run dev

# Terminal 3: Editor MFE
cd apps/content-editor
npm run dev

# Terminal 4: Reader MFE
cd apps/content-reader
npm run dev
```

---

## Performance Targets

### API Response Times

- **GET single content**: < 100ms (with cache)
- **POST create content**: < 200ms
- **GET list contents**: < 150ms (paginated)
- **PUT save draft**: < 100ms

### Frontend Performance

- **Editor load time**: < 2s
- **Reader load time**: < 1.5s
- **Time to interactive**: < 3s

---

## Security Considerations

### Authentication & Authorization

- **JWT tokens** for API authentication
- **Role-based access** (admin, editor, reader)
- **Content ownership** validation

### Data Protection

- **Input validation** on all endpoints
- **SQL injection prevention** (parameterized queries)
- **XSS protection** (sanitize HTML output)
- **CSRF tokens** for state-changing operations

### Rate Limiting

- **API Gateway**: 100 req/min per IP
- **Upload endpoint**: 10 req/min per user
- **Auto-save**: Debounced client-side

---

## Monitoring & Observability

### Logging

- **Structured JSON logs** (Winston/Zap)
- **Correlation IDs** for request tracing
- **Error tracking** (Sentry integration - future)

### Metrics

- **API metrics**: Request count, latency, errors
- **Database metrics**: Query time, connection pool
- **Business metrics**: Content created, published, views

### Health Checks

- **Liveness**: `/health/live` (service up)
- **Readiness**: `/health/ready` (dependencies ready)

---

## Success Criteria

Phase 2.0 is complete when:

✅ **Backend**:

- [x] Content Service running with CRUD operations
- [x] Draft management with auto-save
- [x] Version control working
- [x] Media Service with upload capability
- [x] All services registered in API Gateway

✅ **Frontend**:

- [x] Block editor functional with basic blocks
- [x] Content creation and editing workflow
- [x] Draft → Publish flow working
- [x] Content Reader displaying published content
- [x] Image upload and display

✅ **Quality**:

- [x] 70%+ test coverage on critical paths
- [x] API documentation (Swagger) complete
- [x] Local development environment stable
- [x] All integration tests passing

✅ **Documentation**:

- [x] Architecture documentation
- [x] API documentation
- [x] Developer onboarding guide
- [x] Deployment guide

---

## Next Steps After Phase 2.0

**Phase 3.0 - Search & Discovery**:

- Meilisearch integration
- Full-text search
- Faceted filters
- Homepage with featured content

---

**Document Status**: 🚧 Draft  
**Last Updated**: January 27, 2026  
**Author**: Development Team  
**Next Review**: Week 3 of Phase 2.0
