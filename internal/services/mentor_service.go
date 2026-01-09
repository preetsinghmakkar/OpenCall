package services

import (
	"strings"

	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/dtos"
	"github.com/preetsinghmakkar/OpenCall/internal/models"
	"github.com/preetsinghmakkar/OpenCall/internal/repositories"
)

type MentorService struct {
	mentorRepo *repositories.MentorRepository
}

func NewMentorService(
	mentorRepo *repositories.MentorRepository,
) *MentorService {
	return &MentorService{
		mentorRepo: mentorRepo,
	}
}

func (s *MentorService) CreateProfile(
	userID uuid.UUID,
	req *dtos.CreateMentorProfileRequest,
) (*models.MentorProfile, error) {

	profile := &models.MentorProfile{
		ID:       uuid.New(),
		UserID:   userID,
		Title:    strings.TrimSpace(req.Title),
		Bio:      strings.TrimSpace(req.Bio),
		Timezone: req.Timezone,
		IsActive: true,
	}
	err := s.mentorRepo.CreateProfile(profile)
	if err != nil {
		return nil, err
	}

	return profile, nil
}
