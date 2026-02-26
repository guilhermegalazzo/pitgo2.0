package catalog

import "context"

type Repository interface {
	CreateCategory(ctx context.Context, category *Category) error
	GetCategoryByID(ctx context.Context, id string) (*Category, error)
	GetCategoryBySlug(ctx context.Context, slug string) (*Category, error)
	ListCategories(ctx context.Context, activeOnly bool) ([]*Category, error)
	UpdateCategory(ctx context.Context, category *Category) error
	DeleteCategory(ctx context.Context, id string) error

	CreateService(ctx context.Context, service *Service) error
	GetServiceByID(ctx context.Context, id string) (*Service, error)
	GetServiceBySlug(ctx context.Context, slug string) (*Service, error)
	ListServices(ctx context.Context, categoryID string, activeOnly bool) ([]*Service, error)
	UpdateService(ctx context.Context, service *Service) error
	DeleteService(ctx context.Context, id string) error

	CreatePriceModifier(ctx context.Context, modifier *PriceModifier) error
	GetPriceModifiers(ctx context.Context, serviceID string) ([]*PriceModifier, error)
	DeletePriceModifier(ctx context.Context, id string) error
}
