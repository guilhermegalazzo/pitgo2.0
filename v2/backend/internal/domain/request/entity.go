package request

import "time"

type Status string

const (
	StatusOpen       Status = "open"
	StatusAccepted   Status = "accepted"
	StatusInProgress Status = "in_progress"
	StatusCompleted  Status = "completed"
	StatusCancelled  Status = "cancelled"
)

// ServiceRequest represents a customer's request for a service.
type ServiceRequest struct {
	ID          string    `json:"id"`
	CustomerID  string    `json:"customer_id"`
	ProviderID  string    `json:"provider_id,omitempty"`
	ServiceID   string    `json:"service_id"`
	Category    string    `json:"category"`
	Status      Status    `json:"status"`
	Description string    `json:"description"`
	PhotoURL    string    `json:"photo_url,omitempty"`
	TotalPrice  int64     `json:"total_price"`
	Notes       string    `json:"notes,omitempty"`
	ScheduledAt time.Time `json:"scheduled_at"`

	// Location
	AddressID string  `json:"address_id,omitempty"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`

	// Transient (populated by geo-queries, not persisted)
	DistanceKm float64 `json:"distance_km,omitempty"`

	// Timestamps
	AcceptedAt  *time.Time `json:"accepted_at,omitempty"`
	StartedAt   *time.Time `json:"started_at,omitempty"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
	CancelledAt *time.Time `json:"cancelled_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// RequestItem represents a line item in a service request.
type RequestItem struct {
	ID             string   `json:"id"`
	RequestID      string   `json:"request_id"`
	ServiceID      string   `json:"service_id"`
	ServiceName    string   `json:"service_name"`
	Quantity       int      `json:"quantity"`
	UnitPrice      int64    `json:"unit_price"`
	TotalPrice     int64    `json:"total_price"`
	PriceModifiers []string `json:"price_modifiers,omitempty"`
}
