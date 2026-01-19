package handlers

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// NewHealthHandler returns a handler that performs lightweight health checks.
// It pings the provided database (if non-nil) with a short timeout and returns
// a JSON payload with overall status, per-service states, and a timestamp.
func NewHealthHandler(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// overall status defaults to ok
		status := "ok"
		services := map[string]string{}

		// check database if provided
		if db != nil {
			ctx, cancel := context.WithTimeout(c.Request.Context(), 1*time.Second)
			defer cancel()

			if err := db.PingContext(ctx); err != nil {
				status = "degraded"
				services["database"] = "down"
			} else {
				services["database"] = "ok"
			}
		} else {
			services["database"] = "unavailable"
		}

		// choose HTTP status code based on overall status
		code := http.StatusOK
		if status != "ok" {
			code = http.StatusServiceUnavailable
		}

		c.JSON(code, gin.H{
			"status":    status,
			"services":  services,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	}
}
