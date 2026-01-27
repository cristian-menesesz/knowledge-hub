# Phase 2.2: Deployment Strategy Update

**Date**: January 27, 2026  
**Status**: Architecture Shift - AWS Full Stack → EC2 + EBS Minimal

---

## 🎯 Strategic Decision

**Original Plan**: Full AWS cloud-native (S3, CloudFront, ECS, RDS, ElastiCache)  
**Revised Plan**: Simplified EC2 + EBS deployment for budget optimization

### Why the Change?

1. **Cost Optimization**: $0-12/month vs $150-300/month
2. **Learning Focus**: Mastering fundamentals before cloud abstractions
3. **MVP Pragmatism**: Avoiding over-engineering for initial phases
4. **Gradual Migration**: Easy path to cloud services later via abstraction layers

---

## 📊 Deployment Architecture Comparison

### Original (AWS Full Stack)

```
├── Compute: ECS/EKS ($50-100/month)
├── Storage: S3 ($20-40/month)
├── CDN: CloudFront ($10-30/month)
├── Database: RDS ($30-50/month)
├── Cache: ElastiCache ($15-30/month)
├── Monitoring: CloudWatch ($10-20/month)
└── Total: $150-300/month
```

### Revised (EC2 + EBS Minimal)

```
├── Compute: EC2 t3.micro (FREE for 12 months, then $9/month)
├── Storage: EBS 30GB (FREE for 6 months, then $3/month)
├── Database: PostgreSQL (containerized, included)
├── Cache: Redis (containerized, included)
├── Orchestration: Docker Compose
└── Total: $0-12/month
```

---

## 🏗️ Current Architecture (Phase 2-6)

### Infrastructure Layout

```
EC2 Instance (t3.micro → t3.small → t3.medium)
│
├── Docker Compose
│   ├── Content Service (NestJS) - Port 3001 ✅
│   ├── Media Service (Go) - Port 3004 🔄 Phase 2.2
│   ├── User Service (NestJS) - Port 3002 ⏳ Phase 3
│   ├── Comment Service (NestJS) - Port 3003 ⏳ Phase 4
│   ├── Kong Gateway - Port 8000
│   ├── PostgreSQL - Port 5432
│   ├── MongoDB - Port 27017
│   └── Redis - Port 6379
│
├── EBS Volume (30GB → 50GB → 100GB)
│   └── /var/media/
│       ├── originals/    (user uploads)
│       ├── thumbnails/   (auto-generated)
│       ├── optimized/    (WebP conversions)
│       └── temp/         (processing staging)
│
└── Nginx (static file serving)
    └── /media/* → /var/media/originals/
```

### Capacity Planning

| EBS Size         | Cost/Month   | Image Count | Use Case     |
| ---------------- | ------------ | ----------- | ------------ |
| 30GB (Free Tier) | $0 (6mo), $3 | ~7,000      | MVP/Testing  |
| 50GB             | $5           | ~17,500     | Alpha Launch |
| 100GB            | $10          | ~35,000     | Beta Launch  |
| 200GB            | $20          | ~70,000     | Production   |

_Assuming 3MB average image size + thumbnails_

---

## 🚀 Phase 2.2: Media Service Implementation

### Service Specification

**Technology Stack**:

- **Language**: Go 1.21+
- **API**: HTTP REST (gRPC deferred to Phase 6+)
- **Storage**: Local file system (EBS-backed)
- **Database**: PostgreSQL (metadata only)
- **Serving**: Nginx static files

**Core Features** (MVP):

1. ✅ File upload (multipart/form-data)
2. ✅ File storage (UUID-based naming)
3. ✅ Metadata extraction (dimensions, MIME type, size)
4. ✅ PostgreSQL metadata storage
5. ✅ File retrieval API
6. ✅ Basic validation (type, size limits)

**Deferred Features** (Phase 3+):

- ⏳ Image optimization (WebP conversion)
- ⏳ Thumbnail generation
- ⏳ CDN integration
- ⏳ gRPC API
- ⏳ Advanced compression

---

## 🗄️ Storage Architecture

### File System Structure

