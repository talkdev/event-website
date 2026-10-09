# SceneAround

India-wide event discovery platform (working name). Multi-city from day one; launch coverage starts with Delhi, Mumbai, and Bengaluru.

## Stack

- Next.js (App Router) + TypeScript
- PostgreSQL + Drizzle ORM
- Railway: web service + worker service + Postgres
- Zod validation; pnpm

## Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Railway Postgres).
2. Install and migrate:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

3. Optional worker (separate terminal):

```bash
pnpm worker
```

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm dev` | Next.js web app |
| `pnpm worker` | Background job loop |
| `pnpm db:generate` | Create SQL migrations from schema |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema without migration files (local only) |
| `pnpm db:seed` | Seed cities, categories, demo events |

## Railway

Create one project with:

1. **Postgres** plugin
2. **Web** service — start: `pnpm start` (build: `pnpm build`)
3. **Worker** service — start: `pnpm worker` (same repo)

Share `DATABASE_URL` and `SITE_URL` across services. Run `pnpm db:migrate` as a release command on the web service.

## Routes

- `/` — city picker
- `/[city]` — city home
- `/[city]/[category]` — category landing
- `/events/[city]/[eventSlug]/[occurrenceSlug]` — occurrence detail
- `GET /api/events?city=delhi` — public listing API

Demo seed events are clearly marked in descriptions and must not be presented as real listings at launch.
