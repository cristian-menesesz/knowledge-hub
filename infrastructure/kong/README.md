# Kong API Gateway Configuration

This directory contains Kong API Gateway configuration files and setup scripts for the Knowledge Hub
platform.

## Overview

Kong is our API Gateway that sits between the frontend and backend microservices. It provides:

- **Unified API Entry Point**: Single entry point for all microservices
- **Routing**: Intelligent request routing to appropriate services
- **Rate Limiting**: Protect services from abuse
- **CORS**: Cross-origin resource sharing configuration
- **Authentication**: JWT validation (future)
- **Logging & Monitoring**: Request/response logging and metrics
- **Load Balancing**: Distribute load across service instances

## Architecture

```
┌──────────────┐
│   Frontend   │
│ (Port 3000)  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   Kong Gateway       │
│   (Port 8000)        │
├──────────────────────┤
│ - Rate Limiting      │
│ - CORS               │
│ - Request ID         │
│ - Correlation ID     │
│ - Prometheus Metrics │
└──────┬───────────────┘
       │
       ├─────► Auth Service (3001)
       ├─────► Content Service (3002)
       ├─────► Comment Service (3003)
       ├─────► Media Service (3004)
       ├─────► Search Service (3005)
       └─────► Analytics Service (3006)
```

## Files

### `kong.yml`

Declarative configuration file defining:

- **Services**: Backend microservice definitions
- **Routes**: URL path routing rules
- **Plugins**: Applied features (rate limiting, CORS, etc.)
- **Upstreams**: Load balancing configuration

### `setup-kong.sh`

Bash script for programmatic Kong configuration via Admin API. Use this when you prefer imperative
configuration or need dynamic setup.

## Getting Started

### 1. Start Kong Gateway

```bash
# Start all infrastructure (includes Kong)
docker-compose up -d kong

# Check Kong is running
docker-compose ps kong
```

### 2. Verify Kong Admin API

```bash
# Check Kong status
curl http://localhost:8001/status

# List services
curl http://localhost:8001/services

# List routes
curl http://localhost:8001/routes
```

### 3. Apply Configuration (Optional)

If using the declarative config:

```bash
# Apply kong.yml configuration
docker-compose exec kong kong config db_import /path/to/kong.yml
```

If using the setup script:

```bash
# Make script executable
chmod +x infrastructure/kong/setup-kong.sh

# Run setup script
./infrastructure/kong/setup-kong.sh
```

## Service Routes

| Service           | Path                | Port | Methods                |
| ----------------- | ------------------- | ---- | ---------------------- |
| Auth Service      | `/api/v1/auth`      | 3001 | GET, POST, PUT, DELETE |
| Content Service   | `/api/v1/content`   | 3002 | GET, POST, PUT, DELETE |
| Comment Service   | `/api/v1/comments`  | 3003 | GET, POST, PUT, DELETE |
| Media Service     | `/api/v1/media`     | 3004 | GET, POST, PUT, DELETE |
| Search Service    | `/api/v1/search`    | 3005 | GET, POST              |
| Analytics Service | `/api/v1/analytics` | 3006 | GET, POST              |

## Accessing Services

### Direct Access (Development)

```bash
# Direct to service (bypasses Kong)
curl http://localhost:3001/api/v1/auth/health
```

### Through Kong Gateway (Production-like)

```bash
# Through Kong proxy
curl http://localhost:8000/api/v1/auth/health
```

## Plugins Configured

### Global Plugins

1. **Request ID**: Adds `X-Request-ID` header to every request
2. **Correlation ID**: Adds `X-Correlation-ID` for distributed tracing
3. **Prometheus**: Exposes metrics at `/metrics`

### Service-Level Plugins

1. **Rate Limiting**:
   - Auth: 100 requests/minute
   - Content: 200 requests/minute
   - Comment: 150 requests/minute
   - Media: 100 requests/minute
   - Search: 300 requests/minute
   - Analytics: 50 requests/minute

