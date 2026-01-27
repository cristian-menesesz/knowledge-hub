# Media/Asset Service

**Technology**: Go 1.21+  
**Port**: 3004  
**Storage**: Local file system (EBS-backed)  
**Database**: PostgreSQL (metadata only)

---

## Overview

The Media Service handles file uploads, storage, and metadata management for the Knowledge Hub
platform. It stores files on the local file system (EBS volume in production) and metadata in
PostgreSQL.

### Key Features

- ✅ File upload (multipart/form-data)
- ✅ File validation (type, size, dimensions)
- ✅ UUID-based file naming
- ✅ Image dimension extraction
- ✅ PostgreSQL metadata storage
- ✅ RESTful API
- ✅ Soft delete
- ✅ Pagination support
- ⏳ Thumbnail generation (Phase 3+)
- ⏳ WebP optimization (Phase 3+)

---

## Architecture

### Storage Strategy

**Files**: Stored on local file system at `/var/media/`  
**Metadata**: Stored in PostgreSQL

```
/var/media/
├── originals/     - Original uploaded files
├── thumbnails/    - Auto-generated thumbnails (Phase 3+)
├── optimized/     - WebP conversions (Phase 3+)
└── temp/          - Temporary upload staging
```

**Why NOT store images in database?**

- File systems optimized for binary blob storage
- Databases optimized for indexed queries
- Easier backups and migrations
- Better performance

### Database Schema

```sql
media_files (
    id UUID PRIMARY KEY,
    filename VARCHAR(255),           -- Original filename
    stored_filename VARCHAR(255),    -- UUID.ext
    file_path TEXT,                  -- originals/uuid.ext
    url TEXT,                        -- http://domain/media/uuid.ext
    size_bytes BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    uploaded_by UUID,
    content_id UUID,
    thumbnail_path TEXT,
    optimized_path TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
)
```

---

## API Endpoints

### POST /api/v1/media/upload

Upload a new file.

**Request** (multipart/form-data):

```
file: [binary]
uploadedBy: uuid (optional)
contentId: uuid (optional)
```

**Response** (201 Created):

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

**Example (curl)**:

```bash
curl -X POST http://localhost:3004/api/v1/media/upload \
  -F "file=@photo.jpg" \
  -F "uploadedBy=user-uuid" \
  -F "contentId=content-uuid"
```

---

### GET /api/v1/media/:id

Get media file metadata by ID.

**Response** (200 OK):

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

**Example**:

