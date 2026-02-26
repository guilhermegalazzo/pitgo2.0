package dispatch

import "time"

type DispatchStatus string

const (
	DispatchPending  DispatchStatus = "pending"
	DispatchSent     DispatchStatus = "sent"
	DispatchAccepted DispatchStatus = "accepted"
	DispatchRejected DispatchStatus = "rejected"
	DispatchExpired  DispatchStatus = "expired"
)

// Dispatch represents a match attempt between a request and a provider.
type Dispatch struct {
	ID         string         `json:"id"`
	RequestID  string         `json:"request_id"`
	ProviderID string         `json:"provider_id"`
	Status     DispatchStatus `json:"status"`
	Distance   float64        `json:"distance_km"`
	ExpiresAt  time.Time      `json:"expires_at"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

// MatchCriteria are used to find suitable providers.
type MatchCriteria struct {
	Latitude  float64  `json:"latitude"`
	Longitude float64  `json:"longitude"`
	RadiusKm  float64  `json:"radius_km"`
	Category  string   `json:"category"`
	ServiceID string   `json:"service_id"`
}
