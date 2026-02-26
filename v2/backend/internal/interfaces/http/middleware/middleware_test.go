package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestRequireRole(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		userRole       string
		requiredRoles  []string
		expectedStatus int
	}{
		{
			name:           "Valid role - customer",
			userRole:       "customer",
			requiredRoles:  []string{"customer"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Valid role - admin",
			userRole:       "admin",
			requiredRoles:  []string{"admin"},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid role - missing",
			userRole:       "",
			requiredRoles:  []string{"customer"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Invalid role - mismatch",
			userRole:       "customer",
			requiredRoles:  []string{"provider"},
			expectedStatus: http.StatusForbidden,
		},
		{
			name:           "Multiple roles - valid",
			userRole:       "admin",
			requiredRoles:  []string{"customer", "admin"},
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := gin.New()
			r.Use(func(c *gin.Context) {
				if tt.userRole != "" {
					c.Set(ContextKeyRole, tt.userRole)
				}
				c.Next()
			})
			r.Use(RequireRole(tt.requiredRoles...))
			r.GET("/test", func(c *gin.Context) {
				c.Status(http.StatusOK)
			})

			w := httptest.NewRecorder()
			req, _ := http.NewRequest(http.MethodGet, "/test", nil)
			r.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}

func TestRequireAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set(ContextKeyRole, "admin")
		c.Next()
	})
	r.Use(RequireAdmin())
	r.GET("/admin", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest(http.MethodGet, "/admin", nil)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
}
