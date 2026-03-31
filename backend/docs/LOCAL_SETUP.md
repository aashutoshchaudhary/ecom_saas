# Local Development Setup

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | 24+ | https://docker.com/desktop |
| Node.js | 20+ | https://nodejs.org |
| pnpm | 9+ | `npm install -g pnpm` |

---

## Quick Start (Recommended — Docker)

The fastest way to run everything:

```bash
# 1. Go to the backend directory
cd D:/code1/AI/webneed/backend

# 2. Start infrastructure only (databases, redis, kafka, minio)
docker compose up -d postgres-identity postgres-core postgres-website \
  postgres-ai postgres-commerce postgres-orders postgres-platform \
  postgres-insights postgres-system redis zookeeper kafka minio

# 3. Wait ~30 seconds for services to be healthy
docker compose ps   # All should show "healthy"

# 4. Install dependencies
npm install   # or: pnpm install

# 5. Generate all Prisma clients
make db-generate

# 6. Run migrations for all databases
make db-migrate

# 7. Start individual services for development
# Option A: Start all services via Docker
docker compose up -d

# Option B: Run a single service locally (e.g. auth-service)
cd services/auth-service
npm run dev
```

---

## Step-by-Step (First Time)

### Step 1 — Start Infrastructure

```bash
cd D:/code1/AI/webneed/backend

# Start all infrastructure containers
docker compose up -d \
  postgres-identity \
  postgres-core \
  postgres-website \
  postgres-ai \
  postgres-commerce \
  postgres-orders \
  postgres-platform \
  postgres-insights \
  postgres-system \
  redis \
  zookeeper \
  kafka \
  minio

# Check all are running
docker compose ps
```

**Wait for healthy status (~30 sec):**
```
NAME                    STATUS
postgres-identity       healthy
postgres-core           healthy
postgres-website        healthy
...
redis                   running
kafka                   running
minio                   running
```

### Step 2 — Install Dependencies

```bash
cd D:/code1/AI/webneed/backend
npm install
```

### Step 3 — Run Database Migrations

```bash
# Generate Prisma clients (creates type-safe DB clients)
make db-generate

# Apply all migrations
make db-migrate

# Seed databases with initial data (industries, system themes, plugins, etc.)
make seed
```

Or manually per service:
```bash
cd services/auth-service
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 4 — Start Services

**Option A: Start everything with Docker (easiest)**
```bash
docker compose up -d
docker compose logs -f  # tail logs
```

**Option B: Start only what you need**
```bash
# Infrastructure + just auth + api-gateway for testing auth flow
docker compose up -d redis kafka postgres-identity api-gateway auth-service

# Then run frontend
cd D:/code1/AI/webneed
pnpm dev
```

**Option C: Run a service locally for debugging**
```bash
# Terminal 1 - Infrastructure
docker compose up -d redis kafka postgres-identity

# Terminal 2 - Auth service with hot reload
cd services/auth-service
cp .env.example .env
# Edit .env: DATABASE_URL should point to the Docker postgres
# DATABASE_URL=postgresql://siteforge:siteforge-dev@localhost:5433/auth_db
npm run dev

# Terminal 3 - API Gateway
cd services/api-gateway
npm run dev
```

---

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| API Gateway | http://localhost:3000 | All API traffic goes here |
| Auth Service | http://localhost:3001 | Direct access (dev only) |
| MinIO Console | http://localhost:9001 | S3 file browser (admin/siteforge-secret) |
| Prometheus | http://localhost:9090 | Metrics |
| Grafana | http://localhost:3100 | Dashboards (admin/admin) |
| Kafka UI | http://localhost:8080 | Browse Kafka topics |
| Frontend | http://localhost:5173 | React app |

---

## Test the API

### Health Check
```bash
curl http://localhost:3000/health
# {"status":"ok","service":"api-gateway"}
```

### Register a User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234!",
    "firstName": "John",
    "lastName": "Doe"
  }'
# Returns: { "success": true, "data": { "userId": "...", "accessToken": "...", "refreshToken": "..." } }
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com", "password": "Test@1234!" }'
# Returns: { "success": true, "data": { "accessToken": "...", "refreshToken": "..." } }
```

### Use Token for Authenticated Requests
```bash
TOKEN="your-access-token-here"

# Get current user profile
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Create a tenant
curl -X POST http://localhost:3000/api/v1/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "My Store", "slug": "my-store" }'
```

---

## Environment Variables per Service

Each service reads from its own `.env` file. The Docker Compose sets all required variables automatically. For local dev outside Docker, copy `.env.example`:

```bash
# For each service you run locally
cd services/<service-name>
cp .env.example .env
# Update DATABASE_URL to point to the Docker postgres host
```

**DATABASE_URL patterns (for services running outside Docker):**

| Service | DATABASE_URL |
|---------|-------------|
| auth-service | `postgresql://siteforge:siteforge-dev@localhost:5433/auth_db` |
| user-service | `postgresql://siteforge:siteforge-dev@localhost:5433/user_db` |
| role-service | `postgresql://siteforge:siteforge-dev@localhost:5433/role_db` |
| tenant-service | `postgresql://siteforge:siteforge-dev@localhost:5434/tenant_db` |
| industry-service | `postgresql://siteforge:siteforge-dev@localhost:5434/industry_db` |
| website-builder-service | `postgresql://siteforge:siteforge-dev@localhost:5435/website_db` |
| product-service | `postgresql://siteforge:siteforge-dev@localhost:5437/product_db` |
| order-service | `postgresql://siteforge:siteforge-dev@localhost:5438/order_db` |
| payment-service | `postgresql://siteforge:siteforge-dev@localhost:5438/payment_db` |

---

## Connect Frontend to Backend

The React frontend (`D:/code1/AI/webneed/`) currently uses mock data. To wire it to the real API:

1. Create `D:/code1/AI/webneed/.env.local`:
```env
VITE_API_URL=http://localhost:3000
```

2. Replace mock data calls in the frontend with real API calls pointing to `VITE_API_URL`.

---

## Useful Commands

```bash
# View logs for a specific service
docker compose logs -f auth-service

# Restart a single service
docker compose restart auth-service

# Open Prisma Studio (visual DB browser) for a service
cd services/auth-service
npx prisma studio   # opens http://localhost:5555

# Run migrations for a single service
cd services/order-service
npx prisma migrate dev

# Stop everything and remove volumes (clean slate)
docker compose down -v

# Check all services are up
curl -s http://localhost:3000/ready | python -m json.tool
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker compose up` fails on postgres | Run `chmod +x infrastructure/docker/postgres/init-multiple-dbs.sh` on Linux/Mac |
| Prisma migration fails | Check `DATABASE_URL` in .env matches the Docker postgres port |
| Kafka connection refused | Wait 30s after starting — Kafka takes time to be ready |
| Port already in use | `docker compose down` then `docker compose up -d` |
| `@siteforge/shared` not found | Run `npm install` from the `backend/` root first |

---

## Minimal Setup (Just Auth + API Gateway)

If you only want to test auth locally without starting all 28 services:

```bash
cd D:/code1/AI/webneed/backend

# Start only what auth needs
docker compose up -d postgres-identity redis kafka

# Wait for healthy, then run migrations
cd services/auth-service
DATABASE_URL=postgresql://siteforge:siteforge-dev@localhost:5433/auth_db npx prisma migrate dev --name init

# Start auth service
npm run dev &

# Start API gateway
cd ../api-gateway
npm run dev
```

Test at `http://localhost:3000/api/v1/auth/register`.
