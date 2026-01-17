package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
	"github.com/preetsinghmakkar/OpenCall/internal/repositories"
)

func RegisterPublicEndpoints(
	router *gin.Engine,
	userHandlers *handlers.User,
	authHandler *handlers.AuthHandler,
	mentorHandler *handlers.MentorHandler,
	mentorServiceHandler *handlers.MentorServiceHandler,
	mentorAvailabilityHandler *handlers.MentorAvailabilityHandler,
	paymentHandler *handlers.PaymentHandler,
	bookingRepo *repositories.BookingRepository,
	userRepo *repositories.UserRepository,
	mentorRepo *repositories.MentorRepository,
	jwtSecret string,
	zegoHandler *handlers.ZegoHandler,
) {

	public := router.Group("/api")

	public.POST("/auth/register", userHandlers.CreateUser)
	public.POST("/auth/login", authHandler.Login)
	public.POST("/auth/refresh", authHandler.RefreshToken)

	public.GET("/users/:username", userHandlers.GetUserProfile)
	public.GET("/mentors/:username", mentorHandler.GetProfile)
	public.GET("/mentors/:username/services", mentorServiceHandler.GetByUsername)

	public.GET("/mentors/:username/availability", mentorAvailabilityHandler.GetByUsername)

	public.POST("/webhooks/razorpay", paymentHandler.RazorpayWebhook)

	// Zego routes
	public.POST("/zego/token", zegoHandler.GenerateToken)

}
