package dtos

import (
	"time"

	"github.com/google/uuid"
)

type CreateMentorProfileRequest struct {
	Title    string `json:"title" binding:"required,min=3"`
	Bio      string `json:"bio"`
	Timezone string `json:"timezone" binding:"required"`
}

type CreateMentorProfileResponse struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Title     string    `json:"title"`
	Bio       string    `json:"bio"`
	Timezone  string    `json:"timezone"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}
