# Manifund

Funding platform built with Next.js 16, TypeScript, Supabase, and Stripe.

## Quick Commands

```bash
bun run dev          # Dev server (turbo, production Supabase)
bun run dev:dev      # Dev server (dev Supabase)
bun run dev:local    # Dev server (local Supabase via Docker)
bun run build        # Production build
bun run format       # oxfmt format all files
bun run gen-types    # Regenerate Supabase TypeScript types
```

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router + legacy Pages Router API routes)
- **Language:** TypeScript 5.1.3 (strict mode)
- **Database:** Supabase (PostgreSQL), no ORM - direct Supabase JS client
- **Auth:** Supabase Auth with Google OAuth
- **Payments:** Stripe
- **Styling:** Tailwind CSS with clsx for conditional classes
- **Package Manager:** Bun
- **Editor:** Tiptap (rich text / markdown)
- **Deployment:** Vercel

## Project Structure

```
app/              # Next.js App Router pages and API routes
  api/v0/         # Versioned API routes (App Router)
pages/api/        # Legacy API routes (Pages Router) - 49 serverless functions
components/       # Reusable React components
db/               # Database layer: Supabase clients, queries, generated types
  database.types.ts  # Auto-generated from Supabase (do not edit manually)
  supabase-server.ts # Server-side client (with cookies)
  supabase-browser.ts # Browser-side client
lib/              # Server actions (auth-actions.ts)
utils/            # Shared utilities (formatting, math, AMM calculations)
hooks/            # React hooks
supabase/         # Supabase config and SQL migrations
proxy.ts          # Next.js 16 middleware (session refresh, JWT validation)
```

## Code Style

- **oxfmt:** 2-space indent, no semicolons, single quotes, trailing commas
- **Files:** kebab-case (`profile-card.tsx`)
- **Components:** PascalCase (`ProfileHeader`)
- **Functions:** camelCase (`getProjectBySlug`)
- **Constants:** UPPER_SNAKE_CASE (`CENTS_PER_DOLLAR`)
- **Types:** PascalCase, often with compound/variant names (`FullProject`, `ProjectAndProfile`)
- **Imports:** Use `@/` path alias (maps to project root)
- **ESLint rules:** `@typescript-eslint/no-floating-promises: error`, `require-await: error`

## Key Patterns

### Server vs Client Components

Default to server components. Only use `'use client'` when interactivity is needed.

```typescript
// Server component (default)
import 'server-only'
export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params  // Next.js 16: params are async
  const supabase = await createServerSupabaseClient()
  // ...
}

// Client component
'use client'
export function InteractiveWidget() { ... }
```

### Next.js 16 Async Conventions

`params` and `searchParams` are Promises in Next.js 16 - always `await` them:

```typescript
const { slug } = await props.params
const { tab } = await props.searchParams
```

### Database Queries

Direct Supabase queries, no ORM. Types auto-generated from schema:

```typescript
const supabase = await createServerSupabaseClient()
const { data } = await supabase
  .from('projects')
  .select('*, bids(*), profiles(*)')
  .eq('slug', slug)
  .throwOnError()
```

### Styling

Tailwind utility classes with clsx for conditionals:

```typescript
className={clsx('px-4 py-2 rounded', color === 'emerald' && 'bg-emerald-500 text-white')}
```

## Environment Variables

Key variables are configured in `db/env.ts`. Uses multi-environment setup:

- `NEXT_PUBLIC_SUPABASE_ENV` switches between `'PROD'` and `'dev'`
- Separate Supabase URL/key pairs for prod and dev
- Stripe has live and test key pairs
- Local dev uses `.env.development.local`

## Database Migrations

```bash
# Make changes via Supabase Studio (localhost:54323 for local)
npx supabase db diff --schema public --file migration_name
npx supabase migration up        # Apply locally
bun run gen-types:local           # Regenerate types
```

## No Test Framework

There is no test runner (jest/vitest) configured. Verify changes by running `bun run build`.

## Cron Jobs (Vercel)

- `close-grants` - daily 7 AM UTC
- `request-updates` - Mondays 3 PM UTC
- `embeddings/sync` - daily 8 AM UTC
- `weekly-digest` - Mondays 5 PM UTC
