SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
SET search_path = public;

CREATE TYPE "public"."bid_row" AS (
	"project" "uuid",
	"amount" numeric,
	"bidder" "uuid"
);

CREATE TYPE "public"."bid_status" AS ENUM (
    'deleted',
    'pending',
    'accepted',
    'declined'
);

CREATE TYPE "public"."bid_type" AS ENUM (
    'buy',
    'sell',
    'donate',
    'assurance buy',
    'assurance sell'
);

CREATE TYPE "public"."comment_row" AS (
	"id" "uuid",
	"project" "uuid",
	"commenter" "uuid",
	"content" "jsonb"
);

CREATE TYPE "public"."comment_row_txnless" AS (
	"id" "uuid",
	"project" "uuid",
	"commenter" "uuid",
	"content" "jsonb"
);

CREATE TYPE "public"."comment_type" AS ENUM (
    'progress update',
    'final report'
);

CREATE TYPE "public"."profile_type" AS ENUM (
    'individual',
    'org',
    'fund',
    'amm'
);

CREATE TYPE "public"."project_stage" AS ENUM (
    'active',
    'proposal',
    'not funded',
    'complete',
    'hidden',
    'draft'
);

CREATE TYPE "public"."project_type" AS ENUM (
    'grant',
    'cert',
    'dummy'
);

CREATE TYPE "public"."project_row" AS (
	"id" "uuid",
	"creator" "uuid",
	"title" "text",
	"blurb" "text",
	"description" "jsonb",
	"min_funding" double precision,
	"funding_goal" double precision,
	"founder_shares" integer,
	"type" "public"."project_type",
	"stage" "public"."project_stage",
	"round" "text",
	"slug" "text",
	"location_description" "text",
	"lobbying" boolean
);

CREATE TYPE "public"."transfer_row" AS (
	"recipient_email" "text",
	"recipient_name" "text",
	"project_id" "uuid"
);

CREATE TYPE "public"."txn_type" AS ENUM (
    'profile donation',
    'project donation',
    'user to user trade',
    'user to amm trade',
    'withdraw',
    'deposit',
    'cash to charity transfer',
    'inject amm liquidity',
    'mint cert',
    'mana deposit',
    'tip',
    'return bank funds'
);

