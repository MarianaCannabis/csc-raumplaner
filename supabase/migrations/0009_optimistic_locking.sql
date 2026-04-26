-- Konflikt-Resolution für Cloud-Saves: Optimistic Locking via Version-Counter.
--
-- Bei jedem UPDATE auf csc_projects + csc_user_templates wird `version`
-- automatisch incrementiert. Frontend sendet bei PATCH die alte Version
-- mit (?version=eq.X). Wenn nicht mehr aktuell → 0 rows updated, Frontend
-- erkennt Konflikt + zeigt Diff-Modal.
--
-- Idempotent: alle Statements mit IF NOT EXISTS / DROP TRIGGER IF EXISTS /
-- CREATE OR REPLACE FUNCTION. Doppeltes Apply ist harmlos.
--
-- Tabellen-Coverage: csc_projects (0001) + csc_user_templates (0004).
-- csc_versions wurde nie als Tabelle angelegt — nur als localStorage-Bridge
-- in src/persist/versionHistory.ts (P-TrackA). Daher hier nicht enthalten;
-- falls die Tabelle in Zukunft serverseitig kommt, einen analogen Block
-- anhängen.

BEGIN;

-- ── csc_projects ───────────────────────────────────────────
ALTER TABLE csc_projects
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS csc_projects_version_idx
  ON csc_projects(id, version);

-- ── csc_user_templates ─────────────────────────────────────
ALTER TABLE csc_user_templates
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS csc_user_templates_version_idx
  ON csc_user_templates(id, version);

-- ── Trigger-Function ──────────────────────────────────────
CREATE OR REPLACE FUNCTION inc_version_on_update() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.version = COALESCE(OLD.version, 1) + 1;
  RETURN NEW;
END;
$$;

-- ── Trigger pro Tabelle (idempotent: drop + create) ────────
DROP TRIGGER IF EXISTS csc_projects_inc_version ON csc_projects;
CREATE TRIGGER csc_projects_inc_version
  BEFORE UPDATE ON csc_projects
  FOR EACH ROW EXECUTE FUNCTION inc_version_on_update();

DROP TRIGGER IF EXISTS csc_user_templates_inc_version ON csc_user_templates;
CREATE TRIGGER csc_user_templates_inc_version
  BEFORE UPDATE ON csc_user_templates
  FOR EACH ROW EXECUTE FUNCTION inc_version_on_update();

COMMIT;

-- PostgREST muss das neue Schema-Cache laden, damit `?select=version` und
-- `?version=eq.X` direkt nach Apply funktionieren.
NOTIFY pgrst, 'reload schema';
