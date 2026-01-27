package service

import (
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/model"
	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/repository"
	"github.com/cristian-menesesz/knowledge-hub/media-service/pkg/storage"
	"github.com/google/uuid"
)

const (
	MaxFileSize     = 10 << 20 // 10MB
	MaxImageWidth   = 4000
	MaxImageHeight  = 4000
)

var allowedMimeTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

// MediaService handles business logic for media operations
type MediaService struct {
	repo    *repository.MediaRepository
	storage storage.Backend
	baseURL string
}

// NewMediaService creates a new media service
func NewMediaService(repo *repository.MediaRepository, storage storage.Backend, baseURL string) *MediaService {
	return &MediaService{
		repo:    repo,
		storage: storage,
		baseURL: baseURL,
	}
}

// UploadFile handles file upload
func (s *MediaService) UploadFile(file multipart.File, header *multipart.FileHeader, req model.UploadRequest) (*model.MediaFile, error) {
	// Validate file size
	if header.Size > MaxFileSize {
		return nil, fmt.Errorf("file size exceeds maximum allowed size of %d bytes", MaxFileSize)
	}

	// Validate mime type
	contentType := header.Header.Get("Content-Type")
	if !allowedMimeTypes[contentType] {
		return nil, fmt.Errorf("file type %s is not allowed", contentType)
	}

	// Generate UUID for stored filename
	fileID := uuid.New().String()
	ext := filepath.Ext(header.Filename)
	storedFilename := fileID + ext
	storedPath := filepath.Join("originals", storedFilename)

	// Extract image dimensions
	file.Seek(0, io.SeekStart)
	img, _, err := image.DecodeConfig(file)
	var width, height *int
	if err == nil {
		// Validate dimensions
		if img.Width > MaxImageWidth || img.Height > MaxImageHeight {
			return nil, fmt.Errorf("image dimensions exceed maximum allowed size of %dx%d", MaxImageWidth, MaxImageHeight)
		}
		w, h := img.Width, img.Height
		width = &w
		height = &h
	}

	// Reset file pointer for storage
	file.Seek(0, io.SeekStart)

	// Save file to storage
	if err := s.storage.Save(file, storedPath); err != nil {
		return nil, fmt.Errorf("failed to save file: %w", err)
	}

	// Create URL
	url := fmt.Sprintf("%s/media/%s", s.baseURL, storedFilename)

	// Create media record
	media := &model.MediaFile{
		ID:             fileID,
		Filename:       header.Filename,
		StoredFilename: storedFilename,
		FilePath:       storedPath,
		URL:            url,
		SizeBytes:      header.Size,
		MimeType:       contentType,
		Width:          width,
		Height:         height,
		UploadedBy:     req.UploadedBy,
		ContentID:      req.ContentID,
	}

	// Save to database
	if err := s.repo.Create(media); err != nil {
		// Rollback: delete file from storage
		s.storage.Delete(storedPath)
		return nil, fmt.Errorf("failed to create media record: %w", err)
	}

	return media, nil
}

// GetFile retrieves a media file by ID
func (s *MediaService) GetFile(id string) (*model.MediaFile, error) {
	return s.repo.FindByID(id)
}

// ListFiles retrieves media files with pagination
func (s *MediaService) ListFiles(query model.PaginationQuery) (*model.PaginatedResponse, error) {
	// Set defaults
	if query.Page < 1 {
		query.Page = 1
	}
	if query.Limit < 1 {
		query.Limit = 20
	}
	if query.Limit > 100 {
		query.Limit = 100
	}

	// Get files and total count
	files, total, err := s.repo.FindAll(query)
	if err != nil {
		return nil, err
	}

	// Calculate pages
	pages := int(total) / query.Limit
	if int(total)%query.Limit != 0 {
		pages++
	}

	return &model.PaginatedResponse{
		Data: files,
		Pagination: model.Pagination{
			Page:  query.Page,
			Limit: query.Limit,
			Total: total,
			Pages: pages,
		},
	}, nil
}

// DeleteFile soft deletes a media file
func (s *MediaService) DeleteFile(id string) error {
	return s.repo.SoftDelete(id)
}

// ValidateImageDimensions checks if image dimensions are within limits
func ValidateImageDimensions(file multipart.File) (int, int, error) {
	img, _, err := image.DecodeConfig(file)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to decode image: %w", err)
	}

	if img.Width > MaxImageWidth || img.Height > MaxImageHeight {
		return img.Width, img.Height, fmt.Errorf("image dimensions %dx%d exceed maximum %dx%d",
			img.Width, img.Height, MaxImageWidth, MaxImageHeight)
	}

	return img.Width, img.Height, nil
}

// GetAllowedMimeTypes returns list of allowed mime types
func GetAllowedMimeTypes() []string {
	types := make([]string, 0, len(allowedMimeTypes))
	for mimeType := range allowedMimeTypes {
		types = append(types, mimeType)
	}
	return types
}

// FormatFileSize formats file size in human-readable format
func FormatFileSize(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

// GetFileExtension extracts file extension from filename
func GetFileExtension(filename string) string {
	ext := filepath.Ext(filename)
	return strings.ToLower(ext)
}
