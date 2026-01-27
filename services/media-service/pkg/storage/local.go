package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// Backend defines the interface for storage operations
type Backend interface {
	Save(file io.Reader, path string) error
	Get(path string) (io.Reader, error)
	Delete(path string) error
	Exists(path string) (bool, error)
}

// LocalStorage implements storage on local file system
type LocalStorage struct {
	basePath string
}

// NewLocalStorage creates a new local storage backend
func NewLocalStorage(basePath string) (*LocalStorage, error) {
	// Ensure base path exists
	if err := os.MkdirAll(basePath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create base path: %w", err)
	}

	// Create subdirectories
	subdirs := []string{"originals", "thumbnails", "optimized", "temp"}
	for _, subdir := range subdirs {
		path := filepath.Join(basePath, subdir)
		if err := os.MkdirAll(path, 0755); err != nil {
			return nil, fmt.Errorf("failed to create subdirectory %s: %w", subdir, err)
		}
	}

	return &LocalStorage{
		basePath: basePath,
	}, nil
}

// Save writes a file to the local file system
func (ls *LocalStorage) Save(file io.Reader, path string) error {
	fullPath := filepath.Join(ls.basePath, path)

	// Ensure directory exists
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Create file
	out, err := os.Create(fullPath)
	if err != nil {
		return fmt.Errorf("failed to create file: %w", err)
	}
	defer out.Close()

	// Copy data
	if _, err := io.Copy(out, file); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// Get reads a file from the local file system
func (ls *LocalStorage) Get(path string) (io.Reader, error) {
	fullPath := filepath.Join(ls.basePath, path)

	file, err := os.Open(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("file not found: %s", path)
		}
		return nil, fmt.Errorf("failed to open file: %w", err)
	}

	return file, nil
}

// Delete removes a file from the local file system
func (ls *LocalStorage) Delete(path string) error {
	fullPath := filepath.Join(ls.basePath, path)

	if err := os.Remove(fullPath); err != nil {
		if os.IsNotExist(err) {
			return fmt.Errorf("file not found: %s", path)
		}
		return fmt.Errorf("failed to delete file: %w", err)
	}

	return nil
}

// Exists checks if a file exists
func (ls *LocalStorage) Exists(path string) (bool, error) {
	fullPath := filepath.Join(ls.basePath, path)

	_, err := os.Stat(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return false, nil
		}
		return false, err
	}

	return true, nil
}
