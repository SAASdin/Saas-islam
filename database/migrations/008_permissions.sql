-- ============================================================
-- 008_permissions.sql
-- 🔒 CONFIGURATION DES DROITS SQL
-- app_user = SELECT UNIQUEMENT sur la zone sacrée
-- app_user = SELECT / INSERT / UPDATE / DELETE sur la zone applicative
-- ============================================================

-- ════════════════════════════════════════════════
-- 🔒 ZONE SACRÉE — SELECT UNIQUEMENT
-- ════════════════════════════════════════════════

-- Retirer TOUS les droits sur les tables sacrées
REVOKE ALL PRIVILEGES ON TABLE quran_surahs FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE quran_ayahs FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE quran_translations FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE quran_tafsirs FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE quran_word_by_word FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE quran_tajweed_rules FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE audio_recitations FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE reciters FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadith_collections FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadiths FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadith_translations FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadith_gradings FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadith_categories FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE hadith_category_links FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE dua_categories FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE duas FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE allah_names FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE mutun_categories FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE mutun FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE mutun_lines FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE scholars FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE prophets FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE islamic_calendar FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE reference_books FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE book_chapters FROM app_user;
REVOKE ALL PRIVILEGES ON TABLE book_content FROM app_user;

-- Accorder uniquement SELECT
GRANT SELECT ON TABLE quran_surahs TO app_user;
GRANT SELECT ON TABLE quran_ayahs TO app_user;
GRANT SELECT ON TABLE quran_translations TO app_user;
GRANT SELECT ON TABLE quran_tafsirs TO app_user;
GRANT SELECT ON TABLE quran_word_by_word TO app_user;
GRANT SELECT ON TABLE quran_tajweed_rules TO app_user;
GRANT SELECT ON TABLE audio_recitations TO app_user;
GRANT SELECT ON TABLE reciters TO app_user;
GRANT SELECT ON TABLE hadith_collections TO app_user;
GRANT SELECT ON TABLE hadiths TO app_user;
GRANT SELECT ON TABLE hadith_translations TO app_user;
GRANT SELECT ON TABLE hadith_gradings TO app_user;
GRANT SELECT ON TABLE hadith_categories TO app_user;
GRANT SELECT ON TABLE hadith_category_links TO app_user;
GRANT SELECT ON TABLE dua_categories TO app_user;
GRANT SELECT ON TABLE duas TO app_user;
GRANT SELECT ON TABLE allah_names TO app_user;
GRANT SELECT ON TABLE mutun_categories TO app_user;
GRANT SELECT ON TABLE mutun FROM app_user;
GRANT SELECT ON TABLE mutun_lines TO app_user;
GRANT SELECT ON TABLE scholars TO app_user;
GRANT SELECT ON TABLE prophets TO app_user;
GRANT SELECT ON TABLE islamic_calendar TO app_user;
GRANT SELECT ON TABLE reference_books TO app_user;
GRANT SELECT ON TABLE book_chapters TO app_user;
GRANT SELECT ON TABLE book_content TO app_user;

-- ════════════════════════════════════════════════
-- 🔓 ZONE APPLICATIVE — DROITS COMPLETS
-- ════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_settings TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_bookmarks TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_favorites TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_notes TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_reading_progress TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_quran_memorization TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_mutun_memorization TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_streaks TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_badges TO app_user;
GRANT SELECT ON TABLE badges TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE subscriptions TO app_user;
GRANT SELECT, INSERT ON TABLE payments TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE social_follows TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE social_posts TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE social_comments TO app_user;
GRANT SELECT, INSERT, DELETE ON TABLE social_reactions TO app_user;
GRANT SELECT, INSERT ON TABLE social_reports TO app_user;
GRANT SELECT ON TABLE academy_courses TO app_user;
GRANT SELECT ON TABLE academy_lessons TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE academy_enrollments TO app_user;
GRANT SELECT, INSERT, UPDATE ON TABLE academy_lesson_progress TO app_user;
GRANT SELECT, INSERT ON TABLE academy_assignments TO app_user;

-- ════════════════════════════════════════════════
-- 🎬 ZONE MÉDIA — SELECT pour app_user
-- ════════════════════════════════════════════════

GRANT SELECT ON TABLE youtube_channels TO app_user;
GRANT SELECT ON TABLE youtube_playlists TO app_user;
GRANT SELECT ON TABLE youtube_videos TO app_user;
GRANT SELECT ON TABLE translated_videos TO app_user;
GRANT SELECT ON TABLE videos TO app_user;

-- Séquences (nécessaires pour les SERIAL / auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ════════════════════════════════════════════════
-- AUDIT LOG — Toute tentative d'écriture sur zone sacrée
-- ════════════════════════════════════════════════

CREATE TABLE audit_sacred_zone (
  id              BIGSERIAL PRIMARY KEY,
  attempted_at    TIMESTAMPTZ DEFAULT NOW(),
  table_name      TEXT NOT NULL,
  operation       TEXT NOT NULL,                 -- INSERT, UPDATE, DELETE
  attempted_by    TEXT DEFAULT current_user,
  details         TEXT
);

-- Trigger sur quran_ayahs (exemple — à dupliquer sur chaque table sacrée)
CREATE OR REPLACE FUNCTION fn_audit_sacred_zone()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_sacred_zone (table_name, operation, details)
  VALUES (TG_TABLE_NAME, TG_OP, 'Tentative bloquée — zone sacrée immuable');
  RAISE EXCEPTION '🔒 INTERDIT — La table % est sacrée et immuable.', TG_TABLE_NAME;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_protect_quran_ayahs
  BEFORE INSERT OR UPDATE OR DELETE ON quran_ayahs
  FOR EACH ROW EXECUTE FUNCTION fn_audit_sacred_zone();

CREATE TRIGGER trg_protect_hadiths
  BEFORE INSERT OR UPDATE OR DELETE ON hadiths
  FOR EACH ROW EXECUTE FUNCTION fn_audit_sacred_zone();

CREATE TRIGGER trg_protect_mutun_lines
  BEFORE INSERT OR UPDATE OR DELETE ON mutun_lines
  FOR EACH ROW EXECUTE FUNCTION fn_audit_sacred_zone();