```
/var/media/
├── originals/
│   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg
│   ├── f9e8d7c6-b5a4-3210-9876-543210fedcba.png
│   └── ...
│
├── thumbnails/ (Phase 3+)
│   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890_thumb.jpg
│   └── ...
│
├── optimized/ (Phase 3+)
│   ├── a1b2c3d4-e5f6-7890-abcd-ef1234567890.webp
│   └── ...
│
└── temp/
    └── (upload staging, auto-cleaned)
```

### Database Schema

```sql
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,           -- Original filename
    stored_filename VARCHAR(255) NOT NULL,    -- UUID-based name
    file_path TEXT NOT NULL,                  -- /var/media/originals/uuid.ext
    url TEXT NOT NULL,                        -- http://domain/media/uuid.ext
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID,                         -- FK to users.id
    content_id UUID,                          -- FK to content.id (optional)
    thumbnail_path TEXT,                      -- Phase 3+
    optimized_path TEXT,                      -- Phase 3+
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP                      -- Soft delete
);

CREATE INDEX idx_media_content ON media_files(content_id);
CREATE INDEX idx_media_uploaded ON media_files(uploaded_by);
CREATE INDEX idx_media_deleted ON media_files(deleted_at);
```

**Why NOT Store Images in Database?**

- Database row: ~150 bytes per image
- Image binary: ~3,000,000 bytes (3MB)
- File system optimized for blob storage
- Database optimized for indexed queries
- Separation of concerns

---

## 🔌 API Endpoints

### POST /api/v1/media/upload

**Request**:

```http
POST /api/v1/media/upload
Content-Type: multipart/form-data

file: [binary]
uploadedBy: uuid (optional)
contentId: uuid (optional)
```

**Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "vacation-photo.jpg",
  "url": "http://localhost:8000/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "size": 2048576,
  "mimeType": "image/jpeg",
  "width": 1920,
  "height": 1080,
  "createdAt": "2026-01-27T10:30:00Z"
}
```

**Validation**:

- Max size: 10MB
- Allowed types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- Max dimensions: 4000x4000px

### GET /api/v1/media/:id

**Response**:

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "filename": "vacation-photo.jpg",
  "url": "http://localhost:8000/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890.jpg",
  "size": 2048576,
  "mimeType": "image/jpeg",
  "width": 1920,
  "height": 1080,
  "uploadedBy": "user-uuid",
  "contentId": "content-uuid",
  "createdAt": "2026-01-27T10:30:00Z"
}
```

### GET /api/v1/media

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `contentId` (filter by content)
- `uploadedBy` (filter by user)

**Response**:

```json
{
  "data": [
    /* media objects */
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### DELETE /api/v1/media/:id

Soft delete (sets `deleted_at`), physical cleanup via cron job.

---

## 🐳 Docker Configuration

### docker-compose.yml Addition

```yaml
media-service:
  build: ./services/media-service
  container_name: knowledge-hub-media
  ports:
    - '3004:3004'
  volumes:
    - media_storage:/var/media
    - ./services/media-service:/app
  environment:
    - PORT=3004
    - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/knowledge_hub
    - UPLOAD_DIR=/var/media
    - MAX_FILE_SIZE=10485760 # 10MB
  depends_on:
    - postgres
  networks:
    - knowledge-hub
  deploy:
    resources:
      limits:
        cpus: '0.3'
        memory: 256M
  healthcheck:
    test: ['CMD', 'wget', '--quiet', '--tries=1', '--spider', 'http://localhost:3004/health']
    interval: 30s
    timeout: 10s
    retries: 3

volumes:
  media_storage:
    driver: local
