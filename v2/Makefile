.PHONY: dev docker-up docker-down backend-dev mobile-dev admin-dev

# Start all infrastructure (Postgres + Redis)
docker-up:
	docker compose up -d postgres redis

# Stop all infrastructure
docker-down:
	docker compose down

# Run backend in development
backend-dev:
	cd backend && go run ./cmd/server

# Run mobile in development
mobile-dev:
	cd mobile && npx expo start

# Run admin in development
admin-dev:
	cd admin && npm run dev

# Install all frontend dependencies
install:
	cd mobile && npm install
	cd admin && npm install

# Run backend tests
test:
	cd backend && go test -v -race -cover ./...

# Build Docker images
docker-build:
	docker compose build

# Start everything
dev: docker-up
	@echo "Infrastructure started. Run backend, mobile, and admin in separate terminals:"
	@echo "  make backend-dev"
	@echo "  make mobile-dev"
	@echo "  make admin-dev"