2. **CORS**:
   - Allowed origins: `http://localhost:3000`, `http://localhost:8080`
   - Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
   - Credentials: enabled
   - Max age: 3600s

## Kong Admin Interfaces

### Admin API

```bash
# Base URL
http://localhost:8001

# Common endpoints
http://localhost:8001/services
http://localhost:8001/routes
http://localhost:8001/plugins
http://localhost:8001/upstreams
http://localhost:8001/status
```

### Admin GUI (Future)

Kong Enterprise or Konga (open-source UI) can be added later for visual management.

## Testing Routes

```bash
# Test auth service through Kong
curl -i http://localhost:8000/api/v1/auth/health

# Test with rate limiting
for i in {1..110}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/api/v1/auth/test
done
# Should see 429 (Too Many Requests) after 100 requests

# Test CORS preflight
curl -i -X OPTIONS http://localhost:8000/api/v1/content \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST"
```

## Common Commands

```bash
# Reload Kong configuration
docker-compose exec kong kong reload

# View Kong logs
docker-compose logs -f kong

# Check Kong configuration validity
docker-compose exec kong kong check

# List all services
curl http://localhost:8001/services | jq '.data[].name'

# Get service details
curl http://localhost:8001/services/auth-service | jq '.'

# Delete a service
curl -X DELETE http://localhost:8001/services/auth-service

# Add a plugin dynamically
curl -X POST http://localhost:8001/services/auth-service/plugins \
  -d "name=request-transformer" \
  -d "config.add.headers=X-Custom-Header:value"
```

## Load Balancing (Future)

When scaling services horizontally:

```yaml
upstreams:
  - name: auth-upstream
    algorithm: round-robin
    targets:
      - target: auth-service-1:3001
        weight: 100
      - target: auth-service-2:3001
        weight: 100
      - target: auth-service-3:3001
        weight: 100
```

Update service to use upstream:

```yaml
services:
  - name: auth-service
    host: auth-upstream # Points to upstream instead of direct URL
    port: 80
```

## Security (Future Enhancements)

### JWT Authentication Plugin

```yaml
plugins:
  - name: jwt
    config:
      key_claim_name: kid
      secret_is_base64: false
      run_on_preflight: false
```

### IP Restriction

```yaml
plugins:
  - name: ip-restriction
    config:
      allow:
        - 10.0.0.0/8
        - 192.168.0.0/16
```

### Request Size Limiting

```yaml
plugins:
  - name: request-size-limiting
    config:
      allowed_payload_size: 10 # MB
```

## Monitoring

### Prometheus Metrics

```bash
# Kong metrics endpoint
curl http://localhost:8001/metrics

# Metrics include:
# - kong_http_requests_total
# - kong_http_status
# - kong_latency_ms
# - kong_bandwidth_bytes
```

### Health Checks

```bash
# Kong health
curl http://localhost:8001/status

# Service health (via upstreams)
curl http://localhost:8001/upstreams/auth-upstream/health
```

## Troubleshooting

### Kong not starting

```bash
# Check logs
docker-compose logs kong

# Check database connection
docker-compose exec kong-database pg_isready -U kong

# Run migrations manually
docker-compose run --rm kong kong migrations bootstrap
```

### Routes not working

```bash
# Verify service exists
curl http://localhost:8001/services/auth-service

# Verify route exists
curl http://localhost:8001/routes | jq '.data[] | select(.name == "auth-routes")'

# Check service connectivity
docker-compose exec kong curl http://host.docker.internal:3001/health
```

### Rate limiting not working

```bash
# Check plugin is enabled
curl http://localhost:8001/services/auth-service/plugins | jq '.data[] | select(.name == "rate-limiting")'

# Check plugin configuration
curl http://localhost:8001/plugins/{plugin-id}
```

## Resources

- [Kong Documentation](https://docs.konghq.com/)
- [Kong Declarative Config](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)
- [Kong Admin API Reference](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugin Hub](https://docs.konghq.com/hub/)

---

**Last Updated**: January 26, 2026  
**Status**: Phase 1.2 - API Gateway Setup Complete
