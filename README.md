# SmartLocker Backend API

A Node.js/Express backend for the SmartLocker package management system. It uses **TypeScript**, **Express**, **TypeORM**, **MySQL**, **JWT-based auth**, and **Vitest** to support a modular API with controllers, middleware, services, repositories, and tests.

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Path Alias Convention](#-path-alias-convention)
- [Setup & Installation](#-setup--installation)
- [Environment Configuration](#-environment-configuration)
- [Database Migrations](#-database-migrations)
- [Data Seeding](#-data-seeding)
- [Development](#-development)
- [Testing](#-testing)
- [Production](#-production)
- [API Reference](#-api-reference)
- [Architecture](#-architecture)
- [Request Lifecycle (End-to-End)](#-request-lifecycle-end-to-end)
- [Next Steps](#-next-steps)

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **Express.js** | HTTP server framework |
| **TypeScript** | Type-safe application layer |
| **TypeORM** | ORM and database migrations |
| **MySQL** | Relational database |
| **jsonwebtoken** | JWT authentication |
| **bcryptjs** | Password hashing |
| **Vitest** | Unit and integration testing |
| **tsx** | TypeScript execution and dev server |

---

## 📁 Project Structure

```
src/
├── app.ts                           # Express app factory
├── server.ts                        # Server entrypoint
├── controllers/                     # HTTP request handlers
├── middleware/                      # Auth, guest, CORS, and other middleware
├── routes/                          # Route registration
├── services/                        # Business logic layer
├── utils/                           # Shared response and helper utilities
├── database/
│   ├── data-source.ts               # TypeORM connection config
│   ├── entities/                    # TypeORM entity definitions
│   ├── migrations/                  # Schema evolution files
│   ├── repositories/                # Data access abstractions
│   └── seeders/                     # Data seed scripts
├── tests/                           # Unit and integration tests
└── public/                          # Static assets served by Express

dist/                                # Compiled JavaScript output
tsconfig.json                        # TypeScript compiler configuration
```

---

## � Path Alias Convention

The backend uses the `@` path alias to reference modules from the `src` root. This keeps imports short, explicit, and easy to trace compared with long relative chains like `../../...`.

### Why we use it

- Better project structure and maintainability
- More readable imports in routes, services, and database code
- Easier to follow module ownership and dependencies
- Less brittle when files move around

### Example

Before:

```ts
import authRouter from './auth.js';
import stationsRouter from './stations.js';
import { buildApiResponse } from '../../../utils/response.js';
```

After:

```ts
import authRouter from '@/routes/auth.js';
import stationsRouter from '@/routes/stations.js';
import { buildApiResponse } from '@/utils/response.js';
```

This convention is configured in `tsconfig.json` and should be used consistently across the backend codebase.

---

## �🚀 Setup & Installation

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **MySQL** 8.0+ running on `localhost:3306`
- MySQL credentials (see `.env.example`)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your MySQL credentials:**
   ```env
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=smartlocker
   MYSQL_USER=local_user
   MYSQL_PASSWORD=Local-User-DKX-983!
   ```

---

## 🗄️ Environment Configuration

### `.env` Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Express server port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `DB_HOST` | MySQL server hostname | `localhost` |
| `DB_PORT` | MySQL server port | `3306` |
| `DB_NAME` | Database name | `smartlocker` |
| `MYSQL_USER` | MySQL username | `local_user` |
| `MYSQL_PASSWORD` | MySQL password | `Local-User-DKX-983!` |

---

## 🗃️ Database Migrations

### Create Database

If the `smartlocker` database doesn't exist:

```sql
CREATE DATABASE smartlocker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Run Initial Migration

Applies the schema (tables, enums, indexes, foreign keys):

```bash
npm run db:migrate
```

This runs the migration at `src/database/migrations/1687516800000-InitSmartLockerErd.ts`.

### Create New Migration

After modifying entities, generate a new migration:

```bash
npm run db:migration:create -- -n DescriptiveNameHere
```

Then edit the generated file in `src/database/migrations/` and run it with `npm run db:migrate`.

### Revert Last Migration

```bash
npm run db:migrate:revert
```

---

## 💾 Data Seeding

Populate the database with demo stations, lockers, and users:

```bash
npm run db:seed
```

This script seeded into `src/database/seeders/seed.ts` and inserts:
- **3 demo stations** (mall, office, residential)
- **3 demo lockers** (small, medium, large)
- **2 demo users** (Priya, Ahmad)

---

## 🛠️ Development

### Start Dev Server

Runs `tsx watch` for hot-reload on file changes:

```bash
npm run dev
```

Server starts at `http://localhost:3000`

**Endpoints available:**
- `GET /health` — Health check
- `GET /` — HTML index page

### Build TypeScript

Compiles `src/` → `dist/`:

```bash
npm run build
```

This validates all TypeScript types and generates JavaScript ready for production.

---

## 🧪 Testing

Run the backend tests locally with the following commands:

```bash
npm run test:unit
```

This runs the unit-test suite only and excludes integration tests. It is the command used by the GitHub Actions CI workflow.

```bash
npm test
```

This runs the full Vitest suite, including integration tests when available.

```bash
npm run test:watch
```

Use this for interactive test development while editing services and repositories.

---

## 📦 Production

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

Runs the compiled code from `dist/`.

### Docker Deployment

Docker images are configured in:
- [Dockerfile](./Dockerfile)
- [docker-compose.local.yml](./docker-compose-local.yml) — Local dev
- [docker-compose.dev.yml](./docker-compose.dev.yml) — Production

---

## 📚 API Reference

Full API specification is in [ERD_README.md](./ERD_README.md), including:

- **Entity Relationship Diagram** — Database schema
- **Entity Specifications** — Field types, constraints, examples
- **Delivery Lifecycle** — State machine for packages
- **Storage Pricing Tiers** — Charge calculation rules
- **API Endpoints** — Request/response contracts for all routes
- **Response Envelope** — Standard response format
- **Error Status Codes** — HTTP status codes by scenario
- **Business Rules** — Locker allocation, optimistic locking, two-phase deposit
- **Index Recommendations** — Database query optimization

---

## 🏛️ Architecture

### SOLID Principles

This backend follows **SOLID** design:

- **S**ingle Responsibility: Each repository handles one entity
- **O**pen/Closed: Extend `BaseRepository` for new entities
- **L**iskov Substitution: Repositories are interchangeable
- **I**nterface Segregation: Each repository exposes only needed methods
- **D**ependency Injection: Services will inject repos (ready for implementation)

### Repository Pattern

**BaseRepository** — Generic CRUD (Create, Read, Update, Delete)

```typescript
class StationRepository extends BaseRepository<Station> {
  async findByCity(city: string): Promise<Station[]> { ... }
  async findByType(type: string): Promise<Station[]> { ... }
}
```

**Usage in services/routes:**

```typescript
const stationRepo = AppDataSource.getRepository(Station);
const customStationRepo = new StationRepository(stationRepo);

const station = await customStationRepo.findByCity('Petaling Jaya');
```

### Entity Relationships

- **Station** → Locker (1:many)
- **Locker** → Package (1:many)
- **User** → Package (1:many)
- **User** → Message (1:many)
- **Package** → Message (1:many)

Foreign keys use `ON DELETE RESTRICT` and `ON UPDATE CASCADE` for data integrity.

### Request Lifecycle (End-to-End)

Yes — the flow should start from the incoming HTTP request. A typical request follows this path through the backend:

### Consistent API Response Shape

All API responses should use the same envelope, regardless of success or error. The shared helper in [src/utils/response.ts](src/utils/response.ts) builds responses in the following shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": [],
  "errors": []
}
```

And for failures:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Route not found",
  "data": [],
  "errors": ["Route not found"]
}
```

This keeps the API predictable for frontend consumers and makes both successful and unsuccessful responses easy to handle consistently.


1. **Client sends an HTTP request** to the Express server.
2. The app bootstrap in [src/app.ts](src/app.ts) initializes the Express app and applies core middleware such as JSON parsing and static file serving.
3. The CORS middleware in [src/middleware/corsMiddleware.ts](src/middleware/corsMiddleware.ts) runs first for cross-origin requests, adds the required headers, and handles preflight `OPTIONS` requests.
4. The route layer in [src/services/routeService.ts](src/services/routeService.ts) mounts the router and registers the API 404 fallback plus the centralized error handler.
5. The request is matched in [src/routes/index.ts](src/routes/index.ts), where route-specific middleware such as guest or auth checks run before the controller.
6. The controller in [src/controllers](src/controllers) handles the request, validates the context, and delegates business logic to the appropriate service.
7. The service uses repositories and database entities in [src/database](src/database) to read or write data.
8. The response is returned in the shared API envelope through [src/utils/response.ts](src/utils/response.ts).
9. If something fails, the error is passed through the route service error middleware and normalized into a consistent API error response.

A simple example flow for an authenticated request looks like this:

```text
HTTP Request
  -> app.ts
  -> corsMiddleware
  -> routeService.mount(app)
  -> routes/index.ts
  -> authMiddleware / guestMiddleware
  -> controller
  -> service
  -> repository
  -> entity
  -> database
  -> response envelope
  -> client
```

For the data layer, the flow is:

```text
entity definition
  -> migration
  -> database schema
  -> repository
  -> service
  -> controller response
```

In practice:
- **Entities** define the TypeORM model shape in [src/database/entities](src/database/entities).
- **Migrations** evolve the database schema safely in [src/database/migrations](src/database/migrations).
- **Repositories** encapsulate data access logic in [src/database/repositories](src/database/repositories).
- **Seeders** populate development/demo data in [src/database/seeders](src/database/seeders).

This structure makes the backend easy to follow: middleware handles cross-cutting concerns, routes decide which handler to run, controllers coordinate the flow, services own the business logic, and the database layer stays organized through entities, migrations, repositories, and seeders.

---

**SmartLocker Backend** © 2026 — Built with ❤️ using TypeORM + TypeScript
