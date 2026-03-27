# BOCRA Platform

**Botswana Communications Regulatory Authority** — Full-stack government regulatory portal for telecommunications, broadcasting, postal, and internet services in Botswana.

---

## Architecture
```
bocra-platform/
├── bocra-api/          # Rust (Axum) backend
├── bocra-web/          # React 18 + TypeScript frontend
└── docker-compose.yml  # Full-stack orchestration
```
```

```

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Rust | 1.80+ |
| Node.js | 20+ |
| Docker & Docker Compose | Latest stable |
| PostgreSQL | 15 (via Docker) |
| Redis | 7 (via Docker) |
| sqlx-cli | `cargo install sqlx-cli --no-default-features --features postgres` |

---

## Setup

### Option A — Docker Compose (recommended)
```bash
git clone https://github.com/OhItsHim/BOCRA-Web-Development-Hackathon
cd BOCRA-Web-Development-Hackathon

cp bocra-api/.env.example bocra-api/.env

docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:8080 |
| API Docs (Swagger) | http://localhost:8080/api/docs |

---

### Option B — Local development
```bash
git clone https://github.com/your-org/bocra-platform
cd bocra-platform

# 1. Copy environment config
cp bocra-api/.env.example bocra-api/.env

# 2. Start infrastructure only
docker-compose up -d postgres redis

# 3. Run database migrations
cd bocra-api
sqlx migrate run

# 4. Seed the database
cargo run --bin seed

# 5. Start the API server
cargo run --release
# → http://localhost:8080

# 6. In a separate terminal — start the frontend
cd ../bocra-web
npm install
npm run dev
# → http://localhost:5173
```

---

## Environment Variables (`bocra-api/.env`)

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://bocra:bocradev@localhost:5432/bocra` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Min 256-bit signing secret | `change-this-in-production-minimum-32-chars` |
| `JWT_ACCESS_EXPIRY_MINUTES` | Access token TTL | `15` |
| `JWT_REFRESH_EXPIRY_DAYS` | Refresh token TTL | `7` |
| `FRONTEND_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `PORT` | API port | `8080` |
| `RUST_LOG` | Log level filter | `bocra_api=debug,tower_http=debug` |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE_MB` | Max upload size | `5` |

---

## Test Accounts

> These credentials only work after running `cargo run --bin seed`.

| Role | Email | Password | Redirects to |
|---|---|---|---|
| Admin | `admin@bocra.org.bw` | `Admin123!` | `/admin` |
| Staff | `staff@bocra.org.bw` | `Staff123!` | `/admin` |
| Public / Licensee | _(register an account)_ | — | `/portal` |

---

## API Endpoints

Base path: `/api/v1`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new account |
| `POST` | `/auth/login` | Public | Login — sets httpOnly refresh cookie |
| `POST` | `/auth/logout` | Public | Clear session |
| `POST` | `/auth/refresh` | Cookie | Issue new access token |
| `GET` | `/auth/me` | Bearer | Current user profile |
| `POST` | `/auth/forgot-password` | Public | Send password reset email |
| `POST` | `/complaints` | Optional | Submit complaint (anonymous allowed) |
| `GET` | `/complaints` | Admin/Staff | List all complaints with filters |
| `GET` | `/complaints/track` | Public | Track complaint by ticket + email |
| `PATCH` | `/complaints/:id/status` | Admin/Staff | Update complaint status |
| `PATCH` | `/complaints/:id/assign` | Admin/Staff | Assign to staff member |
| `GET` | `/licenses/types` | Public | List all licence type definitions |
| `POST` | `/licenses/applications` | Bearer | Submit licence application |
| `GET` | `/licenses/applications` | Admin/Staff | List all applications |
| `PATCH` | `/licenses/applications/:id/status` | Admin | Approve or reject |
| `GET` | `/licenses/track` | Public | Track application by ref + email |
| `GET` | `/licenses/licensees` | Public | Public licensee directory |
| `GET` | `/consultations` | Public | List consultations |
| `POST` | `/consultations/:id/submit` | Public | Submit consultation response |
| `POST` | `/consultations` | Admin | Create consultation |
| `GET` | `/publications` | Public | List publications (filterable) |
| `POST` | `/publications` | Admin | Upload publication (multipart) |
| `GET` | `/news` | Public | List news articles (paginated) |
| `GET` | `/news/:slug` | Public | Single article |
| `POST` | `/news` | Admin | Create news article |
| `GET` | `/alerts/active` | Public | Active system alerts |
| `GET` | `/search` | Public | Full-text search across all content |
| `GET` | `/admin/stats/overview` | Admin/Staff | Dashboard KPI data |
| `GET` | `/admin/stats/complaints` | Admin/Staff | Complaint trend data |
| `GET` | `/admin/stats/applications` | Admin/Staff | Application trend data |
| `POST` | `/analytics/event` | Public | Track page event (rate limited) |

