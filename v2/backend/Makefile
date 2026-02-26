.PHONY: dev build test lint run

# Run in development mode
dev:
	go run ./cmd/server

# Build binary
build:
	CGO_ENABLED=0 go build -ldflags="-w -s" -o bin/pitgo-server ./cmd/server

# Run tests
test:
	go test -v -race -cover ./...

# Lint
lint:
	golangci-lint run ./...

# Vet
vet:
	go vet ./...

# Tidy modules
tidy:
	go mod tidy

# Docker build
docker-build:
	docker build -t pitgo-backend:latest .

# Docker run
docker-run:
	docker run --rm -p 8080:8080 --env-file .env pitgo-backend:latest
