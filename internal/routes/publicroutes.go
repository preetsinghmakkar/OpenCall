package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
)

func RegisterPublicEndpoints(
	router *gin.Engine,
	userHandlers *handlers.User,
	authHandler *handlers.AuthHandler,
	mentorHandler *handlers.MentorHandler,
	mentorServiceHandler *handlers.MentorServiceHandler,
	mentorAvailabilityHandler *handlers.MentorAvailabilityHandler,
) {

	public := router.Group("/api")

	public.POST("/register", userHandlers.CreateUser)
	public.POST("/auth/login", authHandler.Login)
	public.POST("/auth/refresh", authHandler.RefreshToken)

	public.GET("/users/:username", userHandlers.GetUserProfile)
	public.GET("/mentors/:username", mentorHandler.GetProfile)
	public.GET("/mentors/:username/services", mentorServiceHandler.GetByUsername)

	public.GET("/mentors/:username/availability", mentorAvailabilityHandler.GetByUsername)

	router.GET(
		"/mentors/:username/availability",
		mentorAvailabilityHandler.Get,
	)

}
