package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/interfaces/http/dto"
	catalogUC "github.com/pitgo/backend/internal/usecase/catalog"
)

type CatalogHandler struct {
	uc *catalogUC.UseCase
}

func NewCatalogHandler(uc *catalogUC.UseCase) *CatalogHandler {
	return &CatalogHandler{uc: uc}
}

// Categories

func (h *CatalogHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	cat, err := h.uc.CreateCategory(c.Request.Context(), req.Name, req.Slug, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "create_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, cat)
}

func (h *CatalogHandler) ListCategories(c *gin.Context) {
	categories, err := h.uc.ListCategories(c.Request.Context(), true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "list_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, categories)
}

// Services

func (h *CatalogHandler) CreateService(c *gin.Context) {
	var req dto.CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	svc, err := h.uc.CreateService(c.Request.Context(), req.CategoryID, req.Name, req.Slug, req.Description, req.BasePrice, req.Duration)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "create_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusCreated, svc)
}

func (h *CatalogHandler) ListServices(c *gin.Context) {
	categoryID := c.Query("category_id")
	services, err := h.uc.ListServices(c.Request.Context(), categoryID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "list_failed", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, services)
}

func (h *CatalogHandler) GetService(c *gin.Context) {
	svc, err := h.uc.GetService(c.Request.Context(), c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "not_found", Message: "service not found"})
		return
	}
	c.JSON(http.StatusOK, svc)
}
