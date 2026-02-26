# Pitgo Marketplace - Production Ready

Pitgo is a premium marketplace for automotive services, built with a modern and scalable architecture.

## Tech Stack
- **Backend:** Go (Gin) with Clean Architecture.
- **Frontend Admin:** Next.js with TypeScript.
- **Mobile:** React Native (Expo) with Expo Router.
- **Database:** PostgreSQL.
- **Cache:** Redis.
- **Auth:** Clerk (JWT validated).
- **Queue:** Flexible abstraction (In-memory/Local).

## Project Structure
- `/v2/backend`: Go backend following Clean Architecture.
- `/web`: Next.js Admin dashboard.
- `/mobile`: React Native Expo mobile app.
- `/k8s`: Kubernetes manifests for production deployment.
- `docker-compose.yml`: Local full-stack environment.

## Running Locally

### 1. Prerequisites
- Docker & Docker Compose
- Go 1.22+
- Node.js 18+

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Setup Environment
Add the following to your `.env` (Backend, Web, and Mobile):
- `CLERK_PUBLISHABLE_KEY` / `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWKS_URL`
- `CLERK_ISSUER`

## Architecture Highlights
- **Clean Architecture:** Domain/UseCase/Repository/Infrastructure isolation.
- **JSON Structured Logging:** Production-ready logs using `zerolog`.
- **Global Error Handling:** Recovery middleware for all API requests.
- **Rate Limiting:** IP and User-based limiting.
- **Healthchecks:** Native endpoints for orchestration.
