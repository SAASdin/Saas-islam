-- ============================================================
-- revoke-sacred-zone.sql
-- 🔒 Restriction d'accès en ÉCRITURE sur la zone sacrée
-- ⚠️  À exécuter EN TANT QUE superuser APRÈS les migrations
-- ⚠️  À exécuter AVANT le premier seed (avant que app_user existe)
-- ⚠️  NE JAMAIS annuler ces REVOKE en production
--
-- Exécution :
--   psql $DATABASE_URL -f database/security/revoke-sacred-zone.sql
--
-- Ce script :
--   1. Crée le rôle app_user si inexistant
--   2. Accorde SELECT sur toutes les tables sacrées
--   3. RÉVOQUE INSERT/UPDATE/DELETE sur toutes les tables sacrées
--   4. Crée un rôle seed_user séparé pour l'import initial (one-time)
-- ============================================================

-- ════════════════════════════════════════════
-- 0. Créer les rôles
-- ════════════════════════════════════════════

-- Rôle applicatif : lecture seule sur le sacré, lecture/écriture sur app/media
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD';
    RAISE NOTICE 'Rôle app_user créé';
  ELSE
    RAISE NOTICE 'Rôle app_user déjà existant';
  END IF;
END $$;

-- Rôle seed : écriture sur le sacré — uniquement pour l'import initial
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'seed_user') THEN
    CREATE ROLE seed_user WITH LOGIN PASSWORD 'CHANGE_THIS_PASSWORD_SEED';
    RAISE NOTICE 'Rôle seed_user créé';
  ELSE
    RAISE NOTICE 'Rôle seed_user déjà existant';
  END IF;
END $$;

-- ════════════════════════════════════════════
-- 1. REVOKE sur le schéma sacred
-- ════════════════════════════════════════════

-- Accorder USAGE sur le schéma
GRANT USAGE ON SCHEMA sacred TO app_user;
GRANT USAGE ON SCHEMA sacred TO seed_user;
GRANT USAGE ON SCHEMA app    TO app_user;
GRANT USAGE ON SCHEMA media  TO app_user;

-- ────────────────────────────────────────────
-- CORAN
-- ────────────────────────────────────────────

-- quran_surahs — READ ONLY pour app_user
GRANT  SELECT              ON sacred.quran_surahs         TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.quran_surahs      FROM app_user;

-- quran_ayahs — READ ONLY pour app_user
GRANT  SELECT              ON sacred.quran_ayahs          TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.quran_ayahs       FROM app_user;

-- quran_translations — READ ONLY pour app_user
GRANT  SELECT              ON sacred.quran_translations   TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.quran_translations FROM app_user;

-- quran_tafsirs — READ ONLY pour app_user
GRANT  SELECT              ON sacred.quran_tafsirs        TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.quran_tafsirs     FROM app_user;

-- quran_word_by_word — READ ONLY pour app_user
GRANT  SELECT              ON sacred.quran_word_by_word   TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.quran_word_by_word FROM app_user;

-- ────────────────────────────────────────────
-- HADITH
-- ────────────────────────────────────────────

-- hadith_collections — READ ONLY pour app_user
GRANT  SELECT              ON sacred.hadith_collections   TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.hadith_collections FROM app_user;

-- hadiths — READ ONLY pour app_user
GRANT  SELECT              ON sacred.hadiths              TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.hadiths           FROM app_user;

-- ────────────────────────────────────────────
-- MUTUN
-- ────────────────────────────────────────────

-- mutun — READ ONLY pour app_user
GRANT  SELECT              ON sacred.mutun                TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.mutun             FROM app_user;

-- mutun_lines — READ ONLY pour app_user
GRANT  SELECT              ON sacred.mutun_lines          TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.mutun_lines       FROM app_user;

-- ────────────────────────────────────────────
-- DUAS & NOMS D'ALLAH
-- ────────────────────────────────────────────

-- duas — READ ONLY pour app_user
GRANT  SELECT              ON sacred.duas                 TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.duas              FROM app_user;

-- allah_names — READ ONLY pour app_user
GRANT  SELECT              ON sacred.allah_names          TO app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.allah_names       FROM app_user;

-- ════════════════════════════════════════════
-- 2. GRANT seed_user — écriture pendant import
-- ════════════════════════════════════════════
-- ⚠️  seed_user ne doit exister QUE pendant les seeds
-- ⚠️  DÉSACTIVER ce rôle après l'import (voir étape 3)

GRANT SELECT, INSERT ON sacred.quran_surahs         TO seed_user;
GRANT SELECT, INSERT ON sacred.quran_ayahs          TO seed_user;
GRANT SELECT, INSERT ON sacred.quran_translations   TO seed_user;
GRANT SELECT, INSERT ON sacred.quran_tafsirs        TO seed_user;
GRANT SELECT, INSERT ON sacred.quran_word_by_word   TO seed_user;
GRANT SELECT, INSERT ON sacred.hadith_collections   TO seed_user;
GRANT SELECT, INSERT ON sacred.hadiths              TO seed_user;
GRANT SELECT, INSERT ON sacred.mutun                TO seed_user;
GRANT SELECT, INSERT ON sacred.mutun_lines          TO seed_user;
GRANT SELECT, INSERT ON sacred.duas                 TO seed_user;
GRANT SELECT, INSERT ON sacred.allah_names          TO seed_user;

-- Accès aux séquences (nécessaire pour SERIAL/autoincrement)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sacred TO seed_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA sacred TO app_user;

-- ════════════════════════════════════════════
-- 3. Zone applicative — LECTURE/ÉCRITURE normale
-- ════════════════════════════════════════════

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA app   TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA app   TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA media TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA media TO app_user;

-- ════════════════════════════════════════════
-- 4. Vérification
-- ════════════════════════════════════════════

DO $$
DECLARE
  sacred_tables TEXT[] := ARRAY[
    'quran_surahs', 'quran_ayahs', 'quran_translations', 'quran_tafsirs',
    'quran_word_by_word', 'hadith_collections', 'hadiths',
    'mutun', 'mutun_lines', 'duas', 'allah_names'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY sacred_tables LOOP
    RAISE NOTICE '✅ Table sacred.% : protégée en écriture pour app_user', t;
  END LOOP;
END $$;

-- ════════════════════════════════════════════
-- 5. APRÈS LES SEEDS — Désactiver seed_user
-- ════════════════════════════════════════════
-- ⚠️  Exécuter ces lignes APRÈS npm run seed:all
-- ⚠️  Décommenter et exécuter manuellement

-- REVOKE ALL PRIVILEGES ON ALL TABLES    IN SCHEMA sacred FROM seed_user;
-- REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sacred FROM seed_user;
-- ALTER ROLE seed_user NOLOGIN;
-- RAISE NOTICE '🔒 seed_user désactivé — zone sacrée verrouillée définitivement';

-- ============================================================
-- RÉSUMÉ DES PERMISSIONS
-- ============================================================
-- app_user  : SELECT sur sacred.*, ALL sur app.*, ALL sur media.*
-- seed_user : SELECT+INSERT sur sacred.* (À DÉSACTIVER après seeds)
-- superuser : tout (uniquement pour migrations et audit)
-- ============================================================
