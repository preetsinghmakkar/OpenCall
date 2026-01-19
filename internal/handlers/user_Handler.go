package handlers

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/dtos"
	"github.com/preetsinghmakkar/OpenCall/internal/services"
)

type User struct {
	userService *services.User
	s3Service   *services.S3Service
}

func NewUserHandler(userService *services.User, s3Service *services.S3Service) *User {
	return &User{
		userService: userService,
		s3Service:   s3Service,
	}
}

func (h *User) CreateUser(ctx *gin.Context) {
	var registerUserRequest dtos.RegisterUserRequest

	if err := ctx.ShouldBindJSON(&registerUserRequest); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			out := make(map[string]string)
			for _, fe := range ve {
				out[fe.Field()] = msgForTag(fe)
			}
			ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"errors": out})

			return
		}
		ctx.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return
	}

	createUserResponse, signupError := h.userService.CreateUser(&registerUserRequest)
	if signupError != nil {
		ctx.AbortWithStatusJSON(signupError.Status, gin.H{
			"code":    signupError.Code,
			"message": signupError.Message,
		})

		return
	}

	ctx.JSON(http.StatusCreated, createUserResponse)
}

func msgForTag(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "This field is required"
	case "min":
		return fmt.Sprintf("Minimum length is %s", fe.Param())
	case "custom_password":
		return "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
	default:
		return "Invalid value"
	}
}

func (h *User) GetUserProfile(c *gin.Context) {
	username := c.Param("username")

	resp, err := h.userService.GetUserProfile(username)
	if err != nil {
		c.JSON(404, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(200, resp)
}

// UpdateProfile updates user profile information and picture (uploads to S3)
func (h *User) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	// Parse user ID
	uid, err := uuid.Parse(userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user id",
		})
		return
	}

	// Parse form data
	var req dtos.UpdateUserProfileRequest
	req.FirstName = c.PostForm("firstName")
	req.LastName = c.PostForm("lastName")
	req.Email = c.PostForm("email")
	req.Bio = c.PostForm("bio")

	// Validate required fields
	if req.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "email is required",
		})
		return
	}

	profilePictureURL := ""

	// Handle profile picture upload to S3
	file, err := c.FormFile("profilePicture")
	if err == nil && file != nil {
		// Validate file type
		validTypes := map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/webp": true,
		}

		if !validTypes[file.Header.Get("Content-Type")] {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid file type. Only JPEG, PNG, and WebP are allowed",
			})
			return
		}

		// Validate file size (5MB max)
		if file.Size > 5*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "file too large. Maximum size is 5MB",
			})
			return
		}

		// Upload to S3
		url, uploadErr := h.s3Service.UploadProfilePicture(c.Request.Context(), uid, file)
		if uploadErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": fmt.Sprintf("failed to upload profile picture: %v", uploadErr),
			})
			return
		}

		profilePictureURL = url
	}

	// Update profile in service (which handles deleting old picture)
	resp, appErr := h.userService.UpdateProfile(userID, &req, profilePictureURL, h.s3Service)
	if appErr != nil {
		c.JSON(appErr.Status, gin.H{
			"error": appErr.Message,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": resp,
	})
}
