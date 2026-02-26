package request

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	domain "github.com/pitgo/backend/internal/domain/request"
	"github.com/pitgo/backend/internal/domain/events"
	"github.com/pitgo/backend/internal/infrastructure/logger"
	"github.com/pitgo/backend/internal/infrastructure/queue"
)

var (
	ErrNotFound      = errors.New("request not found")
	ErrInvalidStatus = errors.New("invalid status transition")
	ErrNotOwner      = errors.New("not the owner of this request")
)

type UseCase struct {
	repo      domain.Repository
	publisher queue.Publisher
}

func New(repo domain.Repository, publisher queue.Publisher) *UseCase {
	return &UseCase{repo: repo, publisher: publisher}
}

// publishEvent wraps the payload in a traceable Envelope before publishing.
func (uc *UseCase) publishEvent(ctx context.Context, topic string, correlationID string, payload any) {
	env, err := events.NewEnvelope(topic, correlationID, payload)
	if err != nil {
		logger.Error().Err(err).Str("topic", topic).Msg("Failed to create event envelope")
		return
	}
	data, err := env.Marshal()
	if err != nil {
		logger.Error().Err(err).Str("topic", topic).Msg("Failed to marshal event envelope")
		return
	}
	if err := uc.publisher.Publish(ctx, topic, data); err != nil {
		logger.Error().Err(err).Str("topic", topic).Msg("Failed to publish event")
	}
}

func (uc *UseCase) CreateRequest(
	ctx context.Context,
	customerID, serviceID, category, description, photoURL, addressID string,
	lat, lng float64,
	scheduledAt time.Time,
	notes string,
	totalPrice int64,
) (*domain.ServiceRequest, error) {
	req := &domain.ServiceRequest{
		ID:          uuid.New().String(),
		CustomerID:  customerID,
		ServiceID:   serviceID,
		Category:    category,
		Status:      domain.StatusOpen,
		Description: description,
		PhotoURL:    photoURL,
		TotalPrice:  totalPrice,
		Notes:       notes,
		ScheduledAt: scheduledAt,
		AddressID:   addressID,
		Latitude:    lat,
		Longitude:   lng,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	if err := uc.repo.Create(ctx, req); err != nil {
		return nil, err
	}

	logger.Info().Str("request_id", req.ID).Str("customer_id", customerID).Msg("Request created")

	// Publish typed event with envelope — triggers dispatch worker
	uc.publishEvent(ctx, events.TopicRequestCreated, req.ID, events.RequestCreatedEvent{
		RequestID:   req.ID,
		CustomerID:  customerID,
		Category:    category,
		Description: description,
		Latitude:    lat,
		Longitude:   lng,
	})

	return req, nil
}

func (uc *UseCase) GetByID(ctx context.Context, id string) (*domain.ServiceRequest, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *UseCase) ListAvailable(ctx context.Context, lat, lng, radiusKm float64, category string, limit, offset int) ([]*domain.ServiceRequest, error) {
	if limit <= 0 {
		limit = 20
	}
	return uc.repo.ListAvailable(ctx, lat, lng, radiusKm, category, limit, offset)
}

func (uc *UseCase) AcceptRequest(ctx context.Context, id, providerID string) (*domain.ServiceRequest, error) {
	req, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Status != domain.StatusOpen {
		return nil, ErrInvalidStatus
	}
	now := time.Now()
	req.Status = domain.StatusAccepted
	req.ProviderID = providerID
	req.AcceptedAt = &now
	req.UpdatedAt = now
	if err := uc.repo.Update(ctx, req); err != nil {
		return nil, err
	}

	logger.Info().Str("request_id", id).Str("provider_id", providerID).Msg("Request accepted")
	uc.publishEvent(ctx, events.TopicRequestAccepted, id, req)

	return req, nil
}

func (uc *UseCase) StartRequest(ctx context.Context, id, providerID string) (*domain.ServiceRequest, error) {
	req, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Status != domain.StatusAccepted || req.ProviderID != providerID {
		return nil, ErrInvalidStatus
	}
	now := time.Now()
	req.Status = domain.StatusInProgress
	req.StartedAt = &now
	req.UpdatedAt = now
	if err := uc.repo.Update(ctx, req); err != nil {
		return nil, err
	}

	logger.Info().Str("request_id", id).Msg("Request started")
	uc.publishEvent(ctx, events.TopicRequestStarted, id, req)

	return req, nil
}

func (uc *UseCase) CompleteRequest(ctx context.Context, id, providerID string) (*domain.ServiceRequest, error) {
	req, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Status != domain.StatusInProgress || req.ProviderID != providerID {
		return nil, ErrInvalidStatus
	}
	now := time.Now()
	req.Status = domain.StatusCompleted
	req.CompletedAt = &now
	req.UpdatedAt = now
	if err := uc.repo.Update(ctx, req); err != nil {
		return nil, err
	}

	logger.Info().Str("request_id", id).Msg("Request completed")
	uc.publishEvent(ctx, events.TopicRequestCompleted, id, req)

	return req, nil
}

func (uc *UseCase) CancelRequest(ctx context.Context, id, customerID string) (*domain.ServiceRequest, error) {
	req, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.CustomerID != customerID {
		return nil, ErrNotOwner
	}
	if req.Status == domain.StatusCompleted || req.Status == domain.StatusCancelled {
		return nil, ErrInvalidStatus
	}
	now := time.Now()
	req.Status = domain.StatusCancelled
	req.CancelledAt = &now
	req.UpdatedAt = now
	if err := uc.repo.Update(ctx, req); err != nil {
		return nil, err
	}

	logger.Info().Str("request_id", id).Msg("Request cancelled")
	uc.publishEvent(ctx, events.TopicRequestCancelled, id, req)

	return req, nil
}

func (uc *UseCase) ListByCustomer(ctx context.Context, customerID string, status domain.Status, limit, offset int) ([]*domain.ServiceRequest, error) {
	return uc.repo.ListByCustomer(ctx, customerID, status, limit, offset)
}

func (uc *UseCase) ListByProvider(ctx context.Context, providerID string, status domain.Status, limit, offset int) ([]*domain.ServiceRequest, error) {
	return uc.repo.ListByProvider(ctx, providerID, status, limit, offset)
}
