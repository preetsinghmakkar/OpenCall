package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
)

func RegisterPublicEndpoints(router *gin.Engine, userHandlers *handlers.User, authHandler *handlers.AuthHandler) {

	api := router.Group("/api")

	api.POST("/register", userHandlers.CreateUser)
	api.POST("/auth/login", authHandler.Login)
	api.POST("/auth/refresh", authHandler.RefreshToken)

	api.GET("/users/:username", userHandlers.GetUserProfile)
	//	GET  /api/mentors/:username
	//  GET  /api/mentors/:id/services
	//  GET  /api/mentors/:id/availability

}
