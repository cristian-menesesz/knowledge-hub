-- Media Service Database Schema
-- Description: Stores metadata for uploaded media files

CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    url TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    uploaded_by UUID,
    content_id UUID,
    thumbnail_path TEXT,
    optimized_path TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_content ON media_files(content_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media_files(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_media_deleted ON media_files(deleted_at);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media_files(mime_type) WHERE deleted_at IS NULL;

-- Comments for documentation
COMMENT ON TABLE media_files IS 'Stores metadata for uploaded media files (images, videos, etc.)';
COMMENT ON COLUMN media_files.id IS 'Unique identifier (UUID) for the media file';
COMMENT ON COLUMN media_files.filename IS 'Original filename as uploaded by user';
COMMENT ON COLUMN media_files.stored_filename IS 'UUID-based filename stored on disk';
COMMENT ON COLUMN media_files.file_path IS 'Relative path from media root (e.g., originals/uuid.jpg)';
COMMENT ON COLUMN media_files.url IS 'Public URL to access the file';
COMMENT ON COLUMN media_files.size_bytes IS 'File size in bytes';
COMMENT ON COLUMN media_files.mime_type IS 'MIME type (e.g., image/jpeg)';
COMMENT ON COLUMN media_files.width IS 'Image width in pixels (null for non-images)';
COMMENT ON COLUMN media_files.height IS 'Image height in pixels (null for non-images)';
COMMENT ON COLUMN media_files.uploaded_by IS 'Foreign key to users table (optional)';
COMMENT ON COLUMN media_files.content_id IS 'Foreign key to content table (optional)';
COMMENT ON COLUMN media_files.thumbnail_path IS 'Path to generated thumbnail (Phase 3+)';
COMMENT ON COLUMN media_files.optimized_path IS 'Path to optimized version (WebP) (Phase 3+)';
COMMENT ON COLUMN media_files.deleted_at IS 'Soft delete timestamp (NULL = not deleted)';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_media_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_media_updated_at();

-- Sample queries for reference
-- 1. Get all media files for a content item:
--    SELECT * FROM media_files WHERE content_id = 'uuid' AND deleted_at IS NULL;
--
-- 2. Get user's uploaded files:
--    SELECT * FROM media_files WHERE uploaded_by = 'uuid' AND deleted_at IS NULL ORDER BY created_at DESC;
--
-- 3. Get total storage used:
--    SELECT SUM(size_bytes) FROM media_files WHERE deleted_at IS NULL;
--
-- 4. Clean up soft-deleted files older than 30 days:
--    DELETE FROM media_files WHERE deleted_at < NOW() - INTERVAL '30 days';
