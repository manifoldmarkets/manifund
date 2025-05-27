#!/bin/bash
set -e

if [ -f .env.local ]; then
    source .env.local
fi

if [ -z "$PROD_DB_URL" ]; then
    echo "Error: PROD_DB_URL must be set in .env.local"
    exit 1
fi

LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
DATA_BACKUP="prod_data_$(date +%Y%m%d_%H%M%S).sql"

echo "This will:"
echo "   1. Export data from production"
echo "   2. Clear all data in local database"
echo "   3. Import production data to local"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then exit 1; fi

echo "Step 1: Exporting data from production..."
pg_dump --data-only --no-owner --no-acl "$PROD_DB_URL" -f "$DATA_BACKUP"q
echo "Data exported to $DATA_BACKUP"

echo ""
echo "Step 2: Clearing local database data..."
psql "$LOCAL_DB_URL" -c "
DO \$\$ 
DECLARE
    r RECORD;
BEGIN
    -- Truncate all tables in public schema
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
END \$\$;
"
echo "Local data cleared"

echo ""
echo "Step 3: Importing production data (filtering harmless errors)..."
# Import data and filter out known harmless errors
psql "$LOCAL_DB_URL" -f "$DATA_BACKUP" 2>&1 | \
  grep -v "error: invalid command" | \
  grep -v "ERROR.*duplicate key value violates unique constraint.*migrations" | \
  grep -v "ERROR.*duplicate key value violates unique constraint.*schema_migrations" | \
  grep -v "ERROR.*relation.*supabase_migrations.*does not exist" | \
  grep -v "syntax error at or near" | \
  grep -v "invalid command" || true

echo "Production data imported"

echo ""
echo "Step 4: Verifying data import..."
echo "   Checking row counts for main tables:"

# Get row counts for main application tables
psql "$LOCAL_DB_URL" -c "
SELECT 
    'bids' as table_name, 
    count(*) as row_count
FROM bids
UNION ALL
SELECT 
    'projects', 
    count(*) 
FROM projects
UNION ALL
SELECT 
    'comments', 
    count(*) 
FROM comments
UNION ALL
SELECT 
    'profiles', 
    count(*) 
FROM profiles
ORDER BY row_count DESC;
" --quiet --tuples-only | while read -r line; do
    echo "   $line"
done

echo ""
echo "🧹 Cleanup:"
read -p "Delete backup file? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm "$DATA_BACKUP"
    echo "Backup file deleted"
    else
        echo "Backup file kept: $DATA_BACKUP"
fi