CREATE OR REPLACE FUNCTION "public"."_transfer_project"("project_id" "uuid", "to_id" "uuid", "transfer_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  UPDATE projects
  SET creator=to_id
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."_transfer_project"("project_id" "uuid", "to_id" "uuid", "from_id" "uuid", "transfer_id" "uuid", "amount" double precision) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  UPDATE projects
  SET creator=to_id
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."_transfer_project"("project_id" "uuid", "to_id" "uuid", "from_id" "uuid", "transfer_id" "uuid", "amount" double precision, "txn_id" "uuid", "donor_comment_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  UPDATE projects
  SET creator=to_id, stage='active'
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;

  INSERT INTO txns (id, from_id, to_id, project, amount, token)
  VALUES (txn_id, from_id, to_id, project_id, amount, 'USD');

  UPDATE comments
  SET txn_id=txn_id
  WHERE id=donor_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."activate_cert"("project_id" "uuid", "project_creator" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      bid_row record;
      bundle_id uuid;
BEGIN
  UPDATE projects
  SET stage = 'active'
  WHERE id = project_id;

  FOR bid_row 
  IN SELECT * FROM public.bids
  WHERE project = project_id AND status = 'pending' AND type = 'assurance buy' LOOP

    bundle_id := gen_random_uuid();

    UPDATE bids
    SET status = 'accepted'
    WHERE id = bid_row.id;

    -- Insert first transaction with shared UUID in bundle column
    INSERT INTO txns (from_id, to_id, project, amount, token, bundle, type)
    VALUES (bid_row.bidder, project_creator, project_id, bid_row.amount, 'USD', bundle_id, 'user to user trade');

    -- Insert second transaction with shared UUID in bundle column
    INSERT INTO txns (from_id, to_id, project, amount, token, bundle, type)
    VALUES (project_creator, bid_row.bidder, project_id, bid_row.amount / bid_row.valuation * 10000000, project_id, bundle_id, 'user to user trade');

  END LOOP;
  
  UPDATE bids
  SET status = 'accepted'
  WHERE project = project_id AND status = 'pending' AND type = 'assurance sell';
END;
$$;

CREATE OR REPLACE FUNCTION "public"."activate_grant"("project_id" "uuid", "project_creator" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      bid_row record;
BEGIN
  UPDATE projects
  SET stage = 'active'
  WHERE id = project_id;

  FOR bid_row 
  IN SELECT * FROM public.bids
  WHERE project = project_id AND status = 'pending' AND type = 'donate' LOOP
    UPDATE bids
    SET status = 'accepted'
    WHERE id = bid_row.id;

    INSERT INTO txns (from_id, to_id, project, amount, token, type)
    VALUES (bid_row.bidder, project_creator, project_id, bid_row.amount, 'USD', 'project donation');
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."add_tags"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      project_row record;
BEGIN
FOR project_row
  IN SELECT * FROM public.projects
  WHERE round = 'Regrants' LOOP
    INSERT INTO project_topics (project_id, topic_title)
    VALUES (project_row.id, 'regrants');
END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."add_topics"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      project_row record;
BEGIN
FOR project_row
  IN SELECT * FROM public.projects
  WHERE round = 'Regrants' LOOP
    INSERT INTO project_topics (project_id, topic_title)
    VALUES (project_row.id, 'regrants');
END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."create_transfer_grant"("project" "public"."project_row", "donor_comment" "public"."comment_row", "project_transfer" "public"."transfer_row", "grant_amount" numeric) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO projects (id, creator, title, blurb, description, min_funding, funding_goal, founder_shares, type, stage, round, slug, approved, signed_agreement, location_description, lobbying)
  VALUES (project.id, project.creator, project.title, project.blurb, project.description, project.min_funding, project.funding_goal, project.founder_shares, project.type, project.stage, project.round, project.slug, null, false, project.location_description, project.lobbying);

  INSERT INTO comments (id, project, commenter, content)
  VALUES (donor_comment.id, donor_comment.project, donor_comment.commenter, donor_comment.content);

  INSERT INTO project_transfers(recipient_email, recipient_name, project_id)
  VALUES (project_transfer.recipient_email, project_transfer.recipient_name, project_transfer.project_id);

  INSERT INTO bids (project, amount, bidder, type, valuation)
  VALUES (project.id, grant_amount, project.creator, 'donate', 0);

  PERFORM follow_project(project.id, project.creator);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."execute_grant_verdict"("approved" boolean, "project_id" "uuid", "project_creator" "uuid", "admin_id" "uuid" DEFAULT NULL::"uuid", "admin_comment_content" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  UPDATE projects
  SET approved = approved
  WHERE id = project_id;

  IF NOT approved THEN
    PERFORM reject_grant(project_id);
  END IF;

  IF admin_comment_content IS NOT NULL THEN
    INSERT INTO comments (commenter, content, project)
    VALUES (admin_id, admin_comment_content, project_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."execute_grant_verdict"("approved" boolean, "project_id" "uuid", "project_creator" "uuid", "admin_id" "uuid" DEFAULT NULL::"uuid", "admin_comment_content" "jsonb" DEFAULT NULL::"jsonb", "public_benefit" "text" DEFAULT NULL::"text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  UPDATE projects
  SET approved = approved, public_benefit = public_benefit
  WHERE id = project_id;

  IF NOT approved THEN
    PERFORM reject_proposal(project_id);
  ELSE
    UPDATE grant_agreements
    SET approved_at = NOW(), approved_by = admin_id
    WHERE project_id = project_id;
  END IF;

  IF admin_comment_content IS NOT NULL THEN
    INSERT INTO comments (commenter, content, project)
    VALUES (admin_id, admin_comment_content, project_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."follow_project"("project_id" "uuid", "follower_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
    INSERT INTO project_follows (project_id, follower_id)
    VALUES (project_id, follower_id);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_user_balances"() RETURNS TABLE("id" integer, "username" "text", "balance" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.username, COALESCE(total_in, 0) - COALESCE(total_out, 0) as balance
  FROM Profiles u
  LEFT JOIN (
    SELECT from_id, SUM(amount) as total_out
    FROM Txns
    WHERE token = 'USD'
    GROUP BY from_id
  ) t_out ON u.id = t_out.from_id
  LEFT JOIN (
    SELECT to_id, SUM(amount) as total_in
    FROM Txns
    WHERE token = 'USD'
    GROUP BY to_id
  ) t_in ON u.id = t_in.to_id
  ORDER BY balance DESC;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."give_grant"("project" "public"."project_row", "donor_comment" "public"."comment_row", "donation" "public"."bid_row") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  INSERT INTO projects (id, creator, title, blurb, description, min_funding, funding_goal, founder_shares, type, stage, round, slug, approved, signed_agreement, location_description, lobbying)
  VALUES (project.id, project.creator, project.title, project.blurb, project.description, project.min_funding, project.funding_goal, project.founder_shares, project.type, project.stage, project.round, project.slug, null, false, project.location_description, project.lobbying);

  INSERT INTO bids (project, amount, bidder, type, valuation)
  VALUES (donation.project, donation.amount, donation.bidder, 'donate', 0);

  INSERT INTO comments (id, project, commenter, content)
  VALUES (donor_comment.id, donor_comment.project, donor_comment.commenter, donor_comment.content);

  PERFORM follow_project(project.id, donor_comment.commenter);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.id);
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."reject_grant"("project_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      bid_row record;
  BEGIN
    FOR bid_row 
    IN SELECT * FROM public.bids
    WHERE project = project_id AND status = 'pending' LOOP
      UPDATE bids
      SET status = 'declined'
      WHERE id = bid_row.id;
    END LOOP;
    UPDATE projects
    SET stage = 'not funded'
    WHERE id = project_id;
  END;
$$;

CREATE OR REPLACE FUNCTION "public"."reject_proposal"("project_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
    DECLARE
      bid_row record;
  BEGIN
    FOR bid_row 
    IN SELECT * FROM public.bids
    WHERE project = project_id AND status = 'pending' LOOP
      UPDATE bids
      SET status = 'declined'
      WHERE id = bid_row.id;
    END LOOP;
    UPDATE projects
    SET stage = 'not funded'
    WHERE id = project_id;
  END;
$$;

CREATE OR REPLACE FUNCTION "public"."toggle_follow"("project_id" "uuid", "follower_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
  IF EXISTS(SELECT * FROM project_follows WHERE project_id = project_id AND follower_id = follower_id) THEN
    PERFORM unfollow_project(project_id, follower_id);
  ELSE
    PERFORM follow_project(project_id, follower_id);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."transfer_project"("project_id" "uuid", "to_id" "uuid", "from_id" "uuid", "transfer_id" "uuid", "amount" double precision) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE projects
  SET creator=to_id
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;

  INSERT INTO txns (from_id, to_id, project, amount, token)
  VALUES (from_id, to_id, project_id, amount, 'USD');
END;
$$;

CREATE OR REPLACE FUNCTION "public"."transfer_project"("project_id" "uuid", "to_id" "uuid", "from_id" "uuid", "transfer_id" "uuid", "amount" double precision, "donor_notes" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE projects
  SET creator=to_id, stage='active'
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;

  INSERT INTO txns (from_id, to_id, project, amount, token, notes)
  VALUES (from_id, to_id, project_id, amount, 'USD', donor_notes);
END;
$$;

CREATE OR REPLACE FUNCTION "public"."transfer_project"("project_id" "uuid", "to_id" "uuid", "from_id" "uuid", "transfer_id" "uuid", "amount" double precision, "donor_comment_id" "uuid", "txn_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE projects
  SET creator=to_id, stage='active'
  WHERE id=project_id;
  
  UPDATE project_transfers
  SET transferred=true
  WHERE id=transfer_id;

  INSERT INTO txns (id, from_id, to_id, project, amount, token)
  VALUES (txn_id, from_id, to_id, project_id, amount, 'USD');

  UPDATE comments
  SET txn_id=txn_id
  WHERE id=donor_comment_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."unfollow_project"("project_id" "uuid", "follower_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
#variable_conflict use_variable
BEGIN
    DELETE FROM project_follows
    WHERE project_id = project_id AND follower_id = follower_id;
END;
$$;

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."bids" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project" "uuid" NOT NULL,
    "bidder" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "valuation" numeric NOT NULL,
    "type" "public"."bid_type" DEFAULT 'buy'::"public"."bid_type" NOT NULL,
    "status" "public"."bid_status" DEFAULT 'pending'::"public"."bid_status" NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."causes" (
    "title" "text" NOT NULL,
    "description" "jsonb",
    "slug" "text" NOT NULL,
    "header_image_url" "text" NOT NULL,
    "open" boolean DEFAULT true NOT NULL,
    "prize" boolean DEFAULT false NOT NULL,
    "sort" real DEFAULT '0'::real NOT NULL,
    "cert_params" "jsonb",
    "project_description_outline" "text",
    "fund_id" "uuid",
    "subtitle" "text"
);

CREATE TABLE IF NOT EXISTS "public"."comment_rxns" (
    "comment_id" "uuid" NOT NULL,
    "reactor_id" "uuid" NOT NULL,
    "reaction" "text" NOT NULL,
    "txn_id" "uuid"
);

CREATE TABLE IF NOT EXISTS "public"."comments" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "commenter" "uuid" NOT NULL,
    "project" "uuid" NOT NULL,
    "content" "jsonb",
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "replying_to" "uuid",
    "special_type" "public"."comment_type",
    "txn_id" "uuid"
);

CREATE TABLE IF NOT EXISTS "public"."grant_agreements" (
    "project_id" "uuid" NOT NULL,
    "lobbying_clause_excluded" boolean DEFAULT false NOT NULL,
    "signed_off_site" boolean DEFAULT false NOT NULL,
    "signed_at" timestamp with time zone,
    "signatory_name" "text",
    "recipient_name" "text",
    "project_title" "text",
    "project_description" "jsonb",
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "completed_at" timestamp with time zone,
    "version" smallint DEFAULT 1
);

CREATE TABLE IF NOT EXISTS "public"."profile_roles" (
    "id" "uuid" NOT NULL,
    "donor" boolean DEFAULT false NOT NULL,
    "organizer" "text",
    "scholar" "text",
    "volunteer" "text",
    "worker" "text",
    "senior" "text",
    "insider" boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."profile_trust" (
    "truster_id" "uuid" NOT NULL,
    "trusted_id" "uuid" NOT NULL,
    "weight" double precision DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "username" "text" NOT NULL,
    "bio" "text" DEFAULT ''::"text" NOT NULL,
    "website" "text",
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "accreditation_status" boolean DEFAULT false NOT NULL,
    "avatar_url" "text",
    "type" "public"."profile_type" DEFAULT 'individual'::"public"."profile_type" NOT NULL,
    "long_description" "jsonb",
    "regranter_status" boolean DEFAULT false NOT NULL,
    "stripe_connect_id" "text"
);

CREATE TABLE IF NOT EXISTS "public"."project_causes" (
    "project_id" "uuid" NOT NULL,
    "cause_slug" "text" NOT NULL,
    "application_stage" "public"."project_stage"
);

COMMENT ON COLUMN "public"."project_causes"."application_stage" IS 'If we''re applying to a fund, what stage is the app in?';

CREATE TABLE IF NOT EXISTS "public"."project_evals" (
    "evaluator_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "score" double precision DEFAULT 0 NOT NULL,
    "confidence" double precision DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."project_follows" (
    "project_id" "uuid" NOT NULL,
    "follower_id" "uuid" NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."project_transfers" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "recipient_email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "transferred" boolean DEFAULT false NOT NULL,
    "recipient_name" "text" DEFAULT ''::"text" NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."project_votes" (
    "id" bigint NOT NULL,
    "voter_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "magnitude" smallint DEFAULT '0'::smallint NOT NULL
);

ALTER TABLE "public"."project_votes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."project_votes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."projects" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "blurb" "text",
    "creator" "uuid" NOT NULL,
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "slug" "text" DEFAULT ''::"text" NOT NULL,
    "min_funding" double precision NOT NULL,
    "founder_shares" bigint NOT NULL,
    "description" "jsonb",
    "stage" "public"."project_stage" DEFAULT 'proposal'::"public"."project_stage" NOT NULL,
    "round" "text" NOT NULL,
    "auction_close" "date",
    "funding_goal" double precision DEFAULT '0'::double precision NOT NULL,
    "type" "public"."project_type" DEFAULT 'grant'::"public"."project_type" NOT NULL,
    "approved" boolean,
    "signed_agreement" boolean DEFAULT false NOT NULL,
    "external_link" "text",
    "public_benefit" "text",
    "location_description" "text",
    "amm_shares" bigint,
    "lobbying" boolean DEFAULT false NOT NULL,
    "markets" "jsonb"
);

COMMENT ON COLUMN "public"."projects"."markets" IS 'Linked Manifold markets';

CREATE TABLE IF NOT EXISTS "public"."rounds" (
    "title" "text" NOT NULL,
    "auction_close_date" "date",
    "proposal_due_date" "date",
    "retro_pool" double precision,
    "description" "jsonb",
    "slug" "text" NOT NULL,
    "header_image_url" "text",
    "eval_date" "date",
    "subtitle" "text"
);

CREATE TABLE IF NOT EXISTS "public"."stripe_txns" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" "text" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "amount" double precision NOT NULL,
    "txn_id" "uuid" NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."txns" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL,
    "from_id" "uuid",
    "to_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "project" "uuid",
    "bundle" "uuid",
    "type" "public"."txn_type",
    "notes" "jsonb"
);

ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."causes"
    ADD CONSTRAINT "causes_pkey" PRIMARY KEY ("slug");

ALTER TABLE ONLY "public"."comment_rxns"
    ADD CONSTRAINT "comment_rxns_pkey" PRIMARY KEY ("comment_id", "reactor_id", "reaction");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."grant_agreements"
    ADD CONSTRAINT "grant_agreements_pkey" PRIMARY KEY ("project_id");

ALTER TABLE ONLY "public"."profile_roles"
    ADD CONSTRAINT "profile_roles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profile_trust"
    ADD CONSTRAINT "profile_trust_pkey" PRIMARY KEY ("truster_id", "trusted_id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."project_causes"
    ADD CONSTRAINT "project_causes_pkey" PRIMARY KEY ("project_id", "cause_slug");

ALTER TABLE ONLY "public"."project_evals"
    ADD CONSTRAINT "project_evals_pkey" PRIMARY KEY ("evaluator_id", "project_id");

ALTER TABLE ONLY "public"."project_follows"
    ADD CONSTRAINT "project_follows_pkey" PRIMARY KEY ("project_id", "follower_id");

ALTER TABLE ONLY "public"."project_transfers"
    ADD CONSTRAINT "project_transfers_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."project_votes"
    ADD CONSTRAINT "project_votes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."rounds"
    ADD CONSTRAINT "rounds_pkey" PRIMARY KEY ("title");

ALTER TABLE ONLY "public"."stripe_txns"
    ADD CONSTRAINT "stripe_txns_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."causes"
    ADD CONSTRAINT "topics_slug_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."txns"
    ADD CONSTRAINT "txns_pkey" PRIMARY KEY ("id");

CREATE INDEX "comments_created_at_desc" ON "public"."comments" USING "btree" ("created_at" DESC);
CREATE INDEX "projects_created_at" ON "public"."projects" USING "btree" ("created_at" DESC);
CREATE INDEX "txns_created_at_desc" ON "public"."txns" USING "btree" ("created_at" DESC);

ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_bidder_fkey" FOREIGN KEY ("bidder") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."bids"
    ADD CONSTRAINT "bids_project_fkey" FOREIGN KEY ("project") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."causes"
    ADD CONSTRAINT "causes_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "public"."profiles"("id") ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE ONLY "public"."comment_rxns"
    ADD CONSTRAINT "comment_rxns_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comment_rxns"
    ADD CONSTRAINT "comment_rxns_reactor_id_fkey" FOREIGN KEY ("reactor_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."comment_rxns"
    ADD CONSTRAINT "comment_rxns_txn_id_fkey" FOREIGN KEY ("txn_id") REFERENCES "public"."txns"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_commenter_fkey" FOREIGN KEY ("commenter") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_project_fkey" FOREIGN KEY ("project") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_replying_to_fkey" FOREIGN KEY ("replying_to") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_txn_id_fkey" FOREIGN KEY ("txn_id") REFERENCES "public"."txns"("id");

ALTER TABLE ONLY "public"."grant_agreements"
    ADD CONSTRAINT "grant_agreements_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."grant_agreements"
    ADD CONSTRAINT "grant_agreements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."profile_roles"
    ADD CONSTRAINT "profile_roles_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."profile_trust"
    ADD CONSTRAINT "profile_trust_trusted_id_fkey" FOREIGN KEY ("trusted_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."profile_trust"
    ADD CONSTRAINT "profile_trust_truster_id_fkey" FOREIGN KEY ("truster_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_causes"
    ADD CONSTRAINT "project_causes_cause_slug_fkey" FOREIGN KEY ("cause_slug") REFERENCES "public"."causes"("slug");

ALTER TABLE ONLY "public"."project_causes"
    ADD CONSTRAINT "project_causes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."project_evals"
    ADD CONSTRAINT "project_evals_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_evals"
    ADD CONSTRAINT "project_evals_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_follows"
    ADD CONSTRAINT "project_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."project_follows"
    ADD CONSTRAINT "project_follows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."project_transfers"
    ADD CONSTRAINT "project_transfers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."project_votes"
    ADD CONSTRAINT "project_votes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."project_votes"
    ADD CONSTRAINT "project_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_creator_fkey" FOREIGN KEY ("creator") REFERENCES "public"."profiles"("id");

COMMENT ON CONSTRAINT "projects_creator_fkey" ON "public"."projects" IS '@foreignKey';

ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_round_fkey" FOREIGN KEY ("round") REFERENCES "public"."rounds"("title");

ALTER TABLE ONLY "public"."stripe_txns"
    ADD CONSTRAINT "stripe_txns_txn_id_fkey" FOREIGN KEY ("txn_id") REFERENCES "public"."txns"("id");

ALTER TABLE ONLY "public"."txns"
    ADD CONSTRAINT "txns_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "public"."profiles"("id");

ALTER TABLE ONLY "public"."txns"
    ADD CONSTRAINT "txns_project_fkey" FOREIGN KEY ("project") REFERENCES "public"."projects"("id");

ALTER TABLE ONLY "public"."txns"
    ADD CONSTRAINT "txns_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "public"."profiles"("id");
