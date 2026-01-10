package main

import (
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

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// repositories
	userRepo := repositories.NewUserRepository(client.DB)
	refreshTokenRepo := repositories.NewRefreshTokenRepository(client.DB)
	mentorRepo := repositories.NewMentorRepository(client.DB)
	mentorServiceRepo := repositories.NewMentorServiceRepository(client.DB)

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

	// handlers
	userHandler := handlers.NewUserHandler(userService)
	authHandler := handlers.NewAuthHandler(authService)
	mentorHandler := handlers.NewMentorHandler(mentorProfileService)
	mentorServiceHandler := handlers.NewMentorServiceHandler(mentorOfferingService)

	// routes
	routes.RegisterPublicEndpoints(
		router,
		userHandler,
		authHandler,
		mentorHandler,
		mentorServiceHandler,
	)

	routes.RegisterProtectedEndpoints(
		router,
		userHandler,
		mentorHandler,
		mentorServiceHandler,
		config.JWT.Secret,
	)

	server := serve.NewServer(log.Logger, router, config)
	server.Serve()
}
