# Docker Development Environment

## 🐳 Services

This Docker Compose setup provides all infrastructure services needed for local development:

| Service     | Port(s)    | Purpose                      | UI Access                  |
| ----------- | ---------- | ---------------------------- | -------------------------- |
| PostgreSQL  | 5432       | Primary relational database  | -                          |
| MongoDB     | 27017      | Document storage (drafts)    | -                          |
| Redis       | 6379       | Caching & sessions           | -                          |
| Meilisearch | 7700       | Full-text search engine      | http://localhost:7700      |
| ClickHouse  | 8123, 9000 | Analytics database           | http://localhost:8123/play |
| Kafka       | 29092      | Event streaming              | -                          |
| Zookeeper   | 2181       | Kafka coordination           | -                          |
| MinIO       | 9000, 9001 | S3-compatible object storage | http://localhost:9001      |
| Mailhog     | 1025, 8025 | Email testing                | http://localhost:8025      |

## 🚀 Quick Start

### 1. Copy Environment Variables

```bash
cp .env.example .env
```

### 2. Start All Services

```bash
docker compose up -d
```

### 3. Verify Services

```bash
docker compose ps
```

All services should show "healthy" status.

### 4. View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres
```

## 📊 Service Details

### PostgreSQL

**Connection String:**

```
postgresql://postgres:postgres_dev_password@localhost:5432/knowledge_hub_dev
```

**Features:**

- UUID support (uuid-ossp extension)
- Full-text search (pg_trgm extension)
- GIN indexing (btree_gin extension)

**Connect via CLI:**

```bash
docker compose exec postgres psql -U postgres -d knowledge_hub_dev
```

### MongoDB

**Connection String:**

```
mongodb://mongo:mongo_dev_password@localhost:27017/knowledge_hub_dev?authSource=admin
```

**Features:**

- Document validation for content_drafts
- Optimized indexes for queries

**Connect via CLI:**

```bash
docker compose exec mongodb mongosh -u mongo -p mongo_dev_password --authenticationDatabase admin
```

### Redis

**Connection String:**

```
redis://:redis_dev_password@localhost:6379
```

**Connect via CLI:**

```bash
docker compose exec redis redis-cli -a redis_dev_password
```

### Meilisearch

**Dashboard:** http://localhost:7700  
**API Key:** masterKey_dev_replace_in_production

**Features:**

- Typo-tolerant search
- Instant search results
- Faceted search support

**Test Connection:**

```bash
curl http://localhost:7700/health
```

### ClickHouse

**HTTP Interface:** http://localhost:8123  
**Native Protocol:** localhost:9000

**Credentials:**

- User: default
- Password: clickhouse_dev_password

**Play UI:** http://localhost:8123/play

**Connect via CLI:**

```bash
docker compose exec clickhouse clickhouse-client --password clickhouse_dev_password
```

### Kafka

**Broker:** localhost:29092

**Create Topic:**

```bash
docker compose exec kafka kafka-topics --create \
  --topic content-events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 1
```

**List Topics:**

```bash
docker compose exec kafka kafka-topics --list \
  --bootstrap-server localhost:9092
```

### MinIO

**Console:** http://localhost:9001  
**API:** http://localhost:9000

**Credentials:**

- Access Key: minio
- Secret Key: minio123_dev_password

**Create Bucket:**

```bash
docker compose exec minio mc alias set local http://localhost:9000 minio minio123_dev_password
docker compose exec minio mc mb local/content-assets
```

### Mailhog

**Web UI:** http://localhost:8025  
**SMTP:** localhost:1025

**Use in Application:**

```javascript
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025,
  ignoreTLS: true,
});
```

## 🛠️ Common Commands

### Start Services

```bash
# All services
docker compose up -d

# Specific services
docker compose up -d postgres redis mongodb
```

### Stop Services

```bash
# All services
docker compose down

# With volume cleanup
docker compose down -v
```

### Restart Service

```bash
docker compose restart postgres
```

### View Logs

```bash
# Follow all logs
docker compose logs -f

# Last 100 lines
docker compose logs --tail=100

# Specific service
docker compose logs -f postgres
```

### Check Health

```bash
docker compose ps
```

### Execute Commands

```bash
# PostgreSQL
docker compose exec postgres psql -U postgres

# MongoDB
docker compose exec mongodb mongosh

# Redis
docker compose exec redis redis-cli
```

## 🧹 Data Management

### Backup Data

**PostgreSQL:**

```bash
docker compose exec postgres pg_dump -U postgres knowledge_hub_dev > backup.sql
```

**MongoDB:**

```bash
docker compose exec mongodb mongodump --db knowledge_hub_dev --out /tmp/backup
docker compose cp mongodb:/tmp/backup ./backup
```

### Restore Data

**PostgreSQL:**

```bash
cat backup.sql | docker compose exec -T postgres psql -U postgres knowledge_hub_dev
```

**MongoDB:**

```bash
docker compose cp ./backup mongodb:/tmp/backup
docker compose exec mongodb mongorestore /tmp/backup
```

### Clear All Data

```bash
docker compose down -v
docker compose up -d
```

## 🔧 Troubleshooting

### Service Won't Start

1. Check logs:

   ```bash
   docker compose logs service-name
   ```

2. Check port conflicts:

   ```bash
   # Windows
   netstat -ano | findstr :5432

   # Linux/Mac
   lsof -i :5432
   ```

3. Restart service:
   ```bash
   docker compose restart service-name
   ```

### Connection Refused

1. Ensure service is healthy:

   ```bash
   docker compose ps
   ```

2. Check network:

   ```bash
   docker network inspect knowledge-hub-network
   ```

3. Verify environment variables in `.env`

### Performance Issues

1. Increase Docker resources (Docker Desktop → Settings → Resources)

2. Prune unused resources:
   ```bash
   docker system prune -a --volumes
   ```

### Database Initialization Fails

1. Remove volumes and recreate:
   ```bash
   docker compose down -v
   docker compose up -d
   ```

## 🔒 Security Notes

**Development Only:** These configurations are for local development only. DO NOT use in production.

**Production Checklist:**

- [ ] Change all default passwords
- [ ] Use secrets management (AWS Secrets Manager, Vault)
- [ ] Enable TLS/SSL for all services
- [ ] Configure proper network segmentation
- [ ] Implement backup strategies
- [ ] Set up monitoring and alerting
- [ ] Configure resource limits

## 📝 Environment Variables

See [.env.example](.env.example) for all available environment variables.

**Required Variables:**

- `POSTGRES_PASSWORD`
- `MONGO_PASSWORD`
- `REDIS_PASSWORD`
- `MEILI_MASTER_KEY`

**Optional Variables:**

- `NODE_ENV` (default: development)
- Service-specific ports (if defaults conflict)

## 🤝 Contributing

When adding new services to Docker Compose:

1. Add health check
2. Use environment variables for configuration
3. Document in this README
4. Update `.env.example`
5. Create initialization scripts if needed

---

**Last Updated**: January 25, 2026  
**Status**: Complete development environment
