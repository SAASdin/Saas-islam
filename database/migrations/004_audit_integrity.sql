-- ============================================================
-- 004_audit_integrity.sql
-- 🔒 Triggers d'audit + table de hashes d'intégrité
-- Exécuter APRÈS 003_media_zone.sql
-- ============================================================

-- ════════════════════════════════════════════
-- 📋 TABLE D'AUDIT
-- Enregistre toute tentative d'écriture sur la zone sacrée
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.sacred_audit_log (
  id              BIGSERIAL PRIMARY KEY,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  table_name      TEXT NOT NULL,                      -- Table ciblée
  operation       TEXT NOT NULL,                      -- INSERT, UPDATE, DELETE, TRUNCATE
  user_db         TEXT NOT NULL DEFAULT current_user, -- Utilisateur PostgreSQL
  client_ip       INET,                               -- IP du client
  details         JSONB                               -- Données tentées (sans données sensibles)
);
COMMENT ON TABLE app.sacred_audit_log IS '🚨 Log de TOUTES les tentatives d''écriture sur la zone sacrée. NE JAMAIS SUPPRIMER.';

-- Fonction de log pour les tentatives d'écriture sur zone sacrée
CREATE OR REPLACE FUNCTION sacred.log_write_attempt()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO app.sacred_audit_log (table_name, operation, user_db, details)
  VALUES (
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    TG_OP,
    current_user,
    jsonb_build_object(
      'message', '⚠️ Tentative d''écriture sur une table sacrée BLOQUÉE',
      'timestamp', NOW()
    )
  );
  RAISE EXCEPTION 'ÉCRITURE INTERDITE sur la zone sacrée (table: %). Contactez les administrateurs.', TG_TABLE_NAME;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur toutes les tables sacrées principales
CREATE TRIGGER audit_quran_ayahs
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.quran_ayahs
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_quran_surahs
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.quran_surahs
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_quran_translations
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.quran_translations
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_hadiths
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.hadiths
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_duas
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.duas
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_allah_names
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.allah_names
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_mutun
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.mutun
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_mutun_lines
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.mutun_lines
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

CREATE TRIGGER audit_reference_books
  BEFORE INSERT OR UPDATE OR DELETE ON sacred.reference_books
  FOR EACH ROW EXECUTE FUNCTION sacred.log_write_attempt();

-- ════════════════════════════════════════════
-- 🔐 TABLE DE HASHES D'INTÉGRITÉ
-- SHA-256 de chaque table sacrée après import initial
-- Vérifié à chaque CI/CD
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.integrity_hashes (
  id              SERIAL PRIMARY KEY,
  table_name      TEXT NOT NULL,                      -- 'sacred.quran_ayahs'
  row_count       INT NOT NULL,                       -- Nombre de lignes
  hash_sha256     TEXT NOT NULL,                      -- Hash SHA-256 du contenu
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  computed_by     TEXT NOT NULL DEFAULT current_user,
  import_version  TEXT NOT NULL,                      -- Version de l'import (ex: 'tanzil-v1')
  notes           TEXT
);
COMMENT ON TABLE app.integrity_hashes IS '🔐 Hashes SHA-256 des tables sacrées. Généré après chaque import. Vérifié au CI/CD.';

-- ════════════════════════════════════════════
-- ⏰ FONCTIONS UTILITAIRES
-- ════════════════════════════════════════════

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer sur les tables qui ont un champ updated_at
CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON app.users
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_settings
  BEFORE UPDATE ON app.user_settings
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_posts
  BEFORE UPDATE ON app.social_posts
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_notes
  BEFORE UPDATE ON app.user_notes
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

CREATE TRIGGER set_updated_at_courses
  BEFORE UPDATE ON app.academy_courses
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();
