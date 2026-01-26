#!/usr/bin/env bash
# Kong Gateway Setup Script
# This script configures Kong Gateway with service routes and plugins

set -e

KONG_ADMIN_URL="${KONG_ADMIN_URL:-http://localhost:8001}"

echo "🚀 Kong Gateway Configuration Script"
echo "======================================"
echo "Kong Admin URL: $KONG_ADMIN_URL"
echo ""

# Wait for Kong to be ready
echo "⏳ Waiting for Kong Admin API..."
until curl -s -o /dev/null -w "%{http_code}" "$KONG_ADMIN_URL" | grep -q "200"; do
  printf '.'
  sleep 2
done
echo " ✓ Kong is ready!"
echo ""

# Function to create or update a service
create_service() {
  local service_name=$1
  local service_url=$2
  
  echo "📦 Configuring service: $service_name"
  
  # Check if service exists
  if curl -s "$KONG_ADMIN_URL/services/$service_name" | grep -q "name"; then
    echo "  ↻ Updating existing service..."
    curl -s -X PATCH "$KONG_ADMIN_URL/services/$service_name" \
      -d "url=$service_url" \
      > /dev/null
  else
    echo "  + Creating new service..."
    curl -s -X POST "$KONG_ADMIN_URL/services" \
      -d "name=$service_name" \
      -d "url=$service_url" \
      > /dev/null
  fi
  
  echo "  ✓ Service configured"
}

# Function to create a route
create_route() {
  local service_name=$1
  local route_name=$2
  local path=$3
  
  echo "🛣️  Configuring route: $route_name"
  
  # Check if route exists
  if curl -s "$KONG_ADMIN_URL/services/$service_name/routes/$route_name" | grep -q "name"; then
    echo "  ↻ Route already exists, skipping..."
  else
    echo "  + Creating route..."
    curl -s -X POST "$KONG_ADMIN_URL/services/$service_name/routes" \
      -d "name=$route_name" \
      -d "paths[]=$path" \
      -d "strip_path=false" \
      > /dev/null
    echo "  ✓ Route configured"
  fi
}

# Function to add a plugin to a service
add_plugin() {
  local service_name=$1
  local plugin_name=$2
  
  echo "🔌 Adding plugin: $plugin_name to $service_name"
  
  curl -s -X POST "$KONG_ADMIN_URL/services/$service_name/plugins" \
    -d "name=$plugin_name" \
    > /dev/null 2>&1 || echo "  ⚠️  Plugin may already exist"
  
  echo "  ✓ Plugin configured"
}

echo "🔧 Configuring services..."
echo ""

# Auth Service
create_service "auth-service" "http://host.docker.internal:3001"
create_route "auth-service" "auth-routes" "/api/v1/auth"
add_plugin "auth-service" "rate-limiting"
add_plugin "auth-service" "cors"
echo ""

# Content Service
create_service "content-service" "http://host.docker.internal:3002"
create_route "content-service" "content-routes" "/api/v1/content"
add_plugin "content-service" "rate-limiting"
add_plugin "content-service" "cors"
echo ""

# Comment Service
create_service "comment-service" "http://host.docker.internal:3003"
create_route "comment-service" "comment-routes" "/api/v1/comments"
add_plugin "comment-service" "rate-limiting"
add_plugin "comment-service" "cors"
echo ""

# Media Service
create_service "media-service" "http://host.docker.internal:3004"
create_route "media-service" "media-routes" "/api/v1/media"
add_plugin "media-service" "rate-limiting"
add_plugin "media-service" "cors"
echo ""

# Search Service
create_service "search-service" "http://host.docker.internal:3005"
create_route "search-service" "search-routes" "/api/v1/search"
add_plugin "search-service" "rate-limiting"
add_plugin "search-service" "cors"
echo ""

# Analytics Service
create_service "analytics-service" "http://host.docker.internal:3006"
create_route "analytics-service" "analytics-routes" "/api/v1/analytics"
add_plugin "analytics-service" "rate-limiting"
add_plugin "analytics-service" "cors"
echo ""

echo "======================================"
echo "✅ Kong Gateway configuration complete!"
echo ""
echo "📊 Kong Admin UI: http://localhost:8002"
echo "🔗 Gateway Proxy: http://localhost:8000"
echo "🔧 Admin API: http://localhost:8001"
echo ""
echo "Test a route:"
echo "curl http://localhost:8000/api/v1/auth/health"
