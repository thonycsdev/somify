# somify

Economize. Cresça. Conquiste.

A personal finance app built with Next.js — track expenses, categorize
transactions, and follow your progress toward financial goals.

## Stack

- [Next.js](https://nextjs.org) (App Router)
- [Chakra UI v3](https://www.chakra-ui.com/) for components
- PostgreSQL via [`pg`](https://node-postgres.com/) + [`node-pg-migrate`](https://salsita.github.io/node-pg-migrate/)
- [Zod](https://zod.dev/) for request/response validation
- [Jest](https://jestjs.io/) for unit and integration tests

## Getting started

Requires Docker (for Postgres) and the Node version in `.nvmrc`.

1. Copy the environment file and fill in the values:

   ```bash
   cp .env.development.example .env.development  # if present, otherwise create it
   ```

   Required variables: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
   `POSTGRES_PORT`, `DATABASE_URL`.

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run migrations and start the dev server:

   ```bash
   pnpm migrate:up
   pnpm dev
   ```

   `pnpm dev` starts the Postgres container and the Next.js dev server.
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

```sh
pnpm dev                # Start Postgres (Docker) + Next.js dev server
pnpm build              # Production build
pnpm test               # Run all Jest tests
pnpm test:watch         # Jest in watch mode
pnpm test:integration   # Start Postgres + Next.js, then run tests in tests/

pnpm db:start           # Start Postgres container and wait for readiness
pnpm migrate:create <name>  # Generate a new migration file
pnpm migrate:up         # Run pending migrations
pnpm migrate:down       # Roll back last migration

pnpm lint               # Lint only, report errors
pnpm lint:fix           # Lint + format, auto-fix everything possible
```

## Project structure

```
app/                # Pages and API routes (App Router)
  api/v1/           # REST endpoints: auth, user, me, transaction, health
models/             # DB queries and business logic per resource
schemas/            # Zod schemas mirroring each DB table
infra/              # Database singleton, Docker Compose, scripts
migrations/         # node-pg-migrate migration files
tests/              # Integration tests (*.integration.test.ts)
```

See `CLAUDE.md` for detailed architecture and coding conventions.

## Testing

```sh
pnpm test               # unit tests
pnpm test:integration   # full integration suite against a live server
```

Each integration suite resets the database schema before running via
`orchestrator.resetDatabase()`.
