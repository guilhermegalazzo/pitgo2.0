package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/infrastructure/logger"
)

// LoggerMiddleware logs each HTTP request with structured JSON fields.
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		event := logger.Info()
		if status >= 500 {
			event = logger.Error()
		} else if status >= 400 {
			event = logger.Warn()
		}

		event.
			Int("status", status).
			Str("method", c.Request.Method).
			Str("path", path).
			Str("query", query).
			Str("ip", c.ClientIP()).
			Str("user_agent", c.Request.UserAgent()).
			Dur("latency", latency).
			Str("request_id", c.GetString(ContextKeyRequestID)).
			Msg("HTTP request")
	}
}
