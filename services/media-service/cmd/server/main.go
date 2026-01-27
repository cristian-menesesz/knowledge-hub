package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/handler"
	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/repository"
	"github.com/cristian-menesesz/knowledge-hub/media-service/internal/service"
	"github.com/cristian-menesesz/knowledge-hub/media-service/pkg/storage"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get configuration from environment
	port := getEnv("PORT", "3004")
	databaseURL := getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/knowledge_hub?sslmode=disable")
	uploadDir := getEnv("UPLOAD_DIR", "/var/media")
	baseURL := getEnv("BASE_URL", "http://localhost:8000")

	// Initialize database
	db, err := sql.Open("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Test database connection
	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("✓ Connected to database")

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Initialize storage
	storageBackend, err := storage.NewLocalStorage(uploadDir)
	if err != nil {
		log.Fatalf("Failed to initialize storage: %v", err)
	}
	log.Printf("✓ Initialized local storage at %s", uploadDir)

	// Initialize repository
	mediaRepo := repository.NewMediaRepository(db)

	// Initialize service
	mediaService := service.NewMediaService(mediaRepo, storageBackend, baseURL)

	// Initialize handler
	mediaHandler := handler.NewMediaHandler(mediaService)

	// Setup router
	router := mux.NewRouter()

	// Health check
	router.HandleFunc("/health", mediaHandler.HealthCheck).Methods("GET")

	// API routes
	api := router.PathPrefix("/api/v1/media").Subrouter()
	api.HandleFunc("/upload", mediaHandler.UploadFile).Methods("POST")
	api.HandleFunc("", mediaHandler.ListFiles).Methods("GET")
	api.HandleFunc("/{id}", mediaHandler.GetFile).Methods("GET")
	api.HandleFunc("/{id}", mediaHandler.DeleteFile).Methods("DELETE")

	// CORS middleware
	router.Use(corsMiddleware)

	// Logging middleware
	router.Use(loggingMiddleware)

	// Start server
	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 Media service starting on port %s", port)
	log.Printf("📁 Upload directory: %s", uploadDir)
	log.Printf("🔗 Base URL: %s", baseURL)
	log.Printf("📊 Database: Connected")

	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// getEnv gets environment variable with fallback
func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

// corsMiddleware adds CORS headers
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// loggingMiddleware logs HTTP requests
func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Log request
		log.Printf("[%s] %s %s", r.Method, r.RequestURI, r.RemoteAddr)

		// Call next handler
		next.ServeHTTP(w, r)

		// Log duration
		duration := time.Since(start)
		log.Printf("Request completed in %v", duration)
	})
}
