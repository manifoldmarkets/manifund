# Manifund Development Guide

## Prerequisites

1. Install [Bun](https://bun.sh/): `curl -fsSL https://bun.sh/install | bash`
2. Install dependencies: `bun install`

## Development against local supabase (Recommended)

```bash
# Start local Supabase
npx supabase start

# Configure environment
./setup/setup-local-env.sh

# Optional: Import production data
./setup/sync-data-from-prod.sh

# Run server using local supabase
bun run dev:local
```


### Running the server

### If you intend on making database changes:
5. **Make database changes**:
   - Option A: Via Supabase Studio (http://localhost:54323)
   - Option B: Write SQL migrations manually
6. **Generate migration**:
   - From Studio changes: `npx supabase db diff --schema public --file your_migration_name`
   - Manual: `npx supabase migration new your_migration_name` then edit the file
7. **Apply migration locally**: `npx supabase migration up`
8. **Update local typescript types**: `bun run gen-types:local`
9. **Test your changes**
10. **Apply migrations to remote supabase projects when ready**:
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
