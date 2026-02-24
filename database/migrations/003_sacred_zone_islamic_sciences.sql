-- ============================================================
-- 003_sacred_zone_islamic_sciences.sql
-- 🔒 ZONE SACRÉE — SCIENCES ISLAMIQUES
-- Duas, Noms d'Allah, Mutun, Seerah, Calendrier Hijri
-- ⚠️ CES TABLES SONT IMMUABLES — AUCUN UPDATE/DELETE AUTORISÉ
-- ============================================================

-- ── Invocations (Duas) ───────────────────────────────────
CREATE TABLE dua_categories (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  name_english    TEXT NOT NULL
);

CREATE TABLE duas (
  id              SERIAL PRIMARY KEY,
  category_id     INTEGER REFERENCES dua_categories(id),
  title_arabic    TEXT NOT NULL,
  title_french    TEXT NOT NULL,
  text_arabic     TEXT NOT NULL,                 -- Texte arabe de la dua
  transliteration TEXT,                          -- Translittération phonétique
  translation_fr  TEXT NOT NULL,
  translation_en  TEXT,
  source          TEXT,                          -- Référence (Coran, hadith...)
  occasion        TEXT                           -- Quand la réciter
);

-- ── 99 Noms d'Allah ──────────────────────────────────────
CREATE TABLE allah_names (
  id              SMALLINT PRIMARY KEY,          -- 1 à 99
  name_arabic     TEXT NOT NULL,                 -- الاسم بالعربية
  transliteration TEXT NOT NULL,                 -- Al-Rahman, etc.
  meaning_fr      TEXT NOT NULL,
  meaning_en      TEXT NOT NULL,
  explanation_fr  TEXT,                          -- Explication approfondie
  quran_reference TEXT                           -- Sourate + verset si applicable
);

-- ── Mutun (textes de mémorisation) ───────────────────────
CREATE TABLE mutun_categories (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,                 -- 'Grammaire', 'Fiqh', 'Aqida'...
  name_english    TEXT NOT NULL
);

CREATE TABLE mutun (
  id              SERIAL PRIMARY KEY,
  category_id     INTEGER NOT NULL REFERENCES mutun_categories(id),
  title_arabic    TEXT NOT NULL,
  title_french    TEXT NOT NULL,
  author          TEXT NOT NULL,                 -- Ibn Ajurrum, Ibn Malik, etc.
  era             TEXT,                          -- Époque de l'auteur
  total_lines     INTEGER,
  difficulty      SMALLINT                       -- 1 (facile) à 5 (avancé)
                  CHECK (difficulty BETWEEN 1 AND 5)
);

CREATE TABLE mutun_lines (
  id              SERIAL PRIMARY KEY,
  matn_id         INTEGER NOT NULL REFERENCES mutun(id),
  line_number     INTEGER NOT NULL,
  text_arabic     TEXT NOT NULL,                 -- Texte arabe du vers
  translation_fr  TEXT,
  notes           TEXT,
  UNIQUE (matn_id, line_number)
);

-- ── Savants ──────────────────────────────────────────────
CREATE TABLE scholars (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  birth_year_hijri SMALLINT,
  death_year_hijri SMALLINT,
  specialization  TEXT[],                        -- ['fiqh', 'hadith', 'tafsir', ...]
  biography_fr    TEXT,
  biography_ar    TEXT
);

-- ── Prophètes ────────────────────────────────────────────
CREATE TABLE prophets (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  order_mentioned SMALLINT,                      -- Ordre de mention dans le Coran
  quran_mentions  INTEGER,                       -- Nombre de mentions dans le Coran
  story_fr        TEXT
);

-- ── Calendrier islamique ─────────────────────────────────
CREATE TABLE islamic_calendar (
  id              SERIAL PRIMARY KEY,
  event_name_ar   TEXT NOT NULL,
  event_name_fr   TEXT NOT NULL,
  hijri_month     SMALLINT NOT NULL CHECK (hijri_month BETWEEN 1 AND 12),
  hijri_day       SMALLINT NOT NULL CHECK (hijri_day BETWEEN 1 AND 30),
  description_fr  TEXT,
  is_recurring    BOOLEAN NOT NULL DEFAULT TRUE  -- Événement annuel récurrent
);

-- ── Livres de référence ───────────────────────────────────
CREATE TABLE reference_books (
  id              SERIAL PRIMARY KEY,
  title_arabic    TEXT NOT NULL,
  title_french    TEXT NOT NULL,
  author_id       INTEGER REFERENCES scholars(id),
  domain          TEXT NOT NULL                  -- 'fiqh', 'aqida', 'tafsir', 'hadith', 'nahw', 'seerah'
                  CHECK (domain IN ('fiqh', 'aqida', 'tafsir', 'hadith', 'nahw', 'seerah', 'tasawwuf', 'usul_al_fiqh', 'other')),
  difficulty      SMALLINT CHECK (difficulty BETWEEN 1 AND 5),
  description_fr  TEXT
);

CREATE TABLE book_chapters (
  id              SERIAL PRIMARY KEY,
  book_id         INTEGER NOT NULL REFERENCES reference_books(id),
  chapter_number  INTEGER NOT NULL,
  title_arabic    TEXT,
  title_french    TEXT,
  UNIQUE (book_id, chapter_number)
);

CREATE TABLE book_content (
  id              SERIAL PRIMARY KEY,
  chapter_id      INTEGER NOT NULL REFERENCES book_chapters(id),
  paragraph_number INTEGER NOT NULL,
  text_arabic     TEXT NOT NULL,
  translation_fr  TEXT,
  UNIQUE (chapter_id, paragraph_number)
);

COMMENT ON TABLE duas IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE allah_names IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE mutun IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE mutun_lines IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE scholars IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE prophets IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE islamic_calendar IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE reference_books IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE book_content IS '🔒 ZONE SACRÉE — LECTURE SEULE';
