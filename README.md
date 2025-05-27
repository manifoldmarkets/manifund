# Manifund Development Guide

## Prerequisites

1. Install [Bun](https://bun.sh/): `curl -fsSL https://bun.sh/install | bash`
2. Install docker: [Orbstack.dev](https://orbstack.dev/) or [Docker desktop](https://docs.docker.com/desktop/setup/install/mac-install/)
3. Install dependencies: `bun install`

## Development against local supabase (Recommended)

### Typical Workflow

1. Start local supabase: `bun run supabase:local`
2. Update .env.development.local with local supabase details: `bun run setup-local-env`
3. Import data (Optional): `bun run sync-data-from-prod`. This requires additional keys.
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

### Google OAuth

If you want Google Oauth to work locally, you should provide these values to your `.env.development.local`

```
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your-client-id
  SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your-secret
```

Setup for this requires:
1. Creating a google cloud project and (enabling oauth)[https://console.cloud.google.com/apis/credentials]
2. Creating Oauth2.0 credentials with `http://127.0.0.1:54321/auth/v1/callback` as an authorized reidrect URI


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
