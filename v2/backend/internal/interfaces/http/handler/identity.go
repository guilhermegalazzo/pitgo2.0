package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/domain/identity"
	"github.com/pitgo/backend/internal/interfaces/http/dto"
	"github.com/pitgo/backend/internal/interfaces/http/middleware"
	identityUC "github.com/pitgo/backend/internal/usecase/identity"
)

type IdentityHandler struct {
	uc *identityUC.UseCase
}

func NewIdentityHandler(uc *identityUC.UseCase) *IdentityHandler {
	return &IdentityHandler{uc: uc}
}

func (h *IdentityHandler) CreateUser(c *gin.Context) {
	var req dto.CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	user, err := h.uc.CreateUser(c.Request.Context(), req.ClerkID, req.Email, identity.Role(req.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "create_failed", Message: err.Error()})
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *IdentityHandler) GetMe(c *gin.Context) {
	clerkID, exists := c.Get(middleware.ContextKeyUserID)
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized", Message: "user not found in context"})
		return
	}

	role, _ := c.Get(middleware.ContextKeyRole)
	user, err := h.uc.GetByClerkID(c.Request.Context(), clerkID.(string))
	if err != nil {
		// If not found in our DB, return at least the Clerk info
		c.JSON(http.StatusOK, gin.H{
			"clerk_id": clerkID,
			"role":     role,
			"synced":   false,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":   user,
		"role":   role, // This is the role from the TOKEN (source of truth)
		"synced": true,
	})
}

func (h *IdentityHandler) GetUser(c *gin.Context) {
	user, err := h.uc.GetByID(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *IdentityHandler) ListUsers(c *gin.Context) {
	var q dto.PaginationQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	users, err := h.uc.ListUsers(c.Request.Context(), q.Limit, q.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "list_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}
