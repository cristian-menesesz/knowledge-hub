# Content Service

Knowledge Hub Content Management Service - NestJS microservice for managing content metadata, versioning, and CRUD operations.

## 🏗️ Architecture

- **Framework**: NestJS 11.x
- **Language**: TypeScript (strict mode)
- **Databases**:
  - PostgreSQL 16 (via TypeORM) - Content metadata
  - MongoDB 7 (via Mongoose) - Draft content
- **API**: REST + Swagger/OpenAPI documentation
- **Port**: 3001
- **API Prefix**: `/api/v1`

## 📋 Prerequisites

1. **Node.js**: v20+ (LTS recommended)
2. **Docker Desktop**: For running databases
3. **npm**: v10+

## 🚀 Quick Start

### 1. Start Databases

```bash
# From project root, start Docker Desktop first, then:
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up -d

# Verify containers are running
docker ps
```

You should see three containers:

- `knowledge-hub-postgres` (port 5432)
- `knowledge-hub-mongodb` (port 27017)
- `knowledge-hub-redis` (port 6379)

### 2. Install Dependencies

```bash
cd services/content-service
npm install
```

### 3. Environment Configuration

The `.env` file is already created from `.env.example`. Default configuration:

```env
NODE_ENV=development
PORT=3001
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=dev
DATABASE_PASSWORD=dev_password
DATABASE_NAME=knowledge_hub
MONGODB_URI=mongodb://localhost:27017/knowledge_hub
```

### 4. Start Development Server

```bash
npm run start:dev
```

The service will:

- Start on `http://localhost:3001`
- Auto-reload on file changes
- Create database tables automatically (TypeORM sync enabled)

### 5. Access Swagger Documentation

Open your browser to:

```
http://localhost:3001/api/docs
```

You'll see interactive API documentation for all endpoints.

## 🧪 Testing the Service

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "info": {
    "postgres": { "status": "up" },
    "mongodb": { "status": "up" }
  }
}
```

### Create Content (via Swagger)

1. Go to `http://localhost:3001/api/docs`
2. Click **POST /api/v1/contents**
3. Click "Try it out"
4. Use this example:

```json
{
  "title": "Getting Started with TypeScript",
  "slug": "getting-started-typescript",
  "description": "A comprehensive guide to TypeScript fundamentals",
  "contentType": "article",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "tags": ["typescript", "javascript", "tutorial"],
  "concepts": ["Types", "Interfaces", "Generics"],
  "category": "Programming Languages",
  "difficulty": "beginner"
}
```

5. Click "Execute"
6. Check the response - you should get a 201 Created with the content object

### List Content

```bash
curl http://localhost:3001/api/v1/contents
```

### Get Content by ID

```bash
curl http://localhost:3001/api/v1/contents/{id}
```

## 📚 API Endpoints

| Method   | Endpoint                       | Description                 |
| -------- | ------------------------------ | --------------------------- |
| `POST`   | `/api/v1/contents`             | Create new content          |
| `GET`    | `/api/v1/contents`             | List content (with filters) |
| `GET`    | `/api/v1/contents/:id`         | Get content by ID           |
| `GET`    | `/api/v1/contents/slug/:slug`  | Get content by slug         |
| `PATCH`  | `/api/v1/contents/:id`         | Update content              |
| `DELETE` | `/api/v1/contents/:id`         | Soft delete content         |
| `POST`   | `/api/v1/contents/:id/publish` | Publish content             |
| `POST`   | `/api/v1/contents/:id/like`    | Increment like count        |
| `GET`    | `/health`                      | Service health check        |

### Query Parameters (GET /contents)

