package push

import (
	"context"

	"github.com/pitgo/backend/internal/infrastructure/logger"
)

// Notification represents a push notification payload.
type Notification struct {
	ProviderID string            `json:"provider_id"`
	Title      string            `json:"title"`
	Body       string            `json:"body"`
	Data       map[string]string `json:"data,omitempty"`
}

// Notifier sends push notifications to providers.
// Implement this interface for Firebase Cloud Messaging, APNs, etc.
type Notifier interface {
	Send(ctx context.Context, notification Notification) error
	SendBatch(ctx context.Context, notifications []Notification) error
}

// --- LogNotifier: Development/Test Stub ---

// LogNotifier logs push notifications instead of sending them.
// Replace with FirebaseNotifier or APNsNotifier in production.
type LogNotifier struct{}

func NewLogNotifier() *LogNotifier {
	return &LogNotifier{}
}

func (n *LogNotifier) Send(_ context.Context, notif Notification) error {
	logger.Info().
		Str("provider_id", notif.ProviderID).
		Str("title", notif.Title).
		Str("body", notif.Body).
		Interface("data", notif.Data).
		Msg("📱 PUSH notification (dev stub)")
	return nil
}

func (n *LogNotifier) SendBatch(ctx context.Context, notifications []Notification) error {
	for _, notif := range notifications {
		if err := n.Send(ctx, notif); err != nil {
			return err
		}
	}
	return nil
}
