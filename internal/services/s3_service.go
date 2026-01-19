package services

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type S3Service struct {
	client     *s3.Client
	bucketName string
	region     string
}

func NewS3Service(bucketName, region string) (*S3Service, error) {
	cfg, err := config.LoadDefaultConfig(context.Background(), config.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load SDK config: %w", err)
	}

	client := s3.NewFromConfig(cfg)
	return &S3Service{
		client:     client,
		bucketName: bucketName,
		region:     region,
	}, nil
}

// UploadProfilePicture uploads a profile picture to S3 and returns the full URL
func (s *S3Service) UploadProfilePicture(ctx context.Context, userID uuid.UUID, file *multipart.FileHeader) (string, error) {
	// Validate file size (5MB limit)
	if file.Size > 5*1024*1024 {
		return "", fmt.Errorf("file size exceeds 5MB limit")
	}

	// Validate file type
	allowedMimes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/webp": true,
	}
	contentType := file.Header.Get("Content-Type")
	if !allowedMimes[contentType] {
		return "", fmt.Errorf("unsupported image type: %s", contentType)
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Generate S3 key: profiles/{userID}/{timestamp}-{randomUUID}{ext}
	ext := filepath.Ext(file.Filename)
	timestamp := time.Now().UnixMilli()
	randomID := uuid.New().String()[:8] // Use first 8 chars of UUID for brevity
	key := fmt.Sprintf("profiles/%s/%d-%s%s", userID.String(), timestamp, randomID, ext)

	// Upload to S3
	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucketName),
		Key:         aws.String(key),
		Body:        src,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Return full S3 URL
	url := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", s.bucketName, s.region, key)
	return url, nil
}

// DeleteProfilePicture deletes a profile picture from S3 by extracting key from URL
func (s *S3Service) DeleteProfilePicture(ctx context.Context, picURL string) error {
	if picURL == "" {
		return nil
	}

	// Extract S3 key from URL
	// URL format: https://bucket.s3.region.amazonaws.com/key
	key := s.extractKeyFromURL(picURL)
	if key == "" {
		// If key extraction fails, it's not an S3 URL, skip deletion
		return nil
	}

	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucketName),
		Key:    aws.String(key),
	})
	if err != nil {
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	return nil
}

// extractKeyFromURL extracts the S3 key from a full S3 URL
func (s *S3Service) extractKeyFromURL(picURL string) string {
	// URL format: https://bucket.s3.region.amazonaws.com/key
	// We need to extract everything after .com/
	prefix := fmt.Sprintf("https://%s.s3.%s.amazonaws.com/", s.bucketName, s.region)
	if len(picURL) > len(prefix) && picURL[:len(prefix)] == prefix {
		return picURL[len(prefix):]
	}
	return ""
}

// Ping checks S3 bucket connectivity
func (s *S3Service) Ping(ctx context.Context) error {
	_, err := s.client.HeadBucket(ctx, &s3.HeadBucketInput{
		Bucket: aws.String(s.bucketName),
	})
	return err
}
