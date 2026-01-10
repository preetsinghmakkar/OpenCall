package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
	"github.com/preetsinghmakkar/OpenCall/internal/middlewares"
)

func RegisterProtectedEndpoints(
	router *gin.Engine,
	userHandler *handlers.User,
	mentorHandler *handlers.MentorHandler,
	mentorServiceHandler *handlers.MentorServiceHandler,
	jwtSecret string,
) {
	protected := router.Group("/api")
	protected.Use(middlewares.AuthMiddleware(jwtSecret))

	protected.POST("/mentor/profile", mentorHandler.CreateProfile)
	protected.POST("/mentor/services", mentorServiceHandler.Create)

	// upcoming:
	// protected.POST("/mentor/availability")
	// protected.POST("/bookings")
}
