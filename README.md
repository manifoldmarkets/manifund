## Getting Started

### Prerequisites

1. Install [Bun](https://bun.sh/) by running:
```bash
curl -fsSL https://bun.sh/install | bash
```

2. Install project dependencies:
```bash
bun install
```

3. Install cross-env (required for running the dev scripts):
```bash
bun add -d cross-env
```

### Running the server

To spin up a server against the prod database:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or run `bun run dev:dev` to connect to the dev database.

## Getting .env variables

You'll need the supabase client and admin keys. After you've been added to the
Vercel project, get them with:

```bash
bunx vercel link
bunx vercel env pull
```

## Testing the Stripe payments flow locally

To test the Stripe webhook integration, you'll need to install the Stripe CLI, then run

```
stripe listen --forward-to localhost:3000/api/stripe-endpoints
```

## Pulling types from the database
First, log in to the Supabase CLI:
```bash
bunx supabase login
```
This will open a browser window where you can authenticate.

Then, to sync `db/database.types.ts` with what's in Supabase:
- Dev Supabase: `bun run gen-dev-types`
- Prod Supabase: `bun run gen-types`
```bash
bun run gen-types
```
