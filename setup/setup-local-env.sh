#!/bin/bash

# Get local Supabase configuration
STATUS=$(npx supabase status)
API_URL=$(echo "$STATUS" | grep "API URL:" | sed 's/.*API URL: *//')
ANON_KEY=$(echo "$STATUS" | grep "anon key:" | sed 's/.*anon key: *//')
SERVICE_ROLE_KEY=$(echo "$STATUS" | grep "service_role key:" | sed 's/.*service_role key: *//')
STORAGE_URL=$(echo "$STATUS" | grep "S3 Storage URL:" | sed 's/.*S3 Storage URL: *//')

# Write to .env.development.local (Next.js will automatically use this in development)
cat > .env.development.local << EOF
# Local Supabase Configuration (auto-generated)
# This file is used when running 'bun run dev'
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
SUPABASE_BUCKET_URL=$STORAGE_URL
EOF

echo "Created .env.development.local with local Supabase config"
