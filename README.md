# EmpathyLink — Master Platform Repository

> **Tagline:** “We are there for you. Always for you.”

EmpathyLink is an anonymous, privacy-first emotional support and kindred social connection platform. Travelers connect through themed DreamVerse identities, explainable peer matching (HeartLink), community circles, private journaling, and an optional AI reflection companion named Sol.

---

## 1. Architectural Philosophy & Safety Boundaries

- **Non-Clinical Guarantee:** Sol is an AI reflection assistant, **NOT** a therapist, doctor, or emergency response service. EmpathyLink never diagnoses psychiatric conditions.
- **Privacy-First Design:** Free of follower counts, popularity rankings, or engagement addiction loops.
- **User Autonomy:** Users explicitly decide whether to communicate with humans or AI.
- **Transparent Cryptography:** We do not invent proprietary cryptography. Client-side E2EE is explicitly labeled as **PENDING THIRD-PARTY AUDIT** until formal verification is complete.
- **Explicit AI Boundary:** Private Dream Journal entries are **never** silently routed to external AI. Processing is strictly user-triggered through the **“Reflect with Sol”** button.

---

## 2. Technology Stack

- **Web Frontend:** Next.js (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, TanStack Query, Socket.IO Client.
- **Backend API:** Node.js, Express, TypeScript, Socket.IO, Jose (JWT), Argon2id, Zod, Helmet, Pino, CORS, Express-Rate-Limit.
- **Persistence & Caching:** PostgreSQL 16 (Prisma ORM with 34 comprehensive models), Redis 7.
- **Media & Storage:** S3-compatible object storage abstraction (MinIO locally / AWS S3 in production).
- **Mobile Client Architecture:** Prepared native Flutter 3 / Dart client with Riverpod, GoRouter, Dio, and Secure Storage.
- **Testing:** Vitest, Supertest.

---

## 3. Repository Structure

```
empathylink/
├── apps/
│   ├── web/               # Next.js responsive web application
│   └── mobile/            # Native Flutter mobile client architecture
├── services/
│   ├── api/               # Express REST API & Socket.IO server gateway
│   ├── ai/                # Sol AI reflection service & safety guardrails
│   ├── matching/          # Deterministic explainable HeartLink engine
│   ├── chat/              # Real-time WebSocket coordinator & presence
│   ├── moderation/        # Multi-stage safety pipeline & crisis detection
│   └── notifications/     # Multi-channel notification dispatcher
├── packages/
│   ├── types/             # Shared TypeScript models & event schemas
│   ├── validation/        # Zod validation schemas across all endpoints
│   ├── ui/                # UI design tokens & theme constants
│   └── config/            # DreamVerse catalog (8 universes) & crisis hotlines
├── prisma/
│   ├── schema.prisma      # 34 production-ready relational models
│   └── seed.ts            # Seeding 8 universes, echo rooms, and demo personas
├── infrastructure/
│   ├── docker/            # Production Dockerfiles for Web and API
│   ├── nginx/             # Reverse proxy configuration
│   └── deployment/        # Deployment guides
├── tests/
│   ├── unit/              # Matching, moderation, and Sol unit tests
│   ├── integration/       # Supertest REST API integration suite
│   └── e2e/               # 11-step complete user journey lifecycle test
├── docs/
│   ├── architecture/      # System architecture & service boundaries
│   ├── api/               # OpenAPI 3.0 specification
│   ├── security/          # Threat model & cryptographic boundaries
│   └── privacy/           # GDPR/CCPA data map & retention policies
├── docker-compose.yml     # Local orchestration (PostgreSQL, Redis, MinIO, API, Web)
└── .env.example           # Environment template
```

---

## 4. Quick Start & Local Development

### Prerequisites
- Node.js >= 20 (Node.js 22+ recommended)
- Docker Desktop (for containerized PostgreSQL, Redis, and MinIO)

### Installation
```bash
# 1. Clone & Enter Project Root
cd empathylink

# 2. Configure Environment
cp .env.example .env

# 3. Install Monorepo Dependencies
npm install

# 4. Generate Prisma Client
npm run prisma:generate
```

### Running with Docker (Recommended)
```bash
# Start PostgreSQL, Redis, MinIO, API, and Web
docker compose up -d
```
The services will be available at:
- **Web Client:** `http://localhost:3000`
- **REST API:** `http://localhost:4000/api/v1`
- **Health Endpoint:** `http://localhost:4000/health`
- **MinIO Console:** `http://localhost:9001` (User: `minioadmin` / Pass: `minioadmin`)

### Running Locally without Docker
```bash
# Run API Server
npm run dev:api

# Run Web Client (in separate terminal)
npm run dev:web
```

---

## 5. Running Automated Tests

```bash
# Run all unit, integration, and E2E lifecycle tests
npm test
```

Test coverage includes:
1. **Unit:** Deterministic HeartLink matching algorithm scoring & explainability.
2. **Unit:** Moderation pipeline, XSS sanitization, and crisis signal detection.
3. **Unit:** Sol non-clinical boundary verification, thought-map generation, and anti-dependency checks.
4. **Integration:** REST API endpoints (`/auth`, `/persona`, `/heartlink`, `/journal`, `/sol`, `/admin`).
5. **E2E:** Full 11-step traveler flow from registration through DreamVerse selection, matching, chat, journal reflection, safety report, and account deletion.

---

## 6. Seed Data & Demo Accounts

Run the database seed script:
```bash
npm run prisma:seed
```

Demo accounts created for development:
- **Platform Admin:** `admin@empathylink.internal` / `Password123!@#` (Persona: Aegis, Universe: MYTHOLOGY)
- **Cyberpunk Persona:** `nova@empathylink.internal` / `Password123!@#` (Persona: Nova, Code: EL-CY-58291)
- **Deep Ocean Persona:** `lyra@empathylink.internal` / `Password123!@#` (Persona: Lyra, Code: EL-OC-10492)
- **Gaming Persona:** `kaito@empathylink.internal` / `Password123!@#` (Persona: Kaito, Code: EL-GA-77312)

---

## 7. Crisis-Aware Protocol

If content contains severe distress or immediate danger signals, the platform:
1. Renders a calm, compassionate non-clinical notification.
2. Automatically displays international 24/7 crisis hotlines:
   - **US & Canada:** Call or text `988`
   - **US / UK Crisis Text Line:** Text `HOME` to `741741`
   - **United Kingdom:** NHS `111` or Samaritans `116 123`
   - **Australia:** Lifeline `13 11 14`
   - **International:** Befrienders Worldwide
3. Does **not** attempt medical or psychiatric diagnosis.

---

## 8. Disaster Recovery & Backups

- **Database:** PostgreSQL logical snapshots taken via `pg_dump` daily with 30-day encrypted retention.
- **Media:** S3 object versioning enabled on MinIO / AWS S3 buckets.
- **Secrets Management:** Secrets must always be injected at runtime via environment variables; never commit credentials to version control.
