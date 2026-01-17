package services

import (
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/constants"
	"github.com/preetsinghmakkar/OpenCall/internal/dtos"
	appErrors "github.com/preetsinghmakkar/OpenCall/internal/errors"
	"github.com/preetsinghmakkar/OpenCall/internal/mapping"
	"github.com/preetsinghmakkar/OpenCall/internal/repositories"
	"github.com/preetsinghmakkar/OpenCall/internal/utils"
)

type User struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *User {
	return &User{
		userRepo: userRepo,
	}
}

/*
CreateUser handles user registration only
*/
func (s *User) CreateUser(
	req *dtos.RegisterUserRequest,
) (*dtos.RegisterUserResponse, *appErrors.AppError) {

	// normalize inputs
	email := strings.ToLower(strings.TrimSpace(req.Email))
	username := strings.ToLower(strings.TrimSpace(req.Username))

	// 1. check email uniqueness
	emailExists, err := s.userRepo.ExistsByEmail(email)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}
	if emailExists {
		return nil, appErrors.EmailAlreadyExists()
	}

	// 2. check username uniqueness
	usernameExists, err := s.userRepo.ExistsByUsername(username)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}
	if usernameExists {
		return nil, appErrors.UsernameAlreadyExists()
	}

	// 3. hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}

	// 4. map request → user entity
	user := mapping.ToUserFromRegisterRequest(req)
	user.ID = uuid.New()
	user.Email = email
	user.Username = username
	user.PasswordHash = passwordHash
	user.CreatedAt = time.Now().UTC()
	user.UpdatedAt = time.Now().UTC()

	user.Role = constants.RoleUser

	// 5. persist user
	createdUser, err := s.userRepo.Create(user)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}

	// 6. return response
	return &dtos.RegisterUserResponse{
		User:    mapping.ToUserResponse(createdUser),
		Message: "user registered successfully",
	}, nil
}

func (s *User) GetUserProfile(
	username string,
) (*dtos.UserProfileResponse, error) {
	return s.userRepo.FindPublicProfileByUsername(username)
}

// UpdateProfile updates user profile
func (s *User) UpdateProfile(
	userID string,
	req *dtos.UpdateUserProfileRequest,
	profilePicturePath string,
) (*dtos.UpdateUserProfileResponse, *appErrors.AppError) {

	// Parse user ID
	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}

	// Fetch existing user
	existingUser, err := s.userRepo.FindByID(uid)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}

	// Check if email is being changed and if it already exists
	if req.Email != existingUser.Email {
		emailExists, err := s.userRepo.ExistsByEmail(req.Email)
		if err != nil {
			return nil, appErrors.InternalServerError()
		}
		if emailExists {
			return nil, appErrors.EmailAlreadyExists()
		}
	}

	// Update user entity
	existingUser.FirstName = req.FirstName
	existingUser.LastName = req.LastName
	existingUser.Email = strings.ToLower(strings.TrimSpace(req.Email))
	existingUser.Bio = req.Bio

	// Update profile picture if provided
	if profilePicturePath != "" {
		existingUser.ProfilePicture = profilePicturePath
	}

	// Update in database
	updatedUser, err := s.userRepo.UpdateByID(uid, existingUser)
	if err != nil {
		return nil, appErrors.InternalServerError()
	}

	return &dtos.UpdateUserProfileResponse{
		ID:             updatedUser.ID.String(),
		FirstName:      updatedUser.FirstName,
		LastName:       updatedUser.LastName,
		Username:       updatedUser.Username,
		Email:          updatedUser.Email,
		Bio:            updatedUser.Bio,
		ProfilePicture: updatedUser.ProfilePicture,
		Role:           updatedUser.Role,
		IsActive:       updatedUser.IsActive,
		Message:        "profile updated successfully",
	}, nil
}
