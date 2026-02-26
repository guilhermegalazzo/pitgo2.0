package request

import "context"

type Repository interface {
	Create(ctx context.Context, req *ServiceRequest) error
	GetByID(ctx context.Context, id string) (*ServiceRequest, error)
	Update(ctx context.Context, req *ServiceRequest) error
	ListByCustomer(ctx context.Context, customerID string, status Status, limit, offset int) ([]*ServiceRequest, error)
	ListByProvider(ctx context.Context, providerID string, status Status, limit, offset int) ([]*ServiceRequest, error)

	// ListAvailable returns open requests within radiusKm of (lat, lng),
	// optionally filtered by category, ordered by distance (Haversine).
	ListAvailable(ctx context.Context, lat, lng, radiusKm float64, category string, limit, offset int) ([]*ServiceRequest, error)

	// Items
	CreateItem(ctx context.Context, item *RequestItem) error
	GetItems(ctx context.Context, requestID string) ([]*RequestItem, error)
}
