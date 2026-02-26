package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

type RateLimiterConfig struct {
	RPS   float64
	Burst int
}

type ipLimiter struct {
	mu       sync.RWMutex
	limiters map[string]*rate.Limiter
	rps      rate.Limit
	burst    int
}

func newIPLimiter(rps float64, burst int) *ipLimiter {
	return &ipLimiter{
		limiters: make(map[string]*rate.Limiter),
		rps:      rate.Limit(rps),
		burst:    burst,
	}
}

func (l *ipLimiter) getLimiter(key string) *rate.Limiter {
	l.mu.RLock()
	limiter, exists := l.limiters[key]
	l.mu.RUnlock()
	if exists {
		return limiter
	}

	l.mu.Lock()
	defer l.mu.Unlock()

	// Double-check after acquiring write lock
	if limiter, exists = l.limiters[key]; exists {
		return limiter
	}

	limiter = rate.NewLimiter(l.rps, l.burst)
	l.limiters[key] = limiter
	return limiter
}

// RateLimitMiddleware limits requests per IP and per authenticated user.
func RateLimitMiddleware(cfg RateLimiterConfig) gin.HandlerFunc {
	ipLim := newIPLimiter(cfg.RPS, cfg.Burst)
	userLim := newIPLimiter(cfg.RPS*2, cfg.Burst*2) // Higher limit for authenticated users

	return func(c *gin.Context) {
		// Check by IP
		ip := c.ClientIP()
		if !ipLim.getLimiter(ip).Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "rate_limited",
				"message": "too many requests from this IP",
			})
			return
		}

		// Check by user if authenticated
		if userID, exists := c.Get(ContextKeyUserID); exists {
			if uid, ok := userID.(string); ok && uid != "" {
				if !userLim.getLimiter(uid).Allow() {
					c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
						"error":   "rate_limited",
						"message": "too many requests from this user",
					})
					return
				}
			}
		}

		c.Next()
	}
}
