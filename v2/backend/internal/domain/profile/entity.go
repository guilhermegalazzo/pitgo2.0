package profile

import "time"

type ProfileType string

const (
	TypeCustomer ProfileType = "customer"
	TypeProvider ProfileType = "provider"
)

// Profile represents either a customer or provider profile.
type Profile struct {
	ID          string      `json:"id"`
	UserID      string      `json:"user_id"`
	Type        ProfileType `json:"type"`
	FirstName   string      `json:"first_name"`
	LastName    string      `json:"last_name"`
	Phone       string      `json:"phone"`
	AvatarURL   string      `json:"avatar_url,omitempty"`
	Bio         string      `json:"bio,omitempty"`
	IsActive    bool        `json:"is_active"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// ProviderDetails holds provider-specific information.
type ProviderDetails struct {
	ProfileID    string   `json:"profile_id"`
	Categories   []string `json:"categories"`
	ServiceArea  float64  `json:"service_area_km"` // Radius in km
	Latitude     float64  `json:"latitude"`
	Longitude    float64  `json:"longitude"`
	Rating       float64  `json:"rating"`
	TotalJobs    int      `json:"total_jobs"`
	IsVerified   bool     `json:"is_verified"`
	IsOnline     bool     `json:"is_online"`
}

// Address represents a customer address.
type Address struct {
	ID         string  `json:"id"`
	ProfileID  string  `json:"profile_id"`
	Label      string  `json:"label"` // "home", "work", etc.
	Street     string  `json:"street"`
	City       string  `json:"city"`
	State      string  `json:"state"`
	ZipCode    string  `json:"zip_code"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
	IsDefault  bool    `json:"is_default"`
}