```

---

## 🌐 Nginx Configuration

```nginx
# /etc/nginx/conf.d/media.conf
server {
    listen 80;
    server_name localhost;

    # Media file serving
    location /media/ {
        alias /var/media/originals/;

        # Cache headers
        expires 1y;
        add_header Cache-Control "public, immutable";

        # CORS
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";

        # Security
        add_header X-Content-Type-Options "nosniff";

        # Logging
        access_log /var/log/nginx/media_access.log;
        error_log /var/log/nginx/media_error.log;
    }

    # Optional: Thumbnail serving (Phase 3+)
    location /media/thumbs/ {
        alias /var/media/thumbnails/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔐 Kong Gateway Registration

```yaml
# infrastructure/kong/kong.yml
services:
  - name: media-service
    url: http://host.docker.internal:3004
    tags:
      - media
      - files
    routes:
      - name: media-upload
        paths:
          - /api/v1/media
        methods:
          - POST
          - GET
          - DELETE
        strip_path: false
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          policy: local
      - name: cors
        config:
          origins:
            - http://localhost:3000
            - http://localhost:8080
          methods:
            - GET
            - POST
            - DELETE
            - OPTIONS
          headers:
            - Accept
            - Content-Type
            - Authorization
          credentials: true
          max_age: 3600
      - name: request-size-limiting
        config:
          allowed_payload_size: 10 # 10MB
```

---

## 🧪 Testing Strategy

### Unit Tests

```go
// services/media-service/internal/service/upload_test.go
func TestUploadImage(t *testing.T) {
    // Test valid image upload
    // Test invalid file type rejection
    // Test size limit enforcement
    // Test dimension extraction
}
```

### Integration Tests

```bash
# Upload test
curl -X POST http://localhost:3004/api/v1/media/upload \
  -F "file=@test-image.jpg" \
  -F "uploadedBy=user-123"

# Retrieve test
curl http://localhost:3004/api/v1/media/{id}

# List test
curl http://localhost:3004/api/v1/media?page=1&limit=10
```

### Load Tests (Phase 4+)

```bash
# Apache Bench
ab -n 1000 -c 10 -p image.jpg -T multipart/form-data \
  http://localhost:3004/api/v1/media/upload
```

---

## 📈 Migration Path to Cloud Services

### Phase 7+: Optional Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: media-service
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: media-service
          volumeMounts:
            - name: media-storage
              mountPath: /var/media
      volumes:
        - name: media-storage
          persistentVolumeClaim:
            claimName: media-pvc
```

### Phase 8+: Optional S3 Migration

```go
// Storage interface abstraction (already in place)
type StorageBackend interface {
    Save(file io.Reader, path string) error
    Get(path string) (io.Reader, error)
    Delete(path string) error
}

// Local file system implementation (Phase 2-6)
type LocalStorage struct { /* ... */ }

// S3 implementation (Phase 8+)
type S3Storage struct { /* ... */ }

// Factory pattern
func NewStorage(config Config) StorageBackend {
    if config.UseS3 {
        return NewS3Storage(config)
    }
    return NewLocalStorage(config)
}
```

### Phase 10+: Optional CloudFront CDN

- Add CloudFront distribution
- Update URL generation to use CDN domain
- Keep EBS/S3 as origin
- Zero code changes in media service

---

## 💰 Cost Projections

### Month 1-6 (Free Tier)

- EC2 t3.micro: **$0** (12-month free tier)
- EBS 30GB: **$0** (6-month free tier)
- **Total: $0/month**

### Month 7-12 (Partial Free Tier)

- EC2 t3.micro: **$0** (still in 12-month window)
- EBS 30GB: **$3/month** (free tier expired)
- **Total: $3/month**

### Month 13+ (Production)

- EC2 t3.small: **$17/month**
- EBS 50GB: **$5/month**
- **Total: $22/month**

### Scale-up (Beta/Production)

- EC2 t3.medium: **$35/month**
- EBS 100GB: **$10/month**
- **Total: $45/month**

### Future Cloud Services (Optional)

- Add S3: +$5-10/month
- Add CloudFront: +$10-20/month
- Migrate to RDS: +$30-50/month
- **Total: $90-125/month** (still 50% savings vs original plan)

---

## ✅ Success Criteria (Phase 2.2)

- [x] Go media service builds and runs
- [x] Upload endpoint accepts images <10MB
- [x] Files stored in `/var/media/originals/`
- [x] Metadata stored in PostgreSQL
- [x] Retrieval endpoint returns correct data
- [x] Nginx serves files with cache headers
- [x] Kong Gateway proxies media endpoints
- [x] Docker Compose orchestrates all services
- [x] Documentation complete
- [x] Tests pass (unit + integration)

---

## 📚 References

- [AWS Free Tier](https://aws.amazon.com/free/)
- [EBS Pricing](https://aws.amazon.com/ebs/pricing/)
- [EC2 Pricing](https://aws.amazon.com/ec2/pricing/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Go Image Package](https://pkg.go.dev/image)
- [Nginx Static Files](https://nginx.org/en/docs/http/ngx_http_core_module.html#alias)

---

**Next Steps**: Implement Phase 2.2 Media Service with this architecture.