```bash
curl http://localhost:3004/api/v1/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### GET /api/v1/media

List media files with pagination and filters.

**Query Parameters**:

- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `contentId` (filter by content)
- `uploadedBy` (filter by user)

**Response** (200 OK):

```json
{
  "data": [
    {
      /* media object */
    },
    {
      /* media object */
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

**Examples**:

```bash
# Get first page
curl http://localhost:3004/api/v1/media?page=1&limit=20

# Filter by content
curl http://localhost:3004/api/v1/media?contentId=content-uuid

# Filter by user
curl http://localhost:3004/api/v1/media?uploadedBy=user-uuid
```

---

### DELETE /api/v1/media/:id

Soft delete a media file (sets `deleted_at` timestamp).

**Response**: 204 No Content

**Example**:

```bash
curl -X DELETE http://localhost:3004/api/v1/media/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### GET /health

Health check endpoint.

**Response** (200 OK):

```json
{
  "status": "healthy",
  "service": "media-service",
  "version": "1.0.0"
}
```

---

## Local Development

### Prerequisites

- Go 1.21+
- PostgreSQL 16+
- Docker & Docker Compose (recommended)

### Setup

1. **Install dependencies**:

```bash
cd services/media-service
go mod download
```

2. **Configure environment**:

```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migration**:

```bash
psql -h localhost -U postgres -d knowledge_hub -f migrations/001_create_media_files.sql
```

4. **Create media directory**:

```bash
mkdir -p /var/media/{originals,thumbnails,optimized,temp}
# Or on Windows:
# mkdir C:\var\media\originals
# mkdir C:\var\media\thumbnails
# mkdir C:\var\media\optimized
# mkdir C:\var\media\temp
```

5. **Run service**:

```bash
go run cmd/server/main.go
```

Service will start on `http://localhost:3004`

---

## Docker Deployment

### Build Image

```bash
docker build -t knowledge-hub-media-service .
```

### Run Container

```bash
docker run -d \
  --name media-service \
  -p 3004:3004 \
  -v media_storage:/var/media \
  -e DATABASE_URL=postgresql://postgres:postgres@postgres:5432/knowledge_hub \
  -e BASE_URL=http://localhost:8000 \
  knowledge-hub-media-service
```

### Docker Compose

See root `docker-compose.yml` for full configuration.

```bash
cd ../../
docker-compose up media-service
```

---

## Testing

### Manual Testing

**Upload a file**:

```bash
curl -X POST http://localhost:3004/api/v1/media/upload \
  -F "file=@test-image.jpg" \
  -F "uploadedBy=test-user"
```

**Get file metadata**:

```bash
curl http://localhost:3004/api/v1/media/{id}
```

**List files**:

```bash
curl http://localhost:3004/api/v1/media?page=1&limit=10
```

**Delete file**:

```bash
curl -X DELETE http://localhost:3004/api/v1/media/{id}
```

### Unit Tests

```bash
go test ./...
```

### Integration Tests

```bash
go test ./... -tags=integration
```

---

## Configuration

### Environment Variables

| Variable             | Description                        | Default                   |
| -------------------- | ---------------------------------- | ------------------------- |
| `PORT`               | HTTP server port                   | `3004`                    |
| `DATABASE_URL`       | PostgreSQL connection string       | `postgresql://...`        |
| `UPLOAD_DIR`         | Base directory for file storage    | `/var/media`              |
| `MAX_FILE_SIZE`      | Maximum upload size in bytes       | `10485760` (10MB)         |
| `BASE_URL`           | Base URL for file URLs             | `http://localhost:8000`   |
| `ALLOWED_MIME_TYPES` | Comma-separated allowed MIME types | `image/jpeg,image/png...` |
| `MAX_IMAGE_WIDTH`    | Maximum image width                | `4000`                    |
| `MAX_IMAGE_HEIGHT`   | Maximum image height               | `4000`                    |

---

## Project Structure

```
services/media-service/
├── cmd/
│   └── server/
│       └── main.go              # Entry point
├── internal/
│   ├── handler/
│   │   └── media_handler.go    # HTTP handlers
│   ├── service/
│   │   └── media_service.go    # Business logic
│   ├── repository/
│   │   └── media_repository.go # Database operations
│   └── model/
│       └── media.go             # Data models
├── pkg/
│   └── storage/
│       └── local.go             # Storage interface
├── migrations/
│   └── 001_create_media_files.sql
├── Dockerfile
├── go.mod
├── go.sum
├── .env.example
└── README.md
```

---

## Performance Considerations

### File System

- **EBS Volume**: Use SSD-backed (gp3) for better IOPS
- **Capacity**: Plan for ~3MB per image average
- **Backups**: Daily EBS snapshots recommended

### Database

- **Indexes**: Optimized for common queries (content_id, uploaded_by)
- **Connection Pool**: Max 25 connections
- **Query Optimization**: Uses prepared statements

### Caching

- **Nginx**: Serves files with 1-year cache headers
- **CDN Ready**: Easy to add CloudFront later

---

## Monitoring

### Health Check

```bash
curl http://localhost:3004/health
```

### Metrics (Future)

- Upload success rate
- Average file size
- Total storage used
- Upload latency
- Database query performance

---

## Security

### File Validation

- ✅ MIME type whitelisting
- ✅ File size limits
- ✅ Image dimension limits
- ⏳ Malware scanning (Phase 4+)

### Access Control

- Files stored with UUID names (non-guessable)
- Soft delete instead of immediate removal
- Optional: Add authentication middleware

### Storage Security

- Files stored outside web root
- Served via Nginx with proper headers
- No directory listing

---

## Future Enhancements (Phase 3+)

### Thumbnail Generation

- Auto-generate thumbnails on upload
- Multiple sizes (small, medium, large)
- Background processing

### Image Optimization

- Convert to WebP format
- Lossy/lossless compression
- Automatic quality adjustment

### CDN Integration

- CloudFront or Cloudflare
- Automatic cache invalidation
- Geographic distribution

### Advanced Features

- Video support
- PDF preview generation
- Image editing (crop, resize, filters)
- Batch upload
- Progress tracking

---

## Troubleshooting

### Upload Fails with "File Too Large"

- Check `MAX_FILE_SIZE` environment variable
- Ensure Nginx/Kong has appropriate size limits
- Verify disk space available

### Database Connection Error

- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity
- Run migration: `migrations/001_create_media_files.sql`

### Files Not Accessible

- Verify Nginx configuration
- Check file permissions on `/var/media`
- Ensure URLs generated correctly
- Check Kong Gateway routing

---

## Support

For issues, questions, or feature requests, please refer to the main project repository.

---

**Phase**: 2.2  
**Status**: ✅ Complete  
**Last Updated**: January 27, 2026
