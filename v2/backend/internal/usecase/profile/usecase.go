package profile

import (
	"context"
	"time"

	"github.com/google/uuid"
	domain "github.com/pitgo/backend/internal/domain/profile"
)

type UseCase struct {
	repo domain.Repository
}

func New(repo domain.Repository) *UseCase {
	return &UseCase{repo: repo}
}

func (uc *UseCase) CreateProfile(ctx context.Context, userID string, pType domain.ProfileType, firstName, lastName, phone string) (*domain.Profile, error) {
	profile := &domain.Profile{
		ID:        uuid.New().String(),
		UserID:    userID,
		Type:      pType,
		FirstName: firstName,
		LastName:  lastName,
		Phone:     phone,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := uc.repo.Create(ctx, profile); err != nil {
		return nil, err
	}
	return profile, nil
}

func (uc *UseCase) GetByUserID(ctx context.Context, userID string) (*domain.Profile, error) {
	return uc.repo.GetByUserID(ctx, userID)
}

func (uc *UseCase) UpdateProfile(ctx context.Context, profile *domain.Profile) (*domain.Profile, error) {
	profile.UpdatedAt = time.Now()
	if err := uc.repo.Update(ctx, profile); err != nil {
		return nil, err
	}
	return profile, nil
}

func (uc *UseCase) SetProviderDetails(ctx context.Context, details *domain.ProviderDetails) error {
	existing, _ := uc.repo.GetProviderDetails(ctx, details.ProfileID)
	if existing != nil {
		return uc.repo.UpdateProviderDetails(ctx, details)
	}
	return uc.repo.CreateProviderDetails(ctx, details)
}

func (uc *UseCase) FindNearbyProviders(ctx context.Context, lat, lng, radiusKm float64, category string) ([]*domain.ProviderDetails, error) {
	return uc.repo.FindProvidersInRadius(ctx, lat, lng, radiusKm, category)
}
