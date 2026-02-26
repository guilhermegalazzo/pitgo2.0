package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/infrastructure/auth"
	"github.com/pitgo/backend/internal/infrastructure/cache"
	"github.com/pitgo/backend/internal/infrastructure/config"
	"github.com/pitgo/backend/internal/infrastructure/database"
	"github.com/pitgo/backend/internal/infrastructure/logger"
	"github.com/pitgo/backend/internal/infrastructure/push"
	"github.com/pitgo/backend/internal/infrastructure/queue"
	"github.com/pitgo/backend/internal/interfaces/http/handler"
	"github.com/pitgo/backend/internal/interfaces/http/middleware"
	"github.com/pitgo/backend/internal/interfaces/http/router"
	"github.com/pitgo/backend/internal/repository/postgres"
	catalogUC "github.com/pitgo/backend/internal/usecase/catalog"
	dispatchUC "github.com/pitgo/backend/internal/usecase/dispatch"
	identityUC "github.com/pitgo/backend/internal/usecase/identity"
	profileUC "github.com/pitgo/backend/internal/usecase/profile"
	requestUC "github.com/pitgo/backend/internal/usecase/request"
	dispatchWorker "github.com/pitgo/backend/internal/worker/dispatch"
)

func main() {
	// Load config
	cfg, err := config.Load()
	if err != nil {
		panic(fmt.Sprintf("failed to load config: %v", err))
	}

	// Init logger
	logger.Init(cfg.App.Env)
	logger.Info().Str("env", cfg.App.Env).Msg("Starting Pitgo backend")

	// Set Gin mode
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Run migrations
	if err := database.RunMigrations(cfg.Database.DSN()); err != nil {
		logger.Fatal().Err(err).Msg("Failed to run migrations")
		return
	}
	// Database
	dbPool, err := database.NewPostgresPool(cfg.Database)
	if err != nil {
		logger.Fatal().Err(err).Msg("Failed to connect to PostgreSQL")
		return
	}
	defer dbPool.Close()

	// Redis
	redisClient, err := cache.NewRedisClient(cfg.Redis)
	if err != nil {
		logger.Warn().Err(err).Msg("Failed to connect to Redis; cache disabled")
	} else if redisClient != nil {
		defer redisClient.Close()
	}

	// Queue (swap InMemoryQueue for Kafka adapter in production)
	q := queue.NewInMemoryQueue()
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Auth
	clerkAuth := auth.NewClerkAuth(cfg.Auth)

	// --- Repositories ---
	catalogRepo := postgres.NewCatalogRepository(dbPool)
	identityRepo := postgres.NewIdentityRepository(dbPool)
	profileRepo := postgres.NewProfileRepository(dbPool)
	requestRepo := postgres.NewRequestRepository(dbPool)
	dispatchRepo := postgres.NewDispatchRepository(dbPool)

	// --- Use Cases ---
	catUC := catalogUC.New(catalogRepo)
	idUC := identityUC.New(identityRepo)
	profUC := profileUC.New(profileRepo)
	reqUC := requestUC.New(requestRepo, q)
	dispUC := dispatchUC.New(dispatchRepo, profileRepo)

	// --- Workers ---
	notifier := push.NewLogNotifier()
	dw := dispatchWorker.NewWorker(q, q, profileRepo, dispatchRepo, notifier)
	if err := dw.Register(); err != nil {
		logger.Fatal().Err(err).Msg("Failed to register dispatch worker")
		return
	}
	logger.Info().Msg("Dispatch worker registered")

	// Start queue AFTER all subscriptions are registered
	if err := q.Start(ctx); err != nil {
		logger.Fatal().Err(err).Msg("Failed to start queue")
		return
	}

	// Handlers
	handlers := router.Handlers{
		Health:   handler.NewHealthHandler(),
		Identity: handler.NewIdentityHandler(idUC),
		Profile:  handler.NewProfileHandler(profUC),
		Catalog:  handler.NewCatalogHandler(catUC),
		Request:  handler.NewRequestHandler(reqUC),
		Dispatch: handler.NewDispatchHandler(dispUC),
	}

	// Router
	r := gin.New()
	rlCfg := middleware.RateLimiterConfig{
		RPS:   cfg.Rate.RPS,
		Burst: cfg.Rate.Burst,
	}
	router.Setup(r, clerkAuth, rlCfg, handlers)

	// HTTP Server with graceful shutdown
	srv := &http.Server{
		Addr:         ":" + cfg.App.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info().Str("port", cfg.App.Port).Msg("HTTP server started")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal().Err(err).Msg("Server failed")
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info().Msg("Shutting down server...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	logger.Info().Msg("Server exited gracefully")
}
