package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequireRole restricts access to users with one of the allowed roles.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get(ContextKeyRole)
		if !exists || role == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "insufficient permissions: role not found",
			})
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "forbidden",
				"message": "invalid role format",
			})
			return
		}

		for _, allowed := range allowedRoles {
			if roleStr == allowed {
				c.Next()
				return
			}
		}

		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
			"error":   "forbidden",
			"message": "insufficient permissions: required role not met",
		})
	}
}

func RequireCustomer() gin.HandlerFunc { return RequireRole("customer") }
func RequireProvider() gin.HandlerFunc { return RequireRole("provider") }
func RequireAdmin() gin.HandlerFunc    { return RequireRole("admin") }
