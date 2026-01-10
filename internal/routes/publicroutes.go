package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
)

func RegisterPublicEndpoints(router *gin.Engine, userHandlers *handlers.User, authHandler *handlers.AuthHandler, mentorHandler *handlers.MentorHandler, mentorServiceHandler *handlers.MentorServiceHandler) {

	api := router.Group("/api")

	api.POST("/register", userHandlers.CreateUser)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/refresh", authHandler.RefreshToken)

	api.GET("/users/:username", userHandlers.GetUserProfile)
	api.GET("/mentors/:username", mentorHandler.GetProfile)
	api.GET("/mentor/:username/services", mentorServiceHandler.GetByUsername)

	//  GET  /api/mentors/:id/services
	//  GET  /api/mentors/:id/availability

}
