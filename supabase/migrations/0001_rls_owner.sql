-- P0 Security Migration: per-user Row Level Security
--
-- Adds an `owner` column referencing auth.users(id) to the two shared tables,
-- drops the old "Public access" policies that allowed any anon request to read
-- and mutate every row, and installs per-row policies enforcing
-- auth.uid() = owner. Combined with the anthropic-proxy Edge Function this
-- removes unauthenticated access to user data.
--
-- This migration is idempotent: it can be re-applied safely.

BEGIN;

------------------------------------------------------------------------------
-- csc_projects
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csc_projects (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  data        jsonb       NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE csc_projects
  ADD COLUMN IF NOT EXISTS owner uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS csc_projects_owner_idx ON csc_projects(owner);

ALTER TABLE csc_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access"            ON csc_projects;
DROP POLICY IF EXISTS "Public read"              ON csc_projects;
DROP POLICY IF EXISTS "Public write"             ON csc_projects;
DROP POLICY IF EXISTS "csc_projects_owner_sel"   ON csc_projects;
DROP POLICY IF EXISTS "csc_projects_owner_ins"   ON csc_projects;
DROP POLICY IF EXISTS "csc_projects_owner_upd"   ON csc_projects;
DROP POLICY IF EXISTS "csc_projects_owner_del"   ON csc_projects;

CREATE POLICY "csc_projects_owner_sel" ON csc_projects
  FOR SELECT TO authenticated
  USING (auth.uid() = owner);

CREATE POLICY "csc_projects_owner_ins" ON csc_projects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "csc_projects_owner_upd" ON csc_projects
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "csc_projects_owner_del" ON csc_projects
  FOR DELETE TO authenticated
  USING (auth.uid() = owner);

------------------------------------------------------------------------------
-- csc_shared_furniture
------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS csc_shared_furniture (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text        NOT NULL,
  cat         text,
  data        jsonb,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE csc_shared_furniture
  ADD COLUMN IF NOT EXISTS owner uuid REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS csc_shared_furniture_owner_idx ON csc_shared_furniture(owner);

ALTER TABLE csc_shared_furniture ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access"                    ON csc_shared_furniture;
DROP POLICY IF EXISTS "Public read"                      ON csc_shared_furniture;
DROP POLICY IF EXISTS "Public write"                     ON csc_shared_furniture;
DROP POLICY IF EXISTS "csc_shared_furniture_owner_sel"   ON csc_shared_furniture;
DROP POLICY IF EXISTS "csc_shared_furniture_owner_ins"   ON csc_shared_furniture;
DROP POLICY IF EXISTS "csc_shared_furniture_owner_upd"   ON csc_shared_furniture;
DROP POLICY IF EXISTS "csc_shared_furniture_owner_del"   ON csc_shared_furniture;

CREATE POLICY "csc_shared_furniture_owner_sel" ON csc_shared_furniture
  FOR SELECT TO authenticated
  USING (auth.uid() = owner);

CREATE POLICY "csc_shared_furniture_owner_ins" ON csc_shared_furniture
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "csc_shared_furniture_owner_upd" ON csc_shared_furniture
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner)
  WITH CHECK (auth.uid() = owner);

CREATE POLICY "csc_shared_furniture_owner_del" ON csc_shared_furniture
  FOR DELETE TO authenticated
  USING (auth.uid() = owner);

COMMIT;
