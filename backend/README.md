# Pawn Manager Backend (Express.js + TypeScript)

This is the enterprise-grade multi-tenant backend server for the Pawn Manager system. It implements a clean, modular architecture (by feature modules) leveraging Node.js, Express.js, TypeScript, PostgreSQL (via Prisma ORM), and Redis.

## Architectural Highlights

1. **Clean Feature Modules**: Code is grouped by business area (Auth, Customer, Pawn, Payment, Employee, Reports, Dashboard, Upload) rather than technical layer.
2. **Transparent Multi-Tenancy & Soft-Delete**: Enforced at the query-engine level using a custom Prisma Client extension powered by `AsyncLocalStorage`. Developers write clean SQL/Prisma calls without manual `where: { shopId }` filters.
3. **AES-256-GCM KYC Compliance**: Customer Aadhaar and PAN credentials are automatically encrypted before writing to database fields. Plain search indexes are maintained via `last4Digits` strings. Decrypted records are only yielded in detail endpoints.
4. **Double-Entry Ledger**: Bookkeeping movements are logged as Credit/Debit `LedgerEntry` objects concurrently with customer repayments.
5. **Session & Rate Management (Redis)**: Refresh tokens, permissions list caching, and route-specific API rate limits are backed by Redis.
6. **Asynchronous Background Processing (BullMQ)**: Processes offloaded heavy-lifting tasks (email dispatches, PDF compiling, Excel exports) asynchronously.

---

## Directory Structure

```
src/
├── modules/
│   ├── auth/            # Signin, signup, token rotations, forgot password
│   ├── customer/        # Customer CRM, KYC encryption, address formatting
│   ├── pawn/            # Tickets issuing, item lists, maturity calculations
│   ├── payment/         # Payments, ledgers, transaction processing
│   ├── employee/        # Worker controls, profile details
│   ├── reports/         # Ledger exports (CSV/Excel), financial reporting
│   ├── dashboard/       # Dashboard card summaries & caching
│   └── upload/          # Disk storage file uploads (Multer)
├── common/
│   ├── middleware/      # Auth, tenant context, request validation, sanitization, rate-limiter
│   ├── errors/          # Custom AppError classes (NotFoundError, ValidationError, etc.)
│   ├── utils/           # Encryption keys, responses, document creators
│   ├── logger/          # Pino structured log setup
│   ├── validation/      # Shared Zod query schemas
│   └── constants/       # Perm codes & status rules
├── config/              # Redis client, database context, env validation
├── jobs/                # BullMQ producers, consumers, and workers
├── prisma/              # schema.prisma, migrations, seeds
└── server.ts            # Entrypoint
```

---

## Technical Stack

- **Core**: Node.js, Express.js, TypeScript (Strict Mode)
- **Database ORM**: Prisma (PostgreSQL)
- **Cache / Queue**: Redis, BullMQ
- **Authentication**: JWT Access / Refresh Token Rotation
- **Cryptography**: AES-256-GCM, Bcrypt
- **Validation**: Zod (Input Schemas)
- **Logger**: Pino, Pino HTTP (Context tracking mixins)
- **Document Exporter**: xlsx (SheetJS), csv-writer
- **Testing**: Vitest (Unit / Mock tests)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm (v9+)
- PostgreSQL & Redis (or running via Docker Compose)

### 1. Configure Environment Variables
Copy the template `.env` and fill in your connection details:
```bash
cp .env.example .env
```

### 2. Install Project Dependencies
pnpm v10 handles build hooks using `onlyBuiltDependencies` in `package.json`:
```bash
pnpm install
```

### 3. Setup Database Schema & Seeding
Generate the Prisma Client types:
```bash
pnpm prisma:generate
```

Apply pending migrations and seed core system permissions (`read:dashboard`, `manage:pawns`, etc.):
```bash
pnpm prisma:migrate
pnpm prisma:seed
```

### 4. Run Development Server
Boot up the tsx watch runner:
```bash
pnpm dev
```
The server will bind to `http://localhost:5000`. You can inspect the OpenAPI Spec sandbox at:
`http://localhost:5000/docs`

---

## Running Test Suites

Vitest handles fast, in-memory compilation. Execute the tests:
```bash
pnpm test
```

To run tests in watch mode:
```bash
pnpm test:watch
```

---

## Container Deployment

The backend includes a production-ready multi-stage Docker build configuration.

### Start Database & Cache Only (Local development)
If you want to run Postgres and Redis inside Docker while running node on host:
```bash
docker compose up -d postgres redis
```

### Build & Run the Whole Stack
```bash
docker compose up --build
```
