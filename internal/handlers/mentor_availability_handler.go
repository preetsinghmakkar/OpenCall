package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/preetsinghmakkar/OpenCall/internal/dtos"
	"github.com/preetsinghmakkar/OpenCall/internal/services"
)

type MentorAvailabilityHandler struct {
	service *services.MentorAvailabilityService
}

func NewMentorAvailabilityHandler(
	service *services.MentorAvailabilityService,
) *MentorAvailabilityHandler {
	return &MentorAvailabilityHandler{service: service}
}
func (h *MentorAvailabilityHandler) Create(c *gin.Context) {
	var req dtos.CreateMentorAvailabilityRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDStr, _ := c.Get("user_id")
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user"})
		return
	}

	resp, err := h.service.CreateRule(userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "cannot create availability"})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *MentorAvailabilityHandler) GetByUsername(c *gin.Context) {
	username := c.Param("username")

	resp, err := h.service.GetByUsername(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "availability not found"})
		return
	}

	c.JSON(http.StatusOK, resp)
}
