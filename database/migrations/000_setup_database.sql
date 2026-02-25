-- ============================================================
-- 000_setup_database.sql
-- Setup initial de la base de données Saas-islam
-- Encodage UTF-8 obligatoire pour le texte arabe
-- ============================================================

-- Créer la base de données (à exécuter en tant que superuser)
-- CREATE DATABASE saas_islam
--   ENCODING 'UTF8'
--   LC_COLLATE 'und-x-icu'
--   LC_CTYPE 'und-x-icu'
--   TEMPLATE template0;

-- Créer les rôles
-- L'utilisateur applicatif : accès limité (SELECT sur zone sacrée, tout sur zone applicative)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user LOGIN PASSWORD 'CHANGE_ME_IN_ENV';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'admin_user') THEN
    CREATE ROLE admin_user LOGIN PASSWORD 'CHANGE_ME_IN_ENV' SUPERUSER;
  END IF;
END $$;

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID pour les IDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Recherche full-text arabe
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Recherche sans accents

-- Schémas logiques (pour organiser les tables par zone)
CREATE SCHEMA IF NOT EXISTS sacred;    -- Zone sacrée (lecture seule)
CREATE SCHEMA IF NOT EXISTS app;       -- Zone applicative (lecture/écriture)
CREATE SCHEMA IF NOT EXISTS media;     -- Zone média (gérée par admin)

-- Commenter les schémas
COMMENT ON SCHEMA sacred IS '🔒 Zone sacrée — données islamiques immuables. SELECT uniquement pour app_user.';
COMMENT ON SCHEMA app    IS '🔓 Zone applicative — données utilisateurs. Lecture/écriture pour app_user.';
COMMENT ON SCHEMA media  IS '🎬 Zone média — vidéos, audio, récitations. Gérée par admin.';
