package dto

import "time"

// --- Common ---

type PaginationQuery struct {
	Limit  int `form:"limit,default=20"`
	Offset int `form:"offset,default=0"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// --- Identity ---

type CreateUserRequest struct {
	ClerkID string `json:"clerk_id" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Role    string `json:"role" binding:"required,oneof=customer provider admin"`
}

// --- Profile ---

type CreateProfileRequest struct {
	Type      string `json:"type" binding:"required,oneof=customer provider"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Phone     string `json:"phone" binding:"required"`
}

type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Bio       string `json:"bio"`
	AvatarURL string `json:"avatar_url"`
}

// --- Catalog ---

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
}

type CreateServiceRequest struct {
	CategoryID  string `json:"category_id" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
	BasePrice   int64  `json:"base_price" binding:"required,min=0"`
	Duration    int    `json:"duration_minutes" binding:"required,min=1"`
}

// --- Request ---

type CreateServiceRequestDTO struct {
	ServiceID   string    `json:"service_id" binding:"required"`
	Category    string    `json:"category" binding:"required"`
	Description string    `json:"description" binding:"required,min=10"`
	Latitude    float64   `json:"latitude" binding:"required"`
	Longitude   float64   `json:"longitude" binding:"required"`
	ScheduledAt time.Time `json:"scheduled_at" binding:"required"`
	PhotoURL    string    `json:"photo_url"`
	AddressID   string    `json:"address_id"`
	Notes       string    `json:"notes"`
	TotalPrice  int64     `json:"total_price" binding:"required,min=0"`
}

type AvailableRequestsQuery struct {
	Latitude  float64 `form:"lat" binding:"required"`
	Longitude float64 `form:"lng" binding:"required"`
	RadiusKm  float64 `form:"radius_km,default=10"`
	Category  string  `form:"category"`
	Limit     int     `form:"limit,default=20"`
	Offset    int     `form:"offset,default=0"`
}

// --- Dispatch ---

type DispatchMatchRequest struct {
	RequestID string  `json:"request_id" binding:"required"`
	Latitude  float64 `json:"latitude" binding:"required"`
	Longitude float64 `json:"longitude" binding:"required"`
	RadiusKm  float64 `json:"radius_km" binding:"required,min=1"`
	Category  string  `json:"category" binding:"required"`
}
