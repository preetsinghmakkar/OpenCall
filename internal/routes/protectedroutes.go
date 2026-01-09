package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/handlers"
	"github.com/preetsinghmakkar/OpenCall/internal/middlewares"
)

func RegisterProtectedEndpoints(
	router *gin.Engine,
	userHandlers *handlers.User,
	jwtSecret string,
) {
	protected := router.Group("/api")
	protected.Use(middlewares.AuthMiddleware(jwtSecret))

	protected.GET("/checking", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "authenticated",
			"user_id": c.GetString("user_id"),
			"role":    c.GetString("role"),
		})
	})
}
