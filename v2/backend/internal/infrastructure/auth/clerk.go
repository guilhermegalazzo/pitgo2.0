package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/pitgo/backend/internal/infrastructure/config"
	"github.com/pitgo/backend/internal/infrastructure/logger"
)

var (
	ErrInvalidToken = errors.New("invalid token")
	ErrTokenExpired = errors.New("token expired")
)

type Claims struct {
	jwt.RegisteredClaims
	UserID         string         `json:"sub"`
	Email          string         `json:"email,omitempty"`
	PublicMetadata PublicMetadata `json:"public_metadata,omitempty"`
}

type PublicMetadata struct {
	Role string `json:"role,omitempty"`
}

type JWKSKey struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	N   string `json:"n"`
	E   string `json:"e"`
	Use string `json:"use"`
	Alg string `json:"alg"`
}

type JWKSResponse struct {
	Keys []JWKSKey `json:"keys"`
}

type ClerkAuth struct {
	jwksURL string
	issuer  string
	keys    map[string]*rsa.PublicKey
	mu      sync.RWMutex
}

func NewClerkAuth(cfg config.AuthConfig) *ClerkAuth {
	ca := &ClerkAuth{
		jwksURL: cfg.JWKSURL,
		issuer:  cfg.Issuer,
		keys:    make(map[string]*rsa.PublicKey),
	}
	if cfg.JWKSURL != "" {
		if err := ca.refreshKeys(); err != nil {
			logger.Warn().Err(err).Msg("Failed to fetch JWKS keys on init")
		}
	}
	return ca
}

func (ca *ClerkAuth) refreshKeys() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, ca.jwksURL, nil)
	if err != nil {
		return fmt.Errorf("create JWKS request: %w", err)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("fetch JWKS: %w", err)
	}
	defer resp.Body.Close()
	var jwks JWKSResponse
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("decode JWKS: %w", err)
	}
	ca.mu.Lock()
	defer ca.mu.Unlock()
	for _, key := range jwks.Keys {
		if key.Kty != "RSA" || key.Use != "sig" {
			continue
		}
		pubKey, err := parseRSAPublicKey(key.N, key.E)
		if err != nil {
			continue
		}
		ca.keys[key.Kid] = pubKey
	}
	logger.Info().Int("key_count", len(ca.keys)).Msg("JWKS keys refreshed")
	return nil
}

func (ca *ClerkAuth) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("missing kid header")
		}
		ca.mu.RLock()
		key, exists := ca.keys[kid]
		ca.mu.RUnlock()
		if !exists {
			if err := ca.refreshKeys(); err != nil {
				return nil, err
			}
			ca.mu.RLock()
			key, exists = ca.keys[kid]
			ca.mu.RUnlock()
			if !exists {
				return nil, fmt.Errorf("unknown kid: %s", kid)
			}
		}
		return key, nil
	}, jwt.WithIssuer(ca.issuer), jwt.WithValidMethods([]string{"RS256"}))
	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrTokenExpired
		}
		return nil, fmt.Errorf("%w: %v", ErrInvalidToken, err)
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}

func parseRSAPublicKey(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, err
	}
	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, err
	}
	n := new(big.Int).SetBytes(nBytes)
	e := new(big.Int).SetBytes(eBytes)
	return &rsa.PublicKey{N: n, E: int(e.Int64())}, nil
}
