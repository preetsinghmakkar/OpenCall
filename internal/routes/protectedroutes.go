package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
	"github.com/preetsinghmakkar/OpenCall/internal/middlewares"
)

func RegisterProtectedEndpoints(
	router *gin.Engine,
	userHandlers *handlers.User,
	mentorHandler *handlers.MentorHandler,
	jwtSecret string,
) {
	protected := router.Group("/api")
	protected.Use(middlewares.AuthMiddleware(jwtSecret))

	protected.POST("/mentor/profile", mentorHandler.CreateProfile)

	// POST /api/mentor/services
	// POST /api/mentor/availability
	// POST /api/bookings

}
