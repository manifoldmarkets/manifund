## Getting Started

To spin up a server against the prod database:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or run `yarn dev:dev` to connect to the dev database.

## Getting .env variables

You'll need the supabase client and admin keys. After you've been added to the
Vercel project, get them with:

```
npx vercel link
npx vercel env pull
```

And rename `.env` to `.env.local`.

## Updating the dev database

1. Go to https://app.snaplet.dev/ and create a new snapshot. This copies and transforms the prod db.
2. Run `yarn snap:restore` (or `yarn snap:restore-empty`)
3. Run the following SQL code on the dev db:

   ```
   grant usage on schema public to postgres, anon, authenticated, service_role;

   grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role, supabase_admin;
   grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role, supabase_admin;
   grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role, supabase_admin;

   alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
   alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
   alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;
   ```
