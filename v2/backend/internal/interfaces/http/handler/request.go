package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/domain/request"
	"github.com/pitgo/backend/internal/interfaces/http/dto"
	"github.com/pitgo/backend/internal/interfaces/http/middleware"
	requestUC "github.com/pitgo/backend/internal/usecase/request"
)

type RequestHandler struct {
	uc *requestUC.UseCase
}

func NewRequestHandler(uc *requestUC.UseCase) *RequestHandler {
	return &RequestHandler{uc: uc}
}

func (h *RequestHandler) CreateRequest(c *gin.Context) {
	var req dto.CreateServiceRequestDTO
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	userID, _ := c.Get(middleware.ContextKeyUserID)
	sr, err := h.uc.CreateRequest(
		c.Request.Context(),
		userID.(string),
		req.ServiceID,
		req.Category,
		req.Description,
		req.PhotoURL,
		req.AddressID,
		req.Latitude,
		req.Longitude,
		req.ScheduledAt,
		req.Notes,
		req.TotalPrice,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "create_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, sr)
}

func (h *RequestHandler) GetByID(c *gin.Context) {
	sr, err := h.uc.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "request not found"})
		return
	}
	c.JSON(http.StatusOK, sr)
}

func (h *RequestHandler) ListByCustomer(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)
	var q dto.PaginationQuery
	_ = c.ShouldBindQuery(&q)
	status := request.Status(c.Query("status"))
	requests, err := h.uc.ListByCustomer(c.Request.Context(), userID.(string), status, q.Limit, q.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "list_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": requests, "count": len(requests)})
}

func (h *RequestHandler) ListAvailable(c *gin.Context) {
	var q dto.AvailableRequestsQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	requests, err := h.uc.ListAvailable(c.Request.Context(), q.Latitude, q.Longitude, q.RadiusKm, q.Category, q.Limit, q.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "list_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"requests": requests, "count": len(requests)})
}

func (h *RequestHandler) AcceptRequest(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)
	sr, err := h.uc.AcceptRequest(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "accept_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, sr)
}

func (h *RequestHandler) StartRequest(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)
	sr, err := h.uc.StartRequest(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "start_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, sr)
}

func (h *RequestHandler) CompleteRequest(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)
	sr, err := h.uc.CompleteRequest(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "complete_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, sr)
}

func (h *RequestHandler) CancelRequest(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)
	sr, err := h.uc.CancelRequest(c.Request.Context(), c.Param("id"), userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "cancel_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, sr)
}
