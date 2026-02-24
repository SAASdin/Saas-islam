-- ============================================================
-- 000_create_database.sql
-- Création de la base de données avec encodage UTF-8 obligatoire
-- (à exécuter en tant que superuser PostgreSQL)
-- ============================================================

CREATE DATABASE saas_islam
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8'
  TEMPLATE template0;

-- Créer l'utilisateur applicatif (droits limités)
CREATE USER app_user WITH PASSWORD 'CHANGE_ME_IN_ENV';

-- Connexion à la base
\connect saas_islam;

-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUIDs automatiques
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- Recherche sans accents
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Recherche floue
