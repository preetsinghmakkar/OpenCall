package dtos

type UpdateUserProfileRequest struct {
	FirstName string `json:"first_name" binding:"required,min=1"`
	LastName  string `json:"last_name" binding:"required,min=1"`
	Bio       string `json:"bio"`
	Email     string `json:"email" binding:"required,email"`
}

type UpdateUserProfileResponse struct {
	ID             string `json:"id"`
	FirstName      string `json:"first_name"`
	LastName       string `json:"last_name"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	Bio            string `json:"bio"`
	ProfilePicture string `json:"profile_picture"`
	Role           string `json:"role"`
	IsActive       bool   `json:"is_active"`
	Message        string `json:"message"`
}
