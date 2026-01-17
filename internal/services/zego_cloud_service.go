package services

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// ZegoCloudService handles Zego Cloud integration for video sessions
type ZegoCloudService struct {
	appID        int64
	serverSecret string
}

// NewZegoCloudService creates a new Zego Cloud service instance
func NewZegoCloudService(appID int64, serverSecret string) *ZegoCloudService {
	return &ZegoCloudService{
		appID:        appID,
		serverSecret: serverSecret,
	}
}

// ZegoClaims represents the JWT claims for Zego tokens
type ZegoClaims struct {
	AppID    int64  `json:"app_id"`
	UserID   string `json:"user_id"`
	UserName string `json:"user_name"`
	RoomID   string `json:"room_id"`
	Type     string `json:"type"`
	Nonce    int64  `json:"nonce"`
	jwt.RegisteredClaims
}

// GenerateToken generates a Zego Cloud token for a user to join a room
// Parameters:
// - userID: Unique identifier for the user
// - userName: Display name for the user
// - roomID: Unique identifier for the room/session
// - expirationSeconds: Token expiration time in seconds (default 3600 = 1 hour)
func (zc *ZegoCloudService) GenerateToken(
	userID string,
	userName string,
	roomID string,
	expirationSeconds int64,
) (string, error) {
	fmt.Println("[ZegoService] GenerateToken called for user:", userID, "room:", roomID)

	if expirationSeconds <= 0 {
		expirationSeconds = 3600 // Default 1 hour
	}

	now := time.Now()
	expirationTime := now.Add(time.Duration(expirationSeconds) * time.Second)

	claims := ZegoClaims{
		AppID:    zc.appID,
		UserID:   userID,
		UserName: userName,
		RoomID:   roomID,
		Type:     "token",
		Nonce:    now.UnixNano(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}

	// Create token with HS256 algorithm
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Sign the token with the server secret
	tokenString, err := token.SignedString([]byte(zc.serverSecret))
	if err != nil {
		fmt.Println("[ZegoService] Token signing error:", err)
		return "", err
	}

	fmt.Println("[ZegoService] Token generated successfully, length:", len(tokenString))
	return tokenString, nil
}

// GetAppID returns the app ID
func (zc *ZegoCloudService) GetAppID() int64 {
	return zc.appID
}
