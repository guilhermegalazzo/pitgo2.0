package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/domain/dispatch"
	"github.com/pitgo/backend/internal/interfaces/http/dto"
	dispatchUC "github.com/pitgo/backend/internal/usecase/dispatch"
)

type DispatchHandler struct {
	uc *dispatchUC.UseCase
}

func NewDispatchHandler(uc *dispatchUC.UseCase) *DispatchHandler {
	return &DispatchHandler{uc: uc}
}

func (h *DispatchHandler) Match(c *gin.Context) {
	var req dto.DispatchMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	criteria := dispatch.MatchCriteria{
		Latitude:  req.Latitude,
		Longitude: req.Longitude,
		RadiusKm:  req.RadiusKm,
		Category:  req.Category,
	}

	dispatches, err := h.uc.MatchProviders(c.Request.Context(), criteria)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "match_failed", Message: err.Error()})
		return
	}

	// Persist dispatches
	for _, d := range dispatches {
		d.RequestID = req.RequestID
		if err := h.uc.CreateDispatch(c.Request.Context(), d); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "dispatch_failed", Message: err.Error()})
			return
		}
	}

	c.JSON(http.StatusOK, dispatches)
}

func (h *DispatchHandler) Accept(c *gin.Context) {
	userID, _ := c.Get("user_id")
	d, err := h.uc.AcceptDispatch(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "accept_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, d)
}

func (h *DispatchHandler) Reject(c *gin.Context) {
	userID, _ := c.Get("user_id")
	d, err := h.uc.RejectDispatch(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "reject_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, d)
}
