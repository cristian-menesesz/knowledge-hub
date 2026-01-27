package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/model"
	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/service"
	"github.com/gorilla/mux"
)

const (
	MaxUploadSize = 10 << 20 // 10MB
)

// MediaHandler handles HTTP requests for media operations
type MediaHandler struct {
	service *service.MediaService
}

// NewMediaHandler creates a new media handler
func NewMediaHandler(service *service.MediaService) *MediaHandler {
	return &MediaHandler{
		service: service,
	}
}

// UploadFile handles file upload requests
func (h *MediaHandler) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Limit request body size
	r.Body = http.MaxBytesReader(w, r.Body, MaxUploadSize)

	// Parse multipart form
	if err := r.ParseMultipartForm(MaxUploadSize); err != nil {
		respondError(w, "File too large or invalid multipart form", http.StatusBadRequest)
		return
	}

	// Get file from form
	file, header, err := r.FormFile("file")
	if err != nil {
		respondError(w, "No file provided or invalid file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Parse request body
	uploadReq := model.UploadRequest{}
	if uploadedBy := r.FormValue("uploadedBy"); uploadedBy != "" {
		uploadReq.UploadedBy = &uploadedBy
	}
	if contentID := r.FormValue("contentId"); contentID != "" {
		uploadReq.ContentID = &contentID
	}

	// Upload file
	media, err := h.service.UploadFile(file, header, uploadReq)
	if err != nil {
		respondError(w, err.Error(), http.StatusBadRequest)
		return
	}

	respondJSON(w, media, http.StatusCreated)
}

// GetFile retrieves a media file by ID
func (h *MediaHandler) GetFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		respondError(w, "Media ID is required", http.StatusBadRequest)
		return
	}

	media, err := h.service.GetFile(id)
	if err != nil {
		respondError(w, err.Error(), http.StatusNotFound)
		return
	}

	respondJSON(w, media, http.StatusOK)
}

// ListFiles retrieves paginated list of media files
func (h *MediaHandler) ListFiles(w http.ResponseWriter, r *http.Request) {
	query := model.PaginationQuery{}

	// Parse query parameters
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if page, err := strconv.Atoi(pageStr); err == nil {
			query.Page = page
		}
	}

	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			query.Limit = limit
		}
	}

	if contentID := r.URL.Query().Get("contentId"); contentID != "" {
		query.ContentID = &contentID
	}

	if uploadedBy := r.URL.Query().Get("uploadedBy"); uploadedBy != "" {
		query.UploadedBy = &uploadedBy
	}

	// Get files
	response, err := h.service.ListFiles(query)
	if err != nil {
		respondError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	respondJSON(w, response, http.StatusOK)
}

// DeleteFile soft deletes a media file
func (h *MediaHandler) DeleteFile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		respondError(w, "Media ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteFile(id); err != nil {
		respondError(w, err.Error(), http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// HealthCheck handles health check requests
func (h *MediaHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	respondJSON(w, map[string]string{
		"status":  "healthy",
		"service": "media-service",
		"version": "1.0.0",
	}, http.StatusOK)
}

// respondJSON sends a JSON response
func respondJSON(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(data); err != nil {
		fmt.Printf("Error encoding response: %v\n", err)
	}
}

// respondError sends an error response
func respondError(w http.ResponseWriter, message string, status int) {
	respondJSON(w, model.ErrorResponse{
		Error:   http.StatusText(status),
		Message: message,
		Code:    status,
	}, status)
}
