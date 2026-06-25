# SmartLocker Backend API

A Node.js/Express backend for the SmartLocker package management system. Built with **TypeORM**, **TypeScript**, and **MySQL** using the **Repository pattern** for SOLID architecture.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Development](#development)
- [Testing](#testing)
- [Production](#production)
- [API Reference](#api-reference)
- [Architecture](#architecture)

---

## 🏗️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime |
| **Express.js** | HTTP server framework |
| **TypeORM** | Object-relational mapping (MySQL) |
| **TypeScript** | Type-safe language |
| **MySQL** | Relational database |
| **tsx** | TypeScript execution & dev server |

---

## 📁 Project Structure

```
src/
├── database/
│   ├── data-source.ts              # TypeORM MySQL connection config
│   ├── entities/                   # Database models (TypeORM decorators)
│   │   ├── Station.ts
│   │   ├── Locker.ts
│   │   ├── User.ts
│   │   ├── Package.ts
│   │   └── Message.ts
│   ├── migrations/                 # Auto-generated SQL migrations
│   │   └── 1687516800000-InitSmartLockerErd.ts
│   ├── repositories/               # Data access layer (SOLID)
│   │   ├── BaseRepository.ts       # Generic CRUD operations
│   │   ├── StationRepository.ts
│   │   ├── LockerRepository.ts
│   │   ├── UserRepository.ts
│   │   ├── PackageRepository.ts
│   │   └── MessageRepository.ts
│   └── seeders/
│       └── seed.ts                 # Demo data seeder
├── app.ts                           # Express app factory
└── server.ts                        # Server bootstrap & connection init

dist/                                # Compiled JavaScript (build output)
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

---

## 📖 Next Steps

1. **Implement API routes** — Wire Express handlers in `src/app.ts`
2. **Create services** — Business logic layer above repositories
3. **Add validation** — Input validation middleware
4. **Add authentication** — Supabase or JWT tokens
5. **Write tests** — Unit tests for repositories and services
6. **Deploy** — Push to AWS/Docker with CI/CD

---

## 🤝 Contributing

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make changes and build: `npm run build`
3. Commit: `git commit -m "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Create a pull request

---

## 📝 License

ISC

---

## 📞 Support

For questions about:
- **ERD/API spec** — See [ERD_README.md](./ERD_README.md)
- **Database schema** — Check migrations in `src/database/migrations/`
- **Repository patterns** — Review `src/database/repositories/`

---

**SmartLocker Backend** © 2026 — Built with ❤️ using TypeORM + TypeScript
