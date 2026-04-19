-- Schema cleanup: enforce updated_at on the two shared tables and keep it
-- fresh automatically via a BEFORE UPDATE trigger. The frontend already
-- sorts project lists by `updated_at desc`; without the trigger those
-- timestamps only reflected the first write because no UPDATE path touched
-- the column explicitly.
--
-- Idempotent: re-applying is a no-op.

BEGIN;

------------------------------------------------------------------------------
-- updated_at columns
------------------------------------------------------------------------------

ALTER TABLE csc_projects
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

-- 0001 created csc_projects.updated_at without NOT NULL; enforce it now.
-- Safe under fresh-start assumption (no legacy rows).
ALTER TABLE csc_projects ALTER COLUMN updated_at SET NOT NULL;

ALTER TABLE csc_shared_furniture
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now() NOT NULL;

------------------------------------------------------------------------------
-- shared trigger function
------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

------------------------------------------------------------------------------
-- triggers
------------------------------------------------------------------------------

DROP TRIGGER IF EXISTS csc_projects_set_updated_at ON csc_projects;
CREATE TRIGGER csc_projects_set_updated_at
  BEFORE UPDATE ON csc_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS csc_shared_furniture_set_updated_at ON csc_shared_furniture;
CREATE TRIGGER csc_shared_furniture_set_updated_at
  BEFORE UPDATE ON csc_shared_furniture
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
