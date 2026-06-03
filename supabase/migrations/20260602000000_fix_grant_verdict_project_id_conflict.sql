-- Fix execute_grant_verdict updating approved_at/approved_by on ALL grant_agreements.
--
-- The function declares `#variable_conflict use_variable`, so the unqualified
-- column `project_id` in `WHERE project_id = project_id` resolved to the function
-- PARAMETER on both sides, making the condition always TRUE. Every grant approval
-- therefore re-stamped approved_at = NOW() on every row in grant_agreements, which
-- is why the charity signatory date on /agreement pages always showed the current
-- date. Qualify the column with the table name so it targets the right row.

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
    WHERE grant_agreements.project_id = execute_grant_verdict.project_id;
  END IF;

  IF admin_comment_content IS NOT NULL THEN
    INSERT INTO comments (commenter, content, project)
    VALUES (admin_id, admin_comment_content, project_id);
  END IF;
END;
$$;
