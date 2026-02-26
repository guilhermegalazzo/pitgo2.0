package profile

import "context"

type Repository interface {
	Create(ctx context.Context, profile *Profile) error
	GetByID(ctx context.Context, id string) (*Profile, error)
	GetByUserID(ctx context.Context, userID string) (*Profile, error)
	Update(ctx context.Context, profile *Profile) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, profileType ProfileType, limit, offset int) ([]*Profile, error)

	CreateProviderDetails(ctx context.Context, details *ProviderDetails) error
	GetProviderDetails(ctx context.Context, profileID string) (*ProviderDetails, error)
	UpdateProviderDetails(ctx context.Context, details *ProviderDetails) error
	FindProvidersInRadius(ctx context.Context, lat, lng, radiusKm float64, category string) ([]*ProviderDetails, error)

	CreateAddress(ctx context.Context, address *Address) error
	GetAddresses(ctx context.Context, profileID string) ([]*Address, error)
	UpdateAddress(ctx context.Context, address *Address) error
	DeleteAddress(ctx context.Context, id string) error
}
