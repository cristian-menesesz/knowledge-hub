# Phase 1.1: Database & Data Layer Setup

## ✅ Completed Implementation

This phase establishes the database infrastructure for the Knowledge Hub platform using a
microservices architecture pattern.

## 🗄️ Database Architecture

### PostgreSQL - Multiple Databases

Each microservice has its own isolated database:

- **auth_db** - Authentication and User Management
- **content_db** - Content Management
- **comment_db** - Discussions and Comments
- **asset_db** - Media and Asset Metadata

**Extensions Enabled:**

- `uuid-ossp` - UUID generation
- `pgcrypto` - Encryption functions
- `pg_trgm` - Full-text search (content_db only)

### MongoDB - Flexible Document Storage

- **content_drafts** database - Auto-save drafts with block-based structure
- Flexible schema for evolving editor features
- Fast writes for real-time auto-save

### Redis - Caching & Sessions

- Session storage (optional, can use PostgreSQL initially)
- API response caching
- Rate limiting counters

## 📦 Services Created

### Auth Service

**Location:** `apps/services/auth-service`

**Database:** PostgreSQL (auth_db)

**Schema:**

- `users` - User accounts with OAuth support
- `sessions` - JWT refresh token management

**Features:**

- UUID primary keys
- OAuth provider support (GitHub, Google)
- Role-based access control (ADMIN, CONTRIBUTOR, READER)
- Session tracking with device info

### Content Service

**Location:** `apps/services/content-service`

**Databases:**

- PostgreSQL (content_db) - Published content metadata
- MongoDB - Draft content with block structure

**PostgreSQL Schema:**

- `content` - Published content metadata
- `content_versions` - Version history snapshots
- `tags` - Cross-cutting tags
- `content_tags` - Many-to-many tag relationships
- `concepts` - Hierarchical domain taxonomy
- `content_concepts` - Many-to-many concept relationships
- `content_links` - Bidirectional wiki-style links

**Content Types Supported:**

- Article
- Experiment
- Code Snippet
- Deep Dive
- Definition
- Architecture Diagram
- Project Log
- Reference Guide
- Tutorial

**MongoDB Collection:**

- `drafts` - Block-based draft storage

## 🚀 Getting Started

### 1. Start Databases

```bash
# Start all databases
docker-compose up -d postgres mongodb redis

# Verify they're running
docker-compose ps
```

### 2. Install Dependencies

```bash
# Install Auth Service dependencies
cd apps/services/auth-service
npm install

# Install Content Service dependencies
cd ../content-service
npm install
```

### 3. Configure Environment

```bash
# Auth Service
cd apps/services/auth-service
cp .env.example .env
# Edit .env with your settings

# Content Service
cd ../content-service
cp .env.example .env
# Edit .env with your settings
```

### 4. Run Migrations

```bash
# Auth Service - Create database schema
cd apps/services/auth-service
npx prisma migrate dev --name init

# Content Service - Create database schema
cd ../content-service
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
# Auth Service
cd apps/services/auth-service
npx prisma generate

# Content Service
cd ../content-service
npx prisma generate
```

### 6. Explore Database (Optional)

```bash
# Open Prisma Studio for Auth Service
cd apps/services/auth-service
npm run prisma:studio

# Open Prisma Studio for Content Service
cd ../content-service
npm run prisma:studio
```

## 📊 Database Schema Visualizations

### Auth Service Schema

```
users
├─ id (uuid, PK)
├─ email (unique)
├─ username (unique)
├─ passwordHash (nullable for OAuth)
├─ oauthProvider (github/google/null)
├─ oauthId
├─ role (ADMIN/CONTRIBUTOR/READER)
└─ timestamps

sessions
├─ id (uuid, PK)
├─ userId (FK → users)
├─ refreshToken (unique)
├─ userAgent
├─ expiresAt
└─ timestamps
```

### Content Service Schema

```
content
├─ id (uuid, PK)
├─ title
├─ slug (unique)
├─ type (enum)
├─ status (DRAFT/PUBLISHED/ARCHIVED/SCHEDULED)
├─ authorId (no FK - microservices pattern)
├─ body (text, nullable)
├─ blockData (json, nullable)
├─ publishedAt
├─ readingTime
└─ timestamps

content_versions (version history)
├─ id (uuid, PK)
├─ contentId (FK → content)
├─ version (int)
├─ snapshot (json)
├─ changeNote
└─ timestamps

tags → content_tags ← content (many-to-many)

concepts (hierarchical)
├─ parentId (self-reference for tree structure)
└─ content_concepts ← content (many-to-many)

content_links (bidirectional wiki-style)
├─ sourceId (FK → content)
├─ targetId (FK → content)
└─ linkType (RELATED/PREREQUISITE/CONTINUATION/REFERENCE)
```

## 🔑 Key Design Decisions

### 1. **Database per Service**

Each microservice has its own database instance - no shared databases. This ensures:

- Service independence
- Separate scaling
- Clear ownership boundaries

### 2. **No Foreign Keys Across Services**

- `authorId` in Content Service is just a string, not a FK to Auth Service
- Cross-service data accessed via APIs or events
- Maintains microservices principles

### 3. **UUID Primary Keys**

- Better for distributed systems
- No auto-increment conflicts
- Secure (not guessable)

### 4. **Version Snapshots**

- Store full content snapshot in each version
- Simpler than diff-based versioning
- Easy rollback and comparison

### 5. **Hierarchical Concepts**

- Self-referencing for taxonomy tree
- Supports nested domain organization
- Flexible for future expansion

### 6. **Hybrid Content Storage**

- Simple content → PostgreSQL `body` field
- Complex content → PostgreSQL `blockData` JSON
- Drafts → MongoDB (flexible schema)

### 7. **Prisma over TypeORM**

- Better TypeScript DX
- Simpler migrations
- Auto-generated type-safe client

## 🧪 Testing Database Setup

### Test PostgreSQL Connection

```bash
# Connect to auth_db
docker exec -it knowledge-hub-postgres psql -U postgres -d auth_db

# List tables (should be empty before migration)
\dt

# Exit
\q
```

### Test MongoDB Connection

```bash
# Connect to MongoDB
docker exec -it knowledge-hub-mongodb mongosh -u mongo -p mongo

# Switch to drafts database
use content_drafts

# Check collections (will be created on first insert)
show collections

# Exit
exit
```

### Test Redis Connection

```bash
# Connect to Redis
docker exec -it knowledge-hub-redis redis-cli -a redis

# Test connection
PING
# Should return: PONG

# Exit
exit
```

## 📝 Next Steps (Phase 1.2 & 1.3)

- [ ] Implement Auth Service business logic (Phase 1.3)
- [ ] Add JWT authentication middleware
- [ ] Implement OAuth flows (GitHub, Google)
- [ ] Create Content Service CRUD operations (Phase 2.1)
- [ ] Set up API Gateway (Kong) (Phase 1.2)

## 🔧 Common Commands

```bash
# Reset database (WARNING: Deletes all data!)
npm run prisma:reset

# Create new migration after schema changes
npm run prisma:migrate:dev -- --name add_new_field

# Apply migrations in production
npm run prisma:migrate:deploy

# View database in browser
npm run prisma:studio

# Seed database with test data
npm run db:seed
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Redis Documentation](https://redis.io/documentation)

---

**Status:** ✅ Phase 1.1 Complete  
**Next Phase:** Phase 1.2 - API Gateway & Service Mesh
