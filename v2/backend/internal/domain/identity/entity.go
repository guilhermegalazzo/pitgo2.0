package identity

import "time"

// User represents an authenticated user from Clerk.
type User struct {
	ID        string    `json:"id"`
	ClerkID   string    `json:"clerk_id"`
	Email     string    `json:"email"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Role string

const (
	RoleCustomer Role = "customer"
	RoleProvider Role = "provider"
	RoleAdmin    Role = "admin"
)

func (r Role) IsValid() bool {
	switch r {
	case RoleCustomer, RoleProvider, RoleAdmin:
		return true
	}
	return false
}
