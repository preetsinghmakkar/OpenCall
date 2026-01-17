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
	mentorAvailabilityHandler *handlers.MentorAvailabilityHandler,
	bookingHandler *handlers.BookingHandler,
	paymentHandler *handlers.PaymentHandler,
	authHandler *handlers.AuthHandler,
	jwtSecret string,
	zegoHandler *handlers.ZegoHandler,
) {
	protected := router.Group("/api")
	protected.Use(middlewares.AuthMiddleware(jwtSecret))

	// Auth Routes (Protected)
	protected.DELETE("/auth/logout", authHandler.Logout)

	// User Routes (Protected)
	protected.PUT("/users/profile", userHandler.UpdateProfile)

	protected.POST("/mentor/profile", mentorHandler.CreateProfile)
	protected.POST("/mentor/services", mentorServiceHandler.Create)
	protected.POST("/mentor/availability", mentorAvailabilityHandler.Create)
	protected.POST("/bookings", bookingHandler.CreateBooking)
	protected.GET("/bookings/me", bookingHandler.GetMyBookings)
	protected.GET("/mentor/booked-sessions", bookingHandler.GetMentorBookedSessions)

	protected.POST("/payments", paymentHandler.CreatePayment)
	protected.POST("/payments/verify", paymentHandler.VerifyPayment)

	// Zego routes
	protected.GET("/zego/session/:bookingID", zegoHandler.GetSessionInfo)

}
