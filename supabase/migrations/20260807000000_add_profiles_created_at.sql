-- profiles had no creation timestamp: signup dates lived only in auth.users,
-- which public queries (e.g. /api/v0/users) can't read or sort by. Add a
-- created_at column so profiles can be listed and paginated by signup date.

ALTER TABLE "public"."profiles"
  ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone NOT NULL DEFAULT "now"();

-- Backfill from the auth user's signup time where there is one.
UPDATE "public"."profiles" "p"
SET "created_at" = "u"."created_at"
FROM "auth"."users" "u"
WHERE "u"."id" = "p"."id";

-- Profiles with no auth user (orgs, funds, seeded accounts) fall back to their
-- earliest transaction.
UPDATE "public"."profiles" "p"
SET "created_at" = "t"."first_txn"
FROM (
  SELECT "profile_id", min("created_at") AS "first_txn"
  FROM (
    SELECT "from_id" AS "profile_id", "created_at" FROM "public"."txns"
    UNION ALL
    SELECT "to_id" AS "profile_id", "created_at" FROM "public"."txns"
  ) "user_txns"
  WHERE "profile_id" IS NOT NULL
  GROUP BY "profile_id"
) "t"
WHERE "t"."profile_id" = "p"."id"
  AND NOT EXISTS (SELECT 1 FROM "auth"."users" "u" WHERE "u"."id" = "p"."id");

-- A handful of old accounts have neither an auth user nor a transaction. The
-- now() default would sort them ahead of today's signups, so date them to the
-- oldest known account instead. (Profiles created from here on keep now().)
UPDATE "public"."profiles" "p"
SET "created_at" = (SELECT min("created_at") FROM "auth"."users")
WHERE NOT EXISTS (SELECT 1 FROM "auth"."users" "u" WHERE "u"."id" = "p"."id")
  AND NOT EXISTS (
    SELECT 1 FROM "public"."txns" "t" WHERE "t"."from_id" = "p"."id" OR "t"."to_id" = "p"."id"
  );

CREATE INDEX IF NOT EXISTS "profiles_created_at_idx"
  ON "public"."profiles" ("created_at" DESC);
