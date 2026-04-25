-- v2.6.4 hotfix: csc_projects sendet im POST-Body ein `thumbnail`-Feld
-- (data-URL JPEG vom Top-View-Render), aber die Spalte existiert in der
-- Production-DB nicht. PostgREST lehnt mit PGRST204 (Column not found in
-- schema cache) und HTTP 400 ab. Fix: Spalte idempotent ergänzen,
-- Schema-Cache reloaden.
--
-- Defensiv ergänzen wir in dieser Migration auch `author text` falls es
-- via Drift in Production hängt — IF NOT EXISTS macht es No-Op falls
-- vorhanden.

BEGIN;

ALTER TABLE csc_projects ADD COLUMN IF NOT EXISTS thumbnail text;
ALTER TABLE csc_projects ADD COLUMN IF NOT EXISTS author    text;

COMMIT;

NOTIFY pgrst, 'reload schema';
