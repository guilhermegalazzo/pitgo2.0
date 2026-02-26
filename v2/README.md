# Pitgo v2 — Production-Ready Marketplace

A Go + React Native + Next.js marketplace for on-demand automotive services.

## Architecture

```
v2/
├── backend/     → Go (Gin) — Clean Architecture
├── mobile/      → React Native (Expo) — TypeScript
├── admin/       → Next.js 14 — TypeScript
├── infra/       → Kubernetes manifests
├── docker-compose.yml
└── Makefile
```

### Backend Clean Architecture Layers

```
Domain → UseCases → Repositories → Infrastructure → Interfaces (HTTP)
```

**Domains:** Identity, Profiles, Catalog, Requests, Dispatch

---

## Prerequisites

| Tool        | Version  |
|-------------|----------|
| Go          | ≥ 1.22   |
| Node.js     | ≥ 18     |
| Docker      | ≥ 24     |
| Expo CLI    | ≥ 0.14   |

---

## Quick Start

### 1. Start Infrastructure

```bash
# Start PostgreSQL + Redis containers
make docker-up
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your Clerk JWKS URL and issuer
```

### 3. Run the Backend

```bash
cd backend
go mod tidy       # Download dependencies
make dev           # Runs on :8080
```

### 4. Run the Mobile App

```bash
cd mobile
npm install
npx expo start    # Scan QR with Expo Go
```

### 5. Run the Admin Panel

```bash
cd admin
npm install
npm run dev        # Runs on :3000
```

---

## API Endpoints

| Method | Path                              | Auth  | Role              |
|--------|-----------------------------------|-------|-------------------|
| GET    | `/health`                         | No    | —                 |
| GET    | `/api/v1/catalog/categories`      | No    | —                 |
| GET    | `/api/v1/catalog/services`        | No    | —                 |
| GET    | `/api/v1/catalog/services/:id`    | No    | —                 |
| POST   | `/api/v1/users`                   | Yes   | Any               |
| GET    | `/api/v1/users/me`                | Yes   | Any               |
| POST   | `/api/v1/profiles`                | Yes   | Any               |
| GET    | `/api/v1/profiles/me`             | Yes   | Any               |
| PUT    | `/api/v1/profiles/me`             | Yes   | Any               |
| POST   | `/api/v1/requests`                | Yes   | Customer/Admin    |
| GET    | `/api/v1/requests`                | Yes   | Customer/Admin    |
| POST   | `/api/v1/requests/:id/accept`     | Yes   | Provider/Admin    |
| POST   | `/api/v1/requests/:id/start`      | Yes   | Provider/Admin    |
| POST   | `/api/v1/requests/:id/complete`   | Yes   | Provider/Admin    |
| POST   | `/api/v1/requests/:id/cancel`     | Yes   | Customer/Admin    |
| POST   | `/api/v1/admin/dispatch/match`    | Yes   | Admin             |

---

## Docker Full Stack

```bash
# Build and run everything
docker compose up --build

# Just infrastructure
docker compose up -d postgres redis
```

---

## Kubernetes Deployment

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl create secret generic pitgo-backend-secrets \
  --namespace=pitgo \
  --from-literal=DB_USER=pitgo \
  --from-literal=DB_PASSWORD=your_password \
  --from-literal=CLERK_JWKS_URL=your_jwks_url \
  --from-literal=CLERK_ISSUER=your_issuer
kubectl apply -f infra/k8s/backend-deployment.yaml
kubectl apply -f infra/k8s/backend-service.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

---

## Middleware Stack

- **RequestID** — Unique request tracing
- **Logger** — Structured JSON logs (zerolog)
- **Rate Limit** — Per-IP + per-user token bucket
- **Auth** — Clerk JWT (JWKS validation)
- **Role** — `customer`, `provider`, `admin`
- **Error Handler** — Panic recovery + global error formatting