Full interactive docs: **http://localhost:8080/api/docs**

---

## Frontend Pages

| Path | Access | Description |
|---|---|---|
| `/` | Public | Homepage — orbit diagram, live stats, sector cards, news feed |
| `/about` | Public | Mandate, org structure, leadership, legislation |
| `/contact` | Public | Contact form, department table, office hours |
| `/search` | Public | Full-text search across news, publications, consultations, licensees |
| `/licensing` | Public | Licence type grid filterable by sector |
| `/licensing/apply` | Public | 6-step licence application wizard |
| `/licensing/track` | Public | Track application by reference number |
| `/licensing/licensees` | Public | Active licensee public directory |
| `/consumer/complaint` | Public | 5-step complaint filing wizard |
| `/consumer/track` | Public | Track complaint by ticket number |
| `/consumer/tariffs` | Public | Interactive tariff calculator by provider |
| `/consumer/alerts` | Public | Active consumer advisories |
| `/consultations` | Public | Open and closed consultations with countdown timers |
| `/consultations/:id` | Public | Consultation detail with submission form |
| `/news` | Public | News and press releases — magazine grid |
| `/publications` | Public | Filterable downloads and reports |
| `/login` | Public | Sign in — role-based redirect on success |
| `/register` | Public | Create account |
| `/forgot-password` | Public | Password reset request |
| `/portal` | Auth | User dashboard — applications, complaints, profile |
| `/admin` | Admin/Staff | Admin dashboard — KPIs, charts, recent activity |
| `/admin/applications` | Admin/Staff | Licence application manager |
| `/admin/complaints` | Admin/Staff | Complaint manager — assign, resolve, escalate |
| `/admin/consultations` | Admin/Staff | Create consultations, export submissions |
| `/admin/publications` | Admin/Staff | Upload and manage regulatory documents |
| `/admin/news` | Admin/Staff | Create and publish news articles |
| `/admin/licensees` | Admin/Staff | Licensee directory management |
| `/admin/users` | Admin | User accounts — roles, status, verification |
| `/admin/faq` | Admin/Staff | FAQ — create, reorder, publish |
| `/admin/alerts` | Admin/Staff | Site-wide alerts with expiry dates |
| `/admin/analytics` | Admin/Staff | Page views, trends, resolution time |

---

## Security

| Control | Implementation |
|---|---|
| Passwords | Argon2id — m=65536, t=3, p=4 |
| JWT | Access tokens 15 min · Refresh tokens 7 days (httpOnly cookie) |
| Rate limiting | Redis token-bucket — 100 req/15 min global, 5 req/15 min on auth |
| SQL injection | 100% parameterised queries via SQLx — no string interpolation |
| CORS | Restricted to `FRONTEND_ORIGIN` env var — no wildcard with credentials |
| File uploads | MIME validation · UUID rename · 5 MB max enforced server-side |
| IP privacy | SHA-256 hashed — raw IPs never stored |
| Security headers | `X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` · `CSP: default-src 'self'` |
| Role enforcement | Axum middleware validates JWT claims on every protected route |

---

## Known Issues and Pending Work

### Confirmed fixed
- CORS crash resolved — wildcard headers with credentials removed; API runs on `:8080`
- Missing pages created: `Contact.tsx`, `Search.tsx`, `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`
- `/login` route added to `App.tsx`
- `AppLoader` splash screen implemented (animated dots + progress bar)
- Dark / light mode fully wired via `ThemeContext` and CSS custom properties on `<html>`

### Open items
- Admin user management: add, edit, role updates, verification toggle, delete
- Normalise all admin API response handling — use safe array pattern:
```ts
  const raw = data?.specificKey || data?.items || data?.data || data
  const items = Array.isArray(raw) ? raw : []
```
- Add error boundaries and fallback UI on all admin pages
- BOCRA branding consistency audit across all pages
- WCAG 2.1 AA colour-contrast verification for sector colours in light mode

---

## Branding

| Element | Specification |
|---|---|
| Heading font | Barlow Condensed — Bold / Black |
| UI / data font | DM Mono — Regular and Medium |
| Body font | `system-ui, -apple-system, sans-serif` |
| Telecoms | `#1565C0` (blue) |
| Broadcasting | `#F9A825` (yellow / gold) |
| Internet | `#2E7D32` (green) |
| Postal | `#B71C1C` (red) |
| Accent | `#4FC3F7` (light blue) |
| Background motif | Connectivity web — thin SVG node-and-line pattern at low opacity |
| Logo | BOCRA wordmark in Barlow Condensed + four coloured dots |

---

## Contributing

Pull requests are welcome. Ensure all code passes the checks below before submitting.
```bash
# Rust
cargo clippy --deny warnings

# Frontend
npm run lint
```

---

*Built for the Botswana Communications Regulatory Authority (BOCRA)*
