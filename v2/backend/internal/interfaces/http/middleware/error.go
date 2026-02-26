package middleware

import (
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
	"github.com/pitgo/backend/internal/infrastructure/logger"
)

// ErrorHandler is a global error recovery middleware.
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Error().
					Interface("error", err).
					Str("stack", string(debug.Stack())).
					Str("path", c.Request.URL.Path).
					Str("method", c.Request.Method).
					Msg("Panic recovered")

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "internal_server_error",
					"message": "an unexpected error occurred",
				})
			}
		}()

		c.Next()

		// Handle errors set during request processing
		if len(c.Errors) > 0 {
			lastErr := c.Errors.Last()
			logger.Error().
				Err(lastErr.Err).
				Str("path", c.Request.URL.Path).
				Str("method", c.Request.Method).
				Msg("Request error")

			if c.Writer.Status() == http.StatusOK {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "internal_server_error",
					"message": lastErr.Error(),
				})
			}
		}
	}
}
