package catalog

import "time"

// Category groups related services.
type Category struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	IconURL     string    `json:"icon_url,omitempty"`
	IsActive    bool      `json:"is_active"`
	SortOrder   int       `json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Service represents a service offered in the marketplace.
type Service struct {
	ID          string    `json:"id"`
	CategoryID  string    `json:"category_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	BasePrice   int64     `json:"base_price"` // cents
	Duration    int       `json:"duration_minutes"`
	ImageURL    string    `json:"image_url,omitempty"`
	IsActive    bool      `json:"is_active"`
	SortOrder   int       `json:"sort_order"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PriceModifier adjusts the base price based on variables.
type PriceModifier struct {
	ID        string `json:"id"`
	ServiceID string `json:"service_id"`
	Name      string `json:"name"`       // e.g. "Vehicle Size"
	Value     string `json:"value"`      // e.g. "SUV"
	PriceDelta int64 `json:"price_delta"` // cents added to base price
}
