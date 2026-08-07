-- A PostgREST computed field exposing profiles.id as text, so API callers can
-- substring-match on it (`?id_text=ilike.*abc*`). Postgres has no `uuid ilike
-- text` operator, so filtering the raw uuid column that way errors out.

CREATE OR REPLACE FUNCTION "public"."id_text"("public"."profiles")
  RETURNS text
  LANGUAGE "sql"
  IMMUTABLE
  AS $$ SELECT $1."id"::text $$;
