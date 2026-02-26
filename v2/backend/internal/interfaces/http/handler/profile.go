package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/domain/profile"
	"github.com/pitgo/backend/internal/interfaces/http/dto"
	profileUC "github.com/pitgo/backend/internal/usecase/profile"
)

type ProfileHandler struct {
	uc *profileUC.UseCase
}

func NewProfileHandler(uc *profileUC.UseCase) *ProfileHandler {
	return &ProfileHandler{uc: uc}
}

func (h *ProfileHandler) CreateProfile(c *gin.Context) {
	var req dto.CreateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	p, err := h.uc.CreateProfile(c.Request.Context(), userID.(string), profile.ProfileType(req.Type), req.FirstName, req.LastName, req.Phone)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "create_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (h *ProfileHandler) GetMyProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	p, err := h.uc.GetByUserID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "profile not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	existing, err := h.uc.GetByUserID(c.Request.Context(), userID.(string))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "profile not found"})
		return
	}

	if req.FirstName != "" {
		existing.FirstName = req.FirstName
	}
	if req.LastName != "" {
		existing.LastName = req.LastName
	}
	if req.Phone != "" {
		existing.Phone = req.Phone
	}
	if req.Bio != "" {
		existing.Bio = req.Bio
	}
	if req.AvatarURL != "" {
		existing.AvatarURL = req.AvatarURL
	}

	updated, err := h.uc.UpdateProfile(c.Request.Context(), existing)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "update_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}
