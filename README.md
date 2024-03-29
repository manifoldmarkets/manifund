## Getting Started

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

## Updating the dev database

You'll want to do this if we've changed the prod database schema (eg through the Supabase web UI).

0. Authenticate to snaplet with `npx snaplet auth setup`
1. Go to https://app.snaplet.dev/ and create a new snapshot.
2. Run `bun run snap:restore` (or `bun run snap:restore-empty`, which is less likely to miss a table)

   - You might need to add a `.snaplet/config.json` file with eg

   ```json
   {
     "projectId": "clej64eho0387lyqivt8o85zx",
     "targetDatabaseUrl": "postgres://postgres:[password]@db.oucjhqqretizqonyfyqu.supabase.co:6543/postgres"
   }
   ```

3. Run the following SQL code on the dev db (`Regrant permissions`):

   ```sql
   grant usage on schema public to postgres, anon, authenticated, service_role;

   grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role, supabase_admin;
   grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role, supabase_admin;
   grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role, supabase_admin;

   alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
   alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
   alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

   ```

4. Restart the database on eg https://app.supabase.com/project/oucjhqqretizqonyfyqu/settings/general to clear the cache

## Testing the Stripe payments flow locally

To test the Stripe webhook integration, you'll need to install the Stripe CLI, then run

```
stripe listen --forward-to localhost:3000/api/stripe-endpoints
```

## Pulling types from the database

```
npx supabase gen types typescript --project-id fkousziwzbnkdkldjper --schema public > db/database.types.ts
```

Note that bun/bunx has some problems with the `supabase` cli, so just use npx here.
