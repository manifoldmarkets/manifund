-- close-grants re-sends its weekly reminders forever while a project sits in
-- 'proposal' past its close date. Give admins a per-project off switch so
-- long-stalled proposals stop generating mail without being rejected.

ALTER TABLE "public"."projects"
  ADD COLUMN IF NOT EXISTS "alerts_paused" boolean NOT NULL DEFAULT false;
