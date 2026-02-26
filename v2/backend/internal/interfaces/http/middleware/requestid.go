package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const ContextKeyRequestID = "request_id"

// RequestIDMiddleware injects a unique request ID into the context and response header.
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = uuid.New().String()
		}
		c.Set(ContextKeyRequestID, requestID)
		c.Header("X-Request-ID", requestID)
		c.Next()
	}
}
