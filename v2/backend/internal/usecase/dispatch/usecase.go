package dispatch

import (
	"context"
	"errors"
	"math"
	"sort"
	"time"

	"github.com/google/uuid"
	domain "github.com/pitgo/backend/internal/domain/dispatch"
	profileDomain "github.com/pitgo/backend/internal/domain/profile"
	"github.com/pitgo/backend/internal/infrastructure/logger"
)

var ErrInvalidAction = errors.New("invalid dispatch action")

type UseCase struct {
	repo        domain.Repository
	profileRepo profileDomain.Repository
}

func New(repo domain.Repository, profileRepo profileDomain.Repository) *UseCase {
	return &UseCase{repo: repo, profileRepo: profileRepo}
}

// MatchProviders finds providers within the given radius and category, sorted by distance.
func (uc *UseCase) MatchProviders(ctx context.Context, criteria domain.MatchCriteria) ([]*domain.Dispatch, error) {
	providers, err := uc.profileRepo.FindProvidersInRadius(ctx, criteria.Latitude, criteria.Longitude, criteria.RadiusKm, criteria.Category)
	if err != nil {
		return nil, err
	}

	type ranked struct {
		provider *profileDomain.ProviderDetails
		distance float64
	}

	var candidates []ranked
	for _, p := range providers {
		dist := haversine(criteria.Latitude, criteria.Longitude, p.Latitude, p.Longitude)
		if dist <= criteria.RadiusKm {
			candidates = append(candidates, ranked{provider: p, distance: dist})
		}
	}

	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].distance < candidates[j].distance
	})

	var dispatches []*domain.Dispatch
	for _, c := range candidates {
		d := &domain.Dispatch{
			ID:         uuid.New().String(),
			ProviderID: c.provider.ProfileID,
			Status:     domain.DispatchPending,
			Distance:   math.Round(c.distance*100) / 100,
			ExpiresAt:  time.Now().Add(5 * time.Minute),
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}
		dispatches = append(dispatches, d)
	}

	logger.Info().
		Int("candidates", len(dispatches)).
		Float64("radius_km", criteria.RadiusKm).
		Str("category", criteria.Category).
		Msg("Dispatch matching completed")

	return dispatches, nil
}

func (uc *UseCase) CreateDispatch(ctx context.Context, d *domain.Dispatch) error {
	return uc.repo.Create(ctx, d)
}

func (uc *UseCase) AcceptDispatch(ctx context.Context, id, providerID string) (*domain.Dispatch, error) {
	d, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if d.ProviderID != providerID || d.Status != domain.DispatchPending {
		return nil, ErrInvalidAction
	}
	d.Status = domain.DispatchAccepted
	d.UpdatedAt = time.Now()
	if err := uc.repo.Update(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}

func (uc *UseCase) RejectDispatch(ctx context.Context, id, providerID string) (*domain.Dispatch, error) {
	d, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if d.ProviderID != providerID || d.Status != domain.DispatchPending {
		return nil, ErrInvalidAction
	}
	d.Status = domain.DispatchRejected
	d.UpdatedAt = time.Now()
	if err := uc.repo.Update(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}

func haversine(lat1, lng1, lat2, lng2 float64) float64 {
	const r = 6371
	dLat := (lat2 - lat1) * math.Pi / 180
	dLng := (lng2 - lng1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLng/2)*math.Sin(dLng/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return r * c
}
