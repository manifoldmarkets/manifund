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
