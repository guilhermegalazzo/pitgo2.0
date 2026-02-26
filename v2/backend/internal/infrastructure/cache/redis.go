package cache

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/pitgo/backend/internal/infrastructure/config"
	"github.com/pitgo/backend/internal/infrastructure/logger"
)

type RedisClient struct {
	Client *redis.Client
}

func NewRedisClient(cfg config.RedisConfig) (*RedisClient, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     cfg.Addr,
		Password: cfg.Password,
		DB:       cfg.DB,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	logger.Info().Msg("Connected to Redis")
	return &RedisClient{Client: client}, nil
}

func (r *RedisClient) Set(ctx context.Context, key string, value interface{}, exp time.Duration) error {
	return r.Client.Set(ctx, key, value, exp).Err()
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.Client.Get(ctx, key).Result()
}

func (r *RedisClient) Delete(ctx context.Context, key string) error {
	return r.Client.Del(ctx, key).Err()
}

func (r *RedisClient) Close() error { return r.Client.Close() }
