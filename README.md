# BOCRA Platform

**Botswana Communications Regulatory Authority** — Full-stack government regulatory portal for telecommunications, broadcasting, postal, and internet services in Botswana.

---

## Architecture

```
bocra-platform/
├── bocra-api/          # Rust (Axum) backend
├── bocra-web/          # React 18 + TypeScript frontend
└── docker-compose.yml  # Full‑stack orchestration
```

```
┌─────────────────────────────────────────────────────┐
│  React 18 + TypeScript (Vite)   :5173               │
│  React Router v6 · React Query  · Framer Motion     │
│  Tailwind CSS · Recharts · React Hook Form + Zod    │
└──────────────────────┬──────────────────────────────┘
                       │ Axios (JWT Bearer)
┌──────────────────────▼──────────────────────────────┐
│  Rust / Axum API   :8080   /api/v1                  │
│  SQLx · Argon2id · jsonwebtoken · Tower middleware  │
└─────────────┬────────────────────┬──────────────────┘
              │                    │
   ┌──────────▼──────┐  ┌─────────▼──────────┐
   │  PostgreSQL 15  │  │     Redis 7         │
   │  :5432          │  │  :6379 (sessions,   │
   └─────────────────┘  │   rate limiting)    │
                        └────────────────────┘
```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Rust | 1.75+ |
| Node.js | 20+ |
| Docker & Docker Compose | Latest stable |
| PostgreSQL | 15 (via Docker) |
| Redis | 7 (via Docker) |
| sqlx-cli | `cargo install sqlx-cli` |

---

## Setup

### Option A — Docker Compose (recommended)

```bash
git clone https://github.com/your-org/bocra-platform
cd bocra-platform

# Copy and configure environment
cp bocra-api/.env.example bocra-api/.env

# Start everything
docker-compose up --build
```

- Frontend: http://localhost:5173  
- API: http://localhost:8080  
- API Docs (Swagger): http://localhost:8080/api/docs

---

### Option B — Local development

```bash
git clone https://github.com/your-org/bocra-platform
cd bocra-platform

# 1. Start infrastructure
cp bocra-api/.env.example bocra-api/.env
docker-compose up -d postgres redis

# 2. Run database migrations
cd bocra-api
sqlx migrate run

# 3. Seed the database
cargo run --bin seed

# 4. Start the API server
cargo run --release
# API available at http://localhost:8080

# 5. In a separate terminal — start the frontend
cd ../bocra-web
npm install
npm run dev
# Frontend available at http://localhost:5173
```

---

## Environment Variables (`bocra-api/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://bocra:bocradev@localhost:5432/bocra` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Min 256-bit JWT signing secret | `change-this-in-production-minimum-32-chars` |
| `JWT_ACCESS_EXPIRY_MINUTES` | Access token TTL | `15` |
| `JWT_REFRESH_EXPIRY_DAYS` | Refresh token TTL | `7` |
| `FRONTEND_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `PORT` | API port | `8080` |
| `RUST_LOG` | Log level filter | `bocra_api=debug,tower_http=debug` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE_MB` | Max upload size | `5` |

---

## Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | admin@bocra.org.bw | `Admin123!` |
| **Staff** | staff@bocra.org.bw | `Staff123!` |

---

## API Endpoints

Base path: `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new account |
| POST | `/auth/login` | Public | Login (sets httpOnly cookie) |
| POST | `/auth/logout` | Public | Clear session |
| POST | `/auth/refresh` | Cookie | Issue new access token |
| GET | `/auth/me` | Bearer | Current user |
| POST | `/complaints` | Optional | Submit complaint |
| GET | `/complaints` | Admin/Staff | List all complaints |
| PATCH | `/complaints/:id/status` | Admin/Staff | Update status |
| GET | `/licenses/types` | Public | List license types |
| POST | `/licenses/applications` | Auth | Submit application |
| GET | `/licenses/licensees` | Public | Public licensee directory |
| GET | `/consultations` | Public | List consultations |
| POST | `/consultations/:id/submit` | Public | Submit consultation response |
| GET | `/publications` | Public | List publications |
| GET | `/news` | Public | List news articles |
| GET | `/alerts/active` | Public | Active system alerts |
| GET | `/search` | Public | Full-text search |
| GET | `/admin/stats/overview` | Admin/Staff | Dashboard KPIs |
| POST | `/analytics/event` | Public | Track page event |

Full interactive docs: **http://localhost:8080/api/docs**

---

## Frontend Pages

| Path | Access | Description |
|---|---|---|
| `/` | Public | Homepage with orbit diagram, stats, sectors |
| `/about` | Public | About BOCRA, mandate, leadership |
| `/licensing` | Public | License types and application wizard |
| `/consumer/complaint` | Public | 5-step complaint wizard |
| `/consumer/track` | Public | Track complaint by ticket number |
| `/consultations` | Public | Public consultations with countdowns |
| `/news` | Public | News and press releases |
| `/publications` | Public | Downloads and reports |
| `/portal` | Auth | User dashboard |
| `/admin` | Admin/Staff | Admin dashboard with analytics |

---

## Security

- **Passwords**: Argon2id — m=65536, t=3, p=4
- **JWT**: RS256-signed; access tokens 15 min, refresh 7 days (httpOnly cookie)
- **Rate limiting**: Redis token-bucket — 100 req/15min global, 5 req/15min on auth endpoints
- **SQL**: 100% parameterised queries via SQLx (no string interpolation)
- **CORS**: Restricted to `FRONTEND_ORIGIN` env var
- **File uploads**: MIME validation, UUID rename, max 5MB
- **IP privacy**: SHA-256 hashed — raw IPs never stored
- **Headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, CSP default-src 'self'

---

## Contributing

Pull requests are welcome. Please ensure all Rust code passes `cargo clippy --deny warnings` and frontend code passes `npm run lint` before submitting.

---

*Built for the Botswana Communications Regulatory Authority (BOCRA)*