- `status`: Filter by status (draft, published, archived)
- `contentType`: Filter by type (article, code-snippet, definition, guide)
- `authorId`: Filter by author UUID
- `limit`: Results per page (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

Example:

```
GET /api/v1/contents?status=published&contentType=article&limit=10
```

## 🗄️ Database Schema

### Content Entity (PostgreSQL)

```typescript
{
  id: UUID (primary key)
  title: string (required, 3-255 chars)
  slug: string (required, unique, 3-255 chars)
  description: string (optional)
  contentType: enum (article, code-snippet, definition, guide)
  status: enum (draft, published, archived) - default: draft
  authorId: UUID (required)

  // Metadata
  tags: string[]
  concepts: string[]
  category: string
  difficulty: enum (beginner, intermediate, advanced)

  // SEO
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  featuredImageUrl: string

  // Stats
  viewsCount: number (default: 0)
  likesCount: number (default: 0)

  // Timestamps
  createdAt: Date
  updatedAt: Date
  publishedAt: Date
  deletedAt: Date (soft delete)
}
```

### Content Version Entity (PostgreSQL)

```typescript
{
  id: UUID (primary key)
  contentId: UUID (foreign key)
  versionNumber: number
  snapshot: JSONB (full content state)
  changeSummary: string
  createdBy: UUID
  createdAt: Date
}
```

## 🛠️ Development Commands

```bash
# Start with auto-reload
npm run start:dev

# Build for production
npm run build

# Start production build
npm run start:prod

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## 🐛 Troubleshooting

### Port 3001 already in use

```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in .env
PORT=3002
```

### Database connection failed

1. Check Docker containers: `docker ps`
2. Restart containers:
   ```bash
   docker-compose -f infrastructure/docker/docker-compose.dev.yml restart
   ```
3. Check database credentials in `.env`

### TypeORM sync errors

If you see schema errors:

1. Stop the service
2. Drop the database:
   ```bash
   docker exec -it knowledge-hub-postgres psql -U dev -d knowledge_hub -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```
3. Restart the service (tables will be recreated)

### Module not found errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📁 Project Structure

```
services/content-service/
├── src/
│   ├── main.ts              # Bootstrap & configuration
│   ├── app.module.ts        # Root module
│   ├── health/              # Health check module
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   └── content/             # Content feature module
│       ├── entities/
│       │   ├── content.entity.ts
│       │   └── content-version.entity.ts
│       ├── dto/
│       │   ├── create-content.dto.ts
│       │   ├── update-content.dto.ts
│       │   └── content-response.dto.ts
│       ├── content.service.ts
│       ├── content.controller.ts
│       └── content.module.ts
├── .env                     # Environment variables
├── .env.example             # Environment template
├── tsconfig.json            # TypeScript config
├── nest-cli.json            # NestJS CLI config
└── package.json             # Dependencies
```

## 🔐 Security Notes

**Development Mode**: Current configuration uses:

- Synchronize: true (auto-creates tables)
- Weak credentials (dev/dev_password)
- CORS enabled for localhost

**For Production**:

- Disable synchronize, use migrations
- Use strong passwords from secrets management
- Restrict CORS to production domains
- Enable rate limiting
- Add authentication/authorization

## 📖 Next Steps

1. **Version Control** (MS-CONTENT-002):
   - Implement automatic version creation on updates
   - Add GET /contents/:id/versions endpoint
   - Version comparison logic

2. **Draft Management** (MS-CONTENT-003):
   - Create Draft schema in MongoDB
   - Draft auto-save functionality
   - Draft → Content publish flow

3. **Authentication**:
   - JWT validation middleware
   - User context injection
   - Authorization guards

4. **Testing**:
   - Unit tests for service methods
   - Integration tests for API endpoints
   - E2E tests for complete workflows

## 📝 API Examples

### Complete Content Lifecycle

```bash
# 1. Create draft content
POST /api/v1/contents
{
  "title": "My Article",
  "slug": "my-article",
  "contentType": "article",
  "authorId": "uuid-here",
  "status": "draft"
}

# Response: { id: "content-uuid", status: "draft", ... }

# 2. Update content
PATCH /api/v1/contents/{content-uuid}
{
  "description": "Updated description"
}

# 3. Publish content
POST /api/v1/contents/{content-uuid}/publish

# Response: { status: "published", publishedAt: "2026-01-27T..." }

# 4. View content (increments view count)
GET /api/v1/contents/{content-uuid}

# 5. Like content
POST /api/v1/contents/{content-uuid}/like

# 6. Get by slug (SEO-friendly URL)
GET /api/v1/contents/slug/my-article
```

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## 📄 License

MIT
