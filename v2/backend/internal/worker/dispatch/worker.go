package dispatch

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/google/uuid"
	dispatchDomain "github.com/pitgo/backend/internal/domain/dispatch"
	"github.com/pitgo/backend/internal/domain/events"
	profileDomain "github.com/pitgo/backend/internal/domain/profile"
	"github.com/pitgo/backend/internal/infrastructure/logger"
	"github.com/pitgo/backend/internal/infrastructure/push"
	"github.com/pitgo/backend/internal/infrastructure/queue"
)

const maxProvidersPerDispatch = 5

// Worker listens for request.created events and dispatches to nearby providers.
type Worker struct {
	consumer     queue.Consumer
	publisher    queue.Publisher
	profileRepo  profileDomain.Repository
	dispatchRepo dispatchDomain.Repository
	notifier     push.Notifier
}

func NewWorker(
	consumer queue.Consumer,
	publisher queue.Publisher,
	profileRepo profileDomain.Repository,
	dispatchRepo dispatchDomain.Repository,
	notifier push.Notifier,
) *Worker {
	return &Worker{
		consumer:     consumer,
		publisher:    publisher,
		profileRepo:  profileRepo,
		dispatchRepo: dispatchRepo,
		notifier:     notifier,
	}
}

// Register subscribes the worker to relevant event topics.
// Call this BEFORE starting the queue consumer.
func (w *Worker) Register() error {
	return w.consumer.Subscribe(events.TopicRequestCreated, w.handleRequestCreated)
}

func (w *Worker) handleRequestCreated(ctx context.Context, msg queue.Message) error {
	// Unwrap envelope
	env, err := events.UnmarshalEnvelope(msg.Payload)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to unmarshal event envelope")
		return err
	}

	var evt events.RequestCreatedEvent
	if err := json.Unmarshal(env.Payload, &evt); err != nil {
		logger.Error().Err(err).Msg("Failed to unmarshal RequestCreatedEvent")
		return err
	}

	logger.Info().
		Str("request_id", evt.RequestID).
		Str("category", evt.Category).
		Str("correlation_id", env.CorrelationID).
		Msg("Processing request.created event")

	// 1. Find providers within a generous radius for this category
	providers, err := w.profileRepo.FindProvidersInRadius(ctx, evt.Latitude, evt.Longitude, 50, evt.Category)
	if err != nil {
		logger.Error().Err(err).Str("request_id", evt.RequestID).Msg("Failed to find providers")
		return err
	}

	if len(providers) == 0 {
		logger.Warn().Str("request_id", evt.RequestID).Msg("No eligible providers found")
		return nil
	}

	// 2. Score and rank: online first, then by distance
	type candidate struct {
		provider *profileDomain.ProviderDetails
		distance float64
		online   bool
	}

	var candidates []candidate
	for _, p := range providers {
		dist := haversine(evt.Latitude, evt.Longitude, p.Latitude, p.Longitude)
		candidates = append(candidates, candidate{
			provider: p,
			distance: dist,
			online:   p.IsOnline,
		})
	}

	// Prioritize online providers, then sort by distance
	sort.Slice(candidates, func(i, j int) bool {
		if candidates[i].online != candidates[j].online {
			return candidates[i].online // online first
		}
		return candidates[i].distance < candidates[j].distance
	})

	// 3. Limit to top N
	if len(candidates) > maxProvidersPerDispatch {
		candidates = candidates[:maxProvidersPerDispatch]
	}

	// 4. Create Dispatch records and push notifications
	var notifications []push.Notification
	var providerIDs []string

	for _, c := range candidates {
		d := &dispatchDomain.Dispatch{
			ID:         uuid.New().String(),
			RequestID:  evt.RequestID,
			ProviderID: c.provider.ProfileID,
			Status:     dispatchDomain.DispatchSent,
			Distance:   math.Round(c.distance*100) / 100,
			ExpiresAt:  time.Now().Add(5 * time.Minute),
			CreatedAt:  time.Now(),
			UpdatedAt:  time.Now(),
		}

		if err := w.dispatchRepo.Create(ctx, d); err != nil {
			logger.Error().Err(err).
				Str("dispatch_id", d.ID).
				Str("provider_id", c.provider.ProfileID).
				Msg("Failed to create dispatch record")
			continue
		}

		providerIDs = append(providerIDs, c.provider.ProfileID)

		notifications = append(notifications, push.Notification{
			ProviderID: c.provider.ProfileID,
			Title:      "Novo pedido de " + evt.Category,
			Body:       evt.Description,
			Data: map[string]string{
				"dispatch_id": d.ID,
				"request_id":  evt.RequestID,
				"distance_km": fmt.Sprintf("%.1f", c.distance),
			},
		})
	}

	// 5. Send push notifications
	if len(notifications) > 0 {
		if err := w.notifier.SendBatch(ctx, notifications); err != nil {
			logger.Error().Err(err).Str("request_id", evt.RequestID).Msg("Failed to send push notifications")
		}
	}

	// 6. Publish dispatch.sent event for downstream consumers
	sentEvt := events.DispatchSentEvent{
		RequestID:   evt.RequestID,
		ProviderIDs: providerIDs,
		Count:       len(providerIDs),
	}
	sentEnv, err := events.NewEnvelope(events.TopicDispatchSent, env.CorrelationID, sentEvt)
	if err == nil {
		data, _ := sentEnv.Marshal()
		_ = w.publisher.Publish(ctx, events.TopicDispatchSent, data)
	}

	logger.Info().
		Str("request_id", evt.RequestID).
		Int("dispatched", len(providerIDs)).
		Int("total_candidates", len(providers)).
		Msg("Dispatch completed")

	return nil
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
