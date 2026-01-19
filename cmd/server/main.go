package main

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/configs"
	"github.com/preetsinghmakkar/OpenCall/internal/database"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
	"github.com/preetsinghmakkar/OpenCall/internal/repositories"
	"github.com/preetsinghmakkar/OpenCall/internal/routes"
	serve "github.com/preetsinghmakkar/OpenCall/internal/server"
	"github.com/preetsinghmakkar/OpenCall/internal/services"
	"github.com/rs/zerolog/log"
)

func main() {
	config := configs.NewConfig()

	client, err := database.NewSQLClient(database.Config{
		Driver:            config.Database.DatabaseDriver,
		Host:              config.Database.DatabaseHost,
		Port:              config.Database.DatabasePort,
		User:              config.Database.DatabaseUser,
		Password:          config.Database.DatabasePassword,
		DBName:            config.Database.DatabaseName,
		MaxOpenConns:      25,
		MaxIdleConns:      25,
		ConnMaxIdleTime:   15 * time.Minute,
		ConnectionTimeout: 5 * time.Second,
	})
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize database")
	}
	defer client.Close()

	router := gin.Default()
	router.Use(config.CorsNew())

	router.GET("/health", handlers.NewHealthHandler(client.DB))

	// repositories
	userRepo := repositories.NewUserRepository(client.DB)
	refreshTokenRepo := repositories.NewRefreshTokenRepository(client.DB)
	mentorRepo := repositories.NewMentorRepository(client.DB)
	mentorServiceRepo := repositories.NewMentorServiceRepository(client.DB)
	mentorAvailabilityRepo := repositories.NewMentorAvailabilityRepository(client.DB)
	bookingRepo := repositories.NewBookingRepository(client.DB)
	paymentRepo := repositories.NewPaymentRepository(client.DB)
	razorpayClient := services.NewRazorpayClient(
		config.Razorpay.KeyID,
		config.Razorpay.KeySecret,
	)

	// services
	userService := services.NewUserService(userRepo)
	authService := services.NewAuthService(
		userRepo,
		refreshTokenRepo,
		config.JWT.Secret,
	)
	mentorProfileService := services.NewMentorProfileService(mentorRepo)
	mentorOfferingService := services.NewMentorOfferingService(
		mentorServiceRepo,
		mentorRepo,
	)
	mentorAvailabilityService := services.NewMentorAvailabilityService(
		mentorAvailabilityRepo,
		mentorRepo,
	)
	availabilityService := services.NewAvailabilityService(
		mentorRepo,
		mentorServiceRepo,
		mentorAvailabilityRepo,
		bookingRepo,
	)
	bookingService := services.NewBookingService(
		bookingRepo,
		mentorRepo,
		mentorServiceRepo,
		mentorAvailabilityRepo,
	)
	paymentService := services.NewPaymentService(
		client.DB,
		paymentRepo,
		bookingRepo,
		razorpayClient,
		config.Razorpay.KeySecret,
	)

	// services (continued)
	zegoService := services.NewZegoCloudService(
		config.Zego.AppID,
		config.Zego.ServerSecret,
	)

	// S3 Service for profile picture uploads
	s3BucketName := os.Getenv("AWS_S3_BUCKET")
	s3Region := os.Getenv("AWS_REGION")
	if s3BucketName == "" || s3Region == "" {
		log.Warn().Msg("AWS_S3_BUCKET or AWS_REGION not set, S3 profile picture uploads will not work")
	}
	s3Service, err := services.NewS3Service(s3BucketName, s3Region)
	if err != nil {
		log.Warn().Err(err).Msg("Failed to initialize S3 service, profile picture uploads will not work")
		// Create a nil-safe S3Service or continue with graceful degradation
		// For now, we'll create one anyway and let it fail at upload time if needed
	}

	// handlers
	userHandler := handlers.NewUserHandler(userService, s3Service)
	authHandler := handlers.NewAuthHandler(authService)
	mentorHandler := handlers.NewMentorHandler(mentorProfileService)
	mentorServiceHandler := handlers.NewMentorServiceHandler(mentorOfferingService)
	mentorAvailabilityHandler := handlers.NewMentorAvailabilityHandler(
		mentorAvailabilityService,
		availabilityService,
	)
	bookingHandler := handlers.NewBookingHandler(bookingService, mentorRepo)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	zegoHandler := handlers.NewZegoHandler(zegoService)

	// routes
	routes.RegisterPublicEndpoints(
		router,
		userHandler,
		authHandler,
		mentorHandler,
		mentorServiceHandler,
		mentorAvailabilityHandler,
		paymentHandler,
		bookingRepo,
		userRepo,
		mentorRepo,
		config.JWT.Secret,
		zegoHandler,
	)

	routes.RegisterProtectedEndpoints(
		router,
		userHandler,
		mentorHandler,
		mentorServiceHandler,
		mentorAvailabilityHandler,
		bookingHandler,
		paymentHandler,
		authHandler,
		config.JWT.Secret,
		zegoHandler,
	)

	server := serve.NewServer(log.Logger, router, config)
	server.Serve()
}
