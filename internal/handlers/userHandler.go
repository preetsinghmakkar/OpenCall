package handlers

import "github.com/preetsinghmakkar/OpenCall/internal/services"

type User struct {
	userService *services.User
}

func NewUserHandler(userService *services.User) *User {
	return &User{
		userService: userService,
	}
}
