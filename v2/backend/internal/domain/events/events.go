package events

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Topic constants — single source of truth for event routing.
// When migrating to Kafka, these become Kafka topic names.
const (
	TopicRequestCreated   = "request.created"
	TopicRequestAccepted  = "request.accepted"
	TopicRequestStarted   = "request.started"
	TopicRequestCompleted = "request.completed"
	TopicRequestCancelled = "request.cancelled"

	TopicDispatchSent     = "dispatch.sent"
	TopicDispatchAccepted = "dispatch.accepted"
	TopicDispatchRejected = "dispatch.rejected"
	TopicDispatchExpired  = "dispatch.expired"
)

// Envelope wraps every event with metadata for tracing and Kafka compatibility.
type Envelope struct {
	EventID       string          `json:"event_id"`
	CorrelationID string          `json:"correlation_id"`
	Topic         string          `json:"topic"`
	Timestamp     time.Time       `json:"timestamp"`
	Payload       json.RawMessage `json:"payload"`
}

// NewEnvelope creates a traceable event envelope.
func NewEnvelope(topic string, correlationID string, payload any) (*Envelope, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	if correlationID == "" {
		correlationID = uuid.New().String()
	}
	return &Envelope{
		EventID:       uuid.New().String(),
		CorrelationID: correlationID,
		Topic:         topic,
		Timestamp:     time.Now(),
		Payload:       data,
	}, nil
}

// Marshal serializes the full envelope to JSON bytes (for queue publishing).
func (e *Envelope) Marshal() ([]byte, error) {
	return json.Marshal(e)
}

// UnmarshalEnvelope deserializes queue bytes back into an Envelope.
func UnmarshalEnvelope(data []byte) (*Envelope, error) {
	var env Envelope
	if err := json.Unmarshal(data, &env); err != nil {
		return nil, err
	}
	return &env, nil
}

// --- Typed Event Payloads ---

// RequestCreatedEvent is published when a customer creates a new request.
type RequestCreatedEvent struct {
	RequestID   string  `json:"request_id"`
	CustomerID  string  `json:"customer_id"`
	Category    string  `json:"category"`
	Description string  `json:"description"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
}

// DispatchSentEvent is published when dispatches are sent to providers.
type DispatchSentEvent struct {
	RequestID   string   `json:"request_id"`
	ProviderIDs []string `json:"provider_ids"`
	Count       int      `json:"count"`
}
