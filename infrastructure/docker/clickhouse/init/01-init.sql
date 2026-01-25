-- Create analytics database
CREATE DATABASE IF NOT EXISTS analytics;

-- Create events table
CREATE TABLE IF NOT EXISTS analytics.events
(
    event_id UUID DEFAULT generateUUIDv4(),
    event_type String,
    user_id Nullable(String),
    timestamp DateTime DEFAULT now(),
    properties String,
    INDEX idx_event_type event_type TYPE bloom_filter(0.01) GRANULARITY 1,
    INDEX idx_user_id user_id TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY (event_type, timestamp)
PARTITION BY toYYYYMM(timestamp)
TTL timestamp + INTERVAL 365 DAY;

-- Create page_views table
CREATE TABLE IF NOT EXISTS analytics.page_views
(
    view_id UUID DEFAULT generateUUIDv4(),
    content_id String,
    user_id Nullable(String),
    session_id String,
    timestamp DateTime DEFAULT now(),
    duration_seconds UInt32,
    INDEX idx_content_id content_id TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree()
ORDER BY (content_id, timestamp)
PARTITION BY toYYYYMM(timestamp)
TTL timestamp + INTERVAL 365 DAY;
