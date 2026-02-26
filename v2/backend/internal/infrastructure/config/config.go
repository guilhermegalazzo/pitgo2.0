package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	Auth     AuthConfig
	Queue    QueueConfig
	Rate     RateConfig
}

type AppConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	URL      string // Single DATABASE_URL for Render/production
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

type AuthConfig struct {
	JWKSURL string
	Issuer  string
}

type QueueConfig struct {
	Driver string
}

type RateConfig struct {
	RPS   float64
	Burst int
}

func (d DatabaseConfig) DSN() string {
	// Use DATABASE_URL if available (Render, Railway, etc.)
	if d.URL != "" {
		return d.URL
	}
	return "postgres://" + d.User + ":" + d.Password + "@" + d.Host + ":" + d.Port + "/" + d.Name + "?sslmode=" + d.SSLMode
}

func Load() (*Config, error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	// Set defaults
	viper.SetDefault("APP_PORT", "8080")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "pitgo")
	viper.SetDefault("DB_PASSWORD", "pitgo_secret")
	viper.SetDefault("DB_NAME", "pitgo")
	viper.SetDefault("DB_SSL_MODE", "disable")
	viper.SetDefault("REDIS_ADDR", "localhost:6379")
	viper.SetDefault("REDIS_PASSWORD", "")
	viper.SetDefault("REDIS_DB", 0)
	viper.SetDefault("QUEUE_DRIVER", "memory")
	viper.SetDefault("RATE_LIMIT_RPS", 10)
	viper.SetDefault("RATE_LIMIT_BURST", 20)

	_ = viper.ReadInConfig() // Ignore error if .env doesn't exist

	cfg := &Config{
		App: AppConfig{
			Port: viper.GetString("APP_PORT"),
			Env:  viper.GetString("APP_ENV"),
		},
		Database: DatabaseConfig{
			URL:      viper.GetString("DATABASE_URL"),
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			Name:     viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSL_MODE"),
		},
		Redis: RedisConfig{
			Addr:     viper.GetString("REDIS_ADDR"),
			Password: viper.GetString("REDIS_PASSWORD"),
			DB:       viper.GetInt("REDIS_DB"),
		},
		Auth: AuthConfig{
			JWKSURL: viper.GetString("CLERK_JWKS_URL"),
			Issuer:  viper.GetString("CLERK_ISSUER"),
		},
		Queue: QueueConfig{
			Driver: viper.GetString("QUEUE_DRIVER"),
		},
		Rate: RateConfig{
			RPS:   viper.GetFloat64("RATE_LIMIT_RPS"),
			Burst: viper.GetInt("RATE_LIMIT_BURST"),
		},
	}

	return cfg, nil
}
