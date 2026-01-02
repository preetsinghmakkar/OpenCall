package main

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/configs"
	"github.com/preetsinghmakkar/OpenCall/internal/database"
	serve "github.com/preetsinghmakkar/OpenCall/internal/server"
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
		log.Fatal().Err(err).Msg("Failed to initialize database client")
		return
	}

	defer func() {
		if err := client.Close(); err != nil {
			log.Error().Msgf("Failed to close database client: %v", err)
		}
	}()

	cors := config.CorsNew()

	router := gin.Default()
	router.Use(cors)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	server := serve.NewServer(log.Logger, router, config)
	server.Serve()
}
