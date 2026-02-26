package catalog

import (
	"context"
	"time"

	"github.com/google/uuid"
	domain "github.com/pitgo/backend/internal/domain/catalog"
)

type UseCase struct {
	repo domain.Repository
}

func New(repo domain.Repository) *UseCase {
	return &UseCase{repo: repo}
}

// Categories

func (uc *UseCase) CreateCategory(ctx context.Context, name, slug, description string) (*domain.Category, error) {
	cat := &domain.Category{
		ID:          uuid.New().String(),
		Name:        name,
		Slug:        slug,
		Description: description,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := uc.repo.CreateCategory(ctx, cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (uc *UseCase) ListCategories(ctx context.Context, activeOnly bool) ([]*domain.Category, error) {
	return uc.repo.ListCategories(ctx, activeOnly)
}

// Services

func (uc *UseCase) CreateService(ctx context.Context, categoryID, name, slug, description string, basePrice int64, duration int) (*domain.Service, error) {
	svc := &domain.Service{
		ID:          uuid.New().String(),
		CategoryID:  categoryID,
		Name:        name,
		Slug:        slug,
		Description: description,
		BasePrice:   basePrice,
		Duration:    duration,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := uc.repo.CreateService(ctx, svc); err != nil {
		return nil, err
	}
	return svc, nil
}

func (uc *UseCase) ListServices(ctx context.Context, categoryID string, activeOnly bool) ([]*domain.Service, error) {
	return uc.repo.ListServices(ctx, categoryID, activeOnly)
}

func (uc *UseCase) GetService(ctx context.Context, id string) (*domain.Service, error) {
	return uc.repo.GetServiceByID(ctx, id)
}
