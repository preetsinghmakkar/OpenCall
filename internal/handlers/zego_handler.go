package handlers

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/preetsinghmakkar/OpenCall/internal/services"
)

// ZegoHandler handles Zego Cloud video session endpoints
type ZegoHandler struct {
	zegoService *services.ZegoCloudService
}

// NewZegoHandler creates a new Zego handler
func NewZegoHandler(zegoService *services.ZegoCloudService) *ZegoHandler {
	return &ZegoHandler{
		zegoService: zegoService,
	}
}

// GenerateTokenRequest is the request body for token generation
type GenerateTokenRequest struct {
	UserID            string `json:"user_id" binding:"required"`
	UserName          string `json:"user_name" binding:"required"`
	RoomID            string `json:"room_id" binding:"required"`
	ExpirationSeconds int64  `json:"expiration_seconds"`
}

// GenerateTokenResponse is the response for token generation
type GenerateTokenResponse struct {
	Token  string `json:"token"`
	AppID  int64  `json:"app_id"`
	RoomID string `json:"room_id"`
	UserID string `json:"user_id"`
}

// GenerateToken generates a Zego Cloud token for joining a video session
// POST /api/zego/token
func (h *ZegoHandler) GenerateToken(c *gin.Context) {
	var req GenerateTokenRequest

	log.Println("[ZegoHandler] GenerateToken called")

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Println("[ZegoHandler] JSON binding error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid request: %v", err)})
		return
	}

	log.Println("[ZegoHandler] Request:", map[string]interface{}{
		"userID": req.UserID,
		"roomID": req.RoomID,
	})

	// Set default expiration if not provided
	if req.ExpirationSeconds <= 0 {
		req.ExpirationSeconds = 3600 // 1 hour default
	}

	// Generate token
	token, err := h.zegoService.GenerateToken(
		req.UserID,
		req.UserName,
		req.RoomID,
		req.ExpirationSeconds,
	)
	if err != nil {
		log.Println("[ZegoHandler] Token generation error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	log.Println("[ZegoHandler] Token generated successfully, appID:", h.zegoService.GetAppID())

	responseData := GenerateTokenResponse{
		Token:  token,
		AppID:  h.zegoService.GetAppID(),
		RoomID: req.RoomID,
		UserID: req.UserID,
	}

	log.Println("[ZegoHandler] Sending response:", map[string]interface{}{
		"token_length": len(token),
		"app_id":       responseData.AppID,
		"room_id":      responseData.RoomID,
		"user_id":      responseData.UserID,
	})

	c.JSON(http.StatusOK, gin.H{
		"data": responseData,
	})
}

// GetSessionInfo provides information needed to join a Zego session
// GET /api/zego/session/:bookingID
func (h *ZegoHandler) GetSessionInfo(c *gin.Context) {
	bookingID := c.Param("bookingID")

	log.Println("[ZegoHandler] GetSessionInfo called for booking:", bookingID)

	if bookingID == "" {
		log.Println("[ZegoHandler] Missing booking ID")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking ID is required"})
		return
	}

	// Return session info with app ID and room setup
	log.Println("[ZegoHandler] Returning session info")
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"app_id":   h.zegoService.GetAppID(),
			"room_id":  bookingID, // Use booking ID as room ID
			"can_join": true,
			"message":  "Ready to join Zego session",
		},
	})
}
