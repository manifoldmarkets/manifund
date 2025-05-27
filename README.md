# Manifund Development Guide

## Prerequisites

1. Install [Bun](https://bun.sh/): `curl -fsSL https://bun.sh/install | bash`
2. Install docker: [Orbstack.dev](https://orbstack.dev/) or [Docker desktop](https://docs.docker.com/desktop/setup/install/mac-install/)
3. Install dependencies: `bun install`

## Development against local supabase (Recommended)

### Typical Workflow

1. Start local supabase: `npx supabase start`
2. Update .env.development.local with local supabase details: `./setup/setup-local-env.sh`
3. Import data (Optional): `./setup/sync-data-from-prod.sh`. This requires additional keys.
4. Run server using local supabase: `bun run dev:local`

### If you intend on making database changes:
5. Make your schema changes
   - Option A: Via Supabase Studio (http://localhost:54323)
   - Option B: Write SQL migrations manually
6. Generate a migration
   - From Studio changes: `npx supabase db diff --schema public --file your_migration_name`
   - Manual: `npx supabase migration new your_migration_name` then edit the file
7. Apply migration locally:
  ```
    npx supabase migration up
  ```
8. Update local typescript types
  ```
    bun run gen-types:local
  ```
9. Test your changes
10. Apply migrations to remote supabase projects when ready
  ```
    # Link to target environment
    npx supabase link --project-ref PROJECT_ID  # fkousziwzbnkdkldjper for prod, oucjhqqretizqonyfyqu for dev

    # Check what migrations will be applied
    npx supabase migration list --linked

    # Dry run to see what would happen and confirm its safety
    npx supabase migration up --linked --dry-run

    # Apply migrations
    npx supabase migration up --linked
  ```


## Development against remote supabase

```bash
# Get environment variables
bunx vercel link
bunx vercel env pull

# Run against remote
bun run dev      # Production database
bun run dev:dev  # Development database
```


### Typescript type Generation

```bash
bunx supabase login
bun run gen-types        # From prod
bun run gen-types:dev    # From dev
```

## Testing Stripe Webhooks

```bash
stripe listen --forward-to localhost:3000/api/stripe-endpoints
```
