-- Create main database
CREATE DATABASE IF NOT EXISTS knowledge_hub_dev;

-- Create user if not exists
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles WHERE rolname = 'kh_app'
   ) THEN
      CREATE ROLE kh_app LOGIN PASSWORD 'kh_app_dev_password';
   END IF;
END
$do$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE knowledge_hub_dev TO kh_app;

-- Connect to knowledge_hub_dev
\c knowledge_hub_dev;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO kh_app;
