package model

import "time"

// MediaFile represents a media file metadata in the database
type MediaFile struct {
	ID             string     `json:"id" db:"id"`
	Filename       string     `json:"filename" db:"filename"`
	StoredFilename string     `json:"-" db:"stored_filename"`
	FilePath       string     `json:"-" db:"file_path"`
	URL            string     `json:"url" db:"url"`
	SizeBytes      int64      `json:"size" db:"size_bytes"`
	MimeType       string     `json:"mimeType" db:"mime_type"`
	Width          *int       `json:"width,omitempty" db:"width"`
	Height         *int       `json:"height,omitempty" db:"height"`
	UploadedBy     *string    `json:"uploadedBy,omitempty" db:"uploaded_by"`
	ContentID      *string    `json:"contentId,omitempty" db:"content_id"`
	ThumbnailPath  *string    `json:"thumbnailPath,omitempty" db:"thumbnail_path"`
	OptimizedPath  *string    `json:"optimizedPath,omitempty" db:"optimized_path"`
	CreatedAt      time.Time  `json:"createdAt" db:"created_at"`
	UpdatedAt      time.Time  `json:"updatedAt" db:"updated_at"`
	DeletedAt      *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}

// UploadRequest represents an upload request
type UploadRequest struct {
	UploadedBy *string `json:"uploadedBy"`
	ContentID  *string `json:"contentId"`
}

// PaginationQuery represents pagination parameters
type PaginationQuery struct {
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	ContentID  *string `json:"contentId"`
	UploadedBy *string `json:"uploadedBy"`
}

// PaginatedResponse represents a paginated response
type PaginatedResponse struct {
	Data       []MediaFile `json:"data"`
	Pagination Pagination  `json:"pagination"`
}

// Pagination represents pagination metadata
type Pagination struct {
	Page  int   `json:"page"`
	Limit int   `json:"limit"`
	Total int64 `json:"total"`
	Pages int   `json:"pages"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
	Code    int    `json:"code"`
}
