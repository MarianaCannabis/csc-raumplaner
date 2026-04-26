-- KCanG-Antrag-Wizard: Cloud-sync für gespeicherte Anträge.
--
-- Default ist localStorage; Cloud-Sync ist opt-in über UI-Toggle.
-- Daten sind sensibel (Mitgliederzahl, Personen-Namen, Vereinsadresse),
-- deshalb per-User-RLS, eigene owner-Spalte.
--
-- Idempotent: alle Statements mit IF NOT EXISTS / DROP POLICY IF EXISTS /
-- CREATE OR REPLACE / DROP TRIGGER IF EXISTS. Doppeltes Apply harmlos.
--
-- Reused functions:
--   - set_updated_at() — aus Migration 0002
--   - inc_version_on_update() — aus Migration 0009

BEGIN;

CREATE TABLE IF NOT EXISTS csc_kcang_applications (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  owner       uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,                  -- z.B. "Antrag CSC Köln"
  data        jsonb       NOT NULL,                  -- der gesamte Wizard-State
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  version     integer     NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS csc_kcang_applications_owner_idx
  ON csc_kcang_applications(owner);

ALTER TABLE csc_kcang_applications ENABLE ROW LEVEL SECURITY;

-- ── RLS-Policies ──────────────────────────────────────────
DROP POLICY IF EXISTS "csc_kcang_applications_owner_sel" ON csc_kcang_applications;
DROP POLICY IF EXISTS "csc_kcang_applications_owner_ins" ON csc_kcang_applications;
DROP POLICY IF EXISTS "csc_kcang_applications_owner_upd" ON csc_kcang_applications;
DROP POLICY IF EXISTS "csc_kcang_applications_owner_del" ON csc_kcang_applications;

CREATE POLICY "csc_kcang_applications_owner_sel" ON csc_kcang_applications
  FOR SELECT TO authenticated USING (auth.uid() = owner);
CREATE POLICY "csc_kcang_applications_owner_ins" ON csc_kcang_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner);
CREATE POLICY "csc_kcang_applications_owner_upd" ON csc_kcang_applications
  FOR UPDATE TO authenticated USING (auth.uid() = owner) WITH CHECK (auth.uid() = owner);
CREATE POLICY "csc_kcang_applications_owner_del" ON csc_kcang_applications
  FOR DELETE TO authenticated USING (auth.uid() = owner);

-- ── Triggers (reuse aus 0002 + 0009) ──────────────────────
DROP TRIGGER IF EXISTS csc_kcang_applications_set_updated_at ON csc_kcang_applications;
CREATE TRIGGER csc_kcang_applications_set_updated_at
  BEFORE UPDATE ON csc_kcang_applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS csc_kcang_applications_inc_version ON csc_kcang_applications;
CREATE TRIGGER csc_kcang_applications_inc_version
  BEFORE UPDATE ON csc_kcang_applications
  FOR EACH ROW EXECUTE FUNCTION inc_version_on_update();

COMMIT;

NOTIFY pgrst, 'reload schema';
