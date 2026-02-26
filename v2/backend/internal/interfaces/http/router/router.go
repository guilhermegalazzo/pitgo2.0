package router

import (
	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/infrastructure/auth"
	"github.com/pitgo/backend/internal/interfaces/http/handler"
	"github.com/pitgo/backend/internal/interfaces/http/middleware"
)

type Handlers struct {
	Health   *handler.HealthHandler
	Identity *handler.IdentityHandler
	Profile  *handler.ProfileHandler
	Catalog  *handler.CatalogHandler
	Request  *handler.RequestHandler
	Dispatch *handler.DispatchHandler
}

func Setup(r *gin.Engine, clerkAuth *auth.ClerkAuth, rlCfg middleware.RateLimiterConfig, h Handlers) {
	// Global middleware
	r.Use(middleware.ErrorHandler())
	r.Use(middleware.RequestIDMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware(rlCfg))

	// Public routes
	r.GET("/health", h.Health.Check)

	// API v1
	v1 := r.Group("/api/v1")

	// --- Public catalog endpoints ---
	catalog := v1.Group("/catalog")
	{
		catalog.GET("/categories", h.Catalog.ListCategories)
		catalog.GET("/services", h.Catalog.ListServices)
		catalog.GET("/services/:id", h.Catalog.GetService)
	}

	// --- Authenticated routes ---
	authed := v1.Group("")
	authed.Use(middleware.AuthMiddleware(clerkAuth))
	{
		// Identity
		authed.POST("/users", h.Identity.CreateUser)
		authed.GET("/me", h.Identity.GetMe)

		// Profile
		authed.POST("/profiles", h.Profile.CreateProfile)
		authed.GET("/profiles/me", h.Profile.GetMyProfile)
		authed.PUT("/profiles/me", h.Profile.UpdateProfile)

		// Any authenticated user can view a request by ID
		authed.GET("/requests/:id", h.Request.GetByID)

		// Service Requests (customer)
		customerRoutes := authed.Group("")
		customerRoutes.Use(middleware.RequireRole("customer", "admin"))
		{
			customerRoutes.POST("/requests", h.Request.CreateRequest)
			customerRoutes.GET("/requests", h.Request.ListByCustomer)
			customerRoutes.POST("/requests/:id/cancel", h.Request.CancelRequest)
		}

		// Provider routes
		providerRoutes := authed.Group("")
		providerRoutes.Use(middleware.RequireRole("provider", "admin"))
		{
			providerRoutes.GET("/requests/available", h.Request.ListAvailable)
			providerRoutes.POST("/requests/:id/accept", h.Request.AcceptRequest)
			providerRoutes.POST("/requests/:id/start", h.Request.StartRequest)
			providerRoutes.POST("/requests/:id/complete", h.Request.CompleteRequest)
			providerRoutes.POST("/dispatches/:id/accept", h.Dispatch.Accept)
			providerRoutes.POST("/dispatches/:id/reject", h.Dispatch.Reject)
		}

		// Admin routes
		adminRoutes := authed.Group("/admin")
		adminRoutes.Use(middleware.RequireAdmin())
		{
			adminRoutes.GET("/users", h.Identity.ListUsers)
			adminRoutes.GET("/users/:id", h.Identity.GetUser)
			adminRoutes.POST("/catalog/categories", h.Catalog.CreateCategory)
			adminRoutes.POST("/catalog/services", h.Catalog.CreateService)
			adminRoutes.POST("/dispatch/match", h.Dispatch.Match)
		}
	}
}
