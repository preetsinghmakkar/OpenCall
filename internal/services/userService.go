package services

import "github.com/preetsinghmakkar/OpenCall/internal/repositories"

type User struct {
	userRepo *repositories.UserRepository
}

func NewUserService(userRepo *repositories.UserRepository) *User {
	return &User{
		userRepo: userRepo,
	}
}
