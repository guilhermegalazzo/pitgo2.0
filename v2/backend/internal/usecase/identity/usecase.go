package identity

import (
	"context"
	"time"

	"github.com/google/uuid"
	domain "github.com/pitgo/backend/internal/domain/identity"
)

type UseCase struct {
	repo domain.Repository
}

func New(repo domain.Repository) *UseCase {
	return &UseCase{repo: repo}
}

func (uc *UseCase) CreateUser(ctx context.Context, clerkID, email string, role domain.Role) (*domain.User, error) {
	user := &domain.User{
		ID:        uuid.New().String(),
		ClerkID:   clerkID,
		Email:     email,
		Role:      role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	if err := uc.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *UseCase) GetByClerkID(ctx context.Context, clerkID string) (*domain.User, error) {
	return uc.repo.GetByClerkID(ctx, clerkID)
}

func (uc *UseCase) GetByID(ctx context.Context, id string) (*domain.User, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *UseCase) UpdateRole(ctx context.Context, id string, role domain.Role) (*domain.User, error) {
	user, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	user.Role = role
	user.UpdatedAt = time.Now()
	if err := uc.repo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *UseCase) ListUsers(ctx context.Context, limit, offset int) ([]*domain.User, error) {
	return uc.repo.List(ctx, limit, offset)
}
