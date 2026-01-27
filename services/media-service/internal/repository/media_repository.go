package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/model"
	_ "github.com/lib/pq"
)

// MediaRepository handles database operations for media files
type MediaRepository struct {
	db *sql.DB
}

// NewMediaRepository creates a new media repository
func NewMediaRepository(db *sql.DB) *MediaRepository {
	return &MediaRepository{db: db}
}

// Create inserts a new media file record
func (r *MediaRepository) Create(media *model.MediaFile) error {
	query := `
		INSERT INTO media_files (
			id, filename, stored_filename, file_path, url, 
			size_bytes, mime_type, width, height, 
			uploaded_by, content_id, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		media.ID,
		media.Filename,
		media.StoredFilename,
		media.FilePath,
		media.URL,
		media.SizeBytes,
		media.MimeType,
		media.Width,
		media.Height,
		media.UploadedBy,
		media.ContentID,
		time.Now(),
		time.Now(),
	).Scan(&media.ID, &media.CreatedAt, &media.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create media record: %w", err)
	}

	return nil
}

// FindByID retrieves a media file by ID
func (r *MediaRepository) FindByID(id string) (*model.MediaFile, error) {
	query := `
		SELECT 
			id, filename, stored_filename, file_path, url,
			size_bytes, mime_type, width, height,
			uploaded_by, content_id, thumbnail_path, optimized_path,
			created_at, updated_at, deleted_at
		FROM media_files
		WHERE id = $1 AND deleted_at IS NULL
	`

	media := &model.MediaFile{}
	err := r.db.QueryRow(query, id).Scan(
		&media.ID,
		&media.Filename,
		&media.StoredFilename,
		&media.FilePath,
		&media.URL,
		&media.SizeBytes,
		&media.MimeType,
		&media.Width,
		&media.Height,
		&media.UploadedBy,
		&media.ContentID,
		&media.ThumbnailPath,
		&media.OptimizedPath,
		&media.CreatedAt,
		&media.UpdatedAt,
		&media.DeletedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("media file not found")
		}
		return nil, fmt.Errorf("failed to find media file: %w", err)
	}

	return media, nil
}

// FindAll retrieves media files with pagination and filters
func (r *MediaRepository) FindAll(query model.PaginationQuery) ([]model.MediaFile, int64, error) {
	// Build query with filters
	baseQuery := `
		SELECT 
			id, filename, stored_filename, file_path, url,
			size_bytes, mime_type, width, height,
			uploaded_by, content_id, thumbnail_path, optimized_path,
			created_at, updated_at
		FROM media_files
		WHERE deleted_at IS NULL
	`

	countQuery := `SELECT COUNT(*) FROM media_files WHERE deleted_at IS NULL`

	args := []interface{}{}
	argCount := 1

	// Add filters
	if query.ContentID != nil {
		baseQuery += fmt.Sprintf(" AND content_id = $%d", argCount)
		countQuery += fmt.Sprintf(" AND content_id = $%d", argCount)
		args = append(args, *query.ContentID)
		argCount++
	}

	if query.UploadedBy != nil {
		baseQuery += fmt.Sprintf(" AND uploaded_by = $%d", argCount)
		countQuery += fmt.Sprintf(" AND uploaded_by = $%d", argCount)
		args = append(args, *query.UploadedBy)
		argCount++
	}

	// Get total count
	var total int64
	if err := r.db.QueryRow(countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("failed to count media files: %w", err)
	}

	// Add pagination
	offset := (query.Page - 1) * query.Limit
	baseQuery += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, query.Limit, offset)

	// Execute query
	rows, err := r.db.Query(baseQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query media files: %w", err)
	}
	defer rows.Close()

	// Scan results
	var mediaFiles []model.MediaFile
	for rows.Next() {
		var media model.MediaFile
		err := rows.Scan(
			&media.ID,
			&media.Filename,
			&media.StoredFilename,
			&media.FilePath,
			&media.URL,
			&media.SizeBytes,
			&media.MimeType,
			&media.Width,
			&media.Height,
			&media.UploadedBy,
			&media.ContentID,
			&media.ThumbnailPath,
			&media.OptimizedPath,
			&media.CreatedAt,
			&media.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan media file: %w", err)
		}
		mediaFiles = append(mediaFiles, media)
	}

	if err = rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("error iterating media files: %w", err)
	}

	return mediaFiles, total, nil
}

// SoftDelete marks a media file as deleted
func (r *MediaRepository) SoftDelete(id string) error {
	query := `UPDATE media_files SET deleted_at = $1, updated_at = $2 WHERE id = $3 AND deleted_at IS NULL`

	result, err := r.db.Exec(query, time.Now(), time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to delete media file: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return fmt.Errorf("media file not found or already deleted")
	}

	return nil
}
