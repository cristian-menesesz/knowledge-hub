-- Knowledge Hub Platform - Multiple Database Creation
-- This script creates separate databases for each microservice

-- Auth Service Database
CREATE DATABASE auth_db;
COMMENT ON DATABASE auth_db IS 'Authentication and User Management Service';

-- Content Service Database
CREATE DATABASE content_db;
COMMENT ON DATABASE content_db IS 'Content Management Service';

-- Comment/Discussion Service Database
CREATE DATABASE comment_db;
COMMENT ON DATABASE comment_db IS 'Discussion and Comment Service';

-- Media/Asset Service Database
CREATE DATABASE asset_db;
COMMENT ON DATABASE asset_db IS 'Media and Asset Metadata Service';

-- Grant all privileges to postgres user
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE content_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE comment_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE asset_db TO postgres;

-- Add extensions to auth_db
\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add extensions to content_db
\c content_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- Add extensions to comment_db
\c comment_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add extensions to asset_db
\c asset_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
