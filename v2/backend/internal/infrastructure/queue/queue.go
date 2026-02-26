package queue

import (
	"context"
	"sync"

	"github.com/pitgo/backend/internal/infrastructure/logger"
)

// Message represents a queue message.
type Message struct {
	ID      string
	Topic   string
	Payload []byte
}

// Handler processes a queue message.
type Handler func(ctx context.Context, msg Message) error

// Publisher sends messages to a queue.
type Publisher interface {
	Publish(ctx context.Context, topic string, payload []byte) error
	Close() error
}

// Consumer receives messages from a queue.
type Consumer interface {
	Subscribe(topic string, handler Handler) error
	Start(ctx context.Context) error
	Close() error
}

// --- In-Memory Implementation (dev/test) ---

type InMemoryQueue struct {
	mu       sync.RWMutex
	handlers map[string][]Handler
	messages chan Message
}

func NewInMemoryQueue() *InMemoryQueue {
	return &InMemoryQueue{
		handlers: make(map[string][]Handler),
		messages: make(chan Message, 1000),
	}
}

func (q *InMemoryQueue) Publish(_ context.Context, topic string, payload []byte) error {
	msg := Message{
		ID:      "", // Will be set by consumer
		Topic:   topic,
		Payload: payload,
	}
	q.messages <- msg
	logger.Debug().Str("topic", topic).Msg("Message published to in-memory queue")
	return nil
}

func (q *InMemoryQueue) Subscribe(topic string, handler Handler) error {
	q.mu.Lock()
	defer q.mu.Unlock()
	q.handlers[topic] = append(q.handlers[topic], handler)
	return nil
}

func (q *InMemoryQueue) Start(ctx context.Context) error {
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case msg := <-q.messages:
				q.mu.RLock()
				handlers := q.handlers[msg.Topic]
				q.mu.RUnlock()
				for _, h := range handlers {
					if err := h(ctx, msg); err != nil {
						logger.Error().Err(err).Str("topic", msg.Topic).Msg("Error processing message")
					}
				}
			}
		}
	}()
	return nil
}

func (q *InMemoryQueue) Close() error {
	close(q.messages)
	return nil
}
