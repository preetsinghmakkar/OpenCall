package configs

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/preetsinghmakkar/OpenCall/internal/constants"
)

type Config struct {
	Server   serverConfig
	Database databaseConfig
}

type serverConfig struct {
	Address string
}

type databaseConfig struct {
	DatabaseDriver   string
	DatabaseHost     string
	DatabasePort     int
	DatabaseUser     string
	DatabasePassword string
	DatabaseName     string
}

func NewConfig() *Config {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("No .env file found")
	}

	port, err := strconv.Atoi(GetEnvOrPanic(constants.EnvKeys.DBPort))
	if err != nil {
		panic("DB_PORT must be a number")
	}

	c := &Config{
		Server: serverConfig{
			Address: GetEnvOrPanic(constants.EnvKeys.ServerAddress),
		},

		Database: databaseConfig{
			DatabaseDriver:   GetEnvOrPanic(constants.EnvKeys.DBDriver),
			DatabaseHost:     GetEnvOrPanic(constants.EnvKeys.DBHost),
			DatabasePort:     port,
			DatabaseUser:     GetEnvOrPanic(constants.EnvKeys.DBUser),
			DatabasePassword: GetEnvOrPanic(constants.EnvKeys.DBPassword),
			DatabaseName:     GetEnvOrPanic(constants.EnvKeys.DBName),
		},
	}

	return c
}

func GetEnvOrPanic(key string) string {
	value := os.Getenv(key)
	if value == "" {
		panic(fmt.Sprintf("environment variable %s not set", key))
	}

	return value
}

func (conf *Config) CorsNew() gin.HandlerFunc {
	allowedOrigin := GetEnvOrPanic(constants.EnvKeys.CorsAllowedOrigins)

	return cors.New(cors.Config{
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{constants.Headers.Origin, constants.Headers.Authorization, constants.Headers.ContentType},
		ExposeHeaders:    []string{constants.Headers.ContentLength},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == allowedOrigin
		},
		MaxAge: constants.MaxTime,
	})
}
