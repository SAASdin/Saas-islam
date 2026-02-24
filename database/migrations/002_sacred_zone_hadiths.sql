-- ============================================================
-- 002_sacred_zone_hadiths.sql
-- 🔒 ZONE SACRÉE — HADITHS
-- ⚠️ CES TABLES SONT IMMUABLES — AUCUN UPDATE/DELETE AUTORISÉ
-- ============================================================

-- ── Collections de hadiths ────────────────────────────────
CREATE TABLE hadith_collections (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,                 -- اسم المجموعة
  name_english    TEXT NOT NULL,                 -- Sahih al-Bukhari, etc.
  name_french     TEXT NOT NULL,
  author          TEXT NOT NULL,                 -- Imam Al-Bukhari, etc.
  total_hadiths   INTEGER NOT NULL
);

-- ── Hadiths ──────────────────────────────────────────────
CREATE TABLE hadiths (
  id              SERIAL PRIMARY KEY,
  collection_id   INTEGER NOT NULL REFERENCES hadith_collections(id),
  hadith_number   TEXT NOT NULL,                 -- Numéro dans la collection
  chapter_number  INTEGER,
  chapter_title   TEXT,
  text_arabic     TEXT NOT NULL,                 -- Texte arabe complet (matn)
  narrator_chain  TEXT,                          -- Chaîne de transmission (isnad)
  UNIQUE (collection_id, hadith_number)
);

-- ── Traductions des hadiths ───────────────────────────────
CREATE TABLE hadith_translations (
  id              SERIAL PRIMARY KEY,
  hadith_id       INTEGER NOT NULL REFERENCES hadiths(id),
  language_code   VARCHAR(5) NOT NULL,
  text            TEXT NOT NULL,
  UNIQUE (hadith_id, language_code)
);

-- ── Classifications ───────────────────────────────────────
CREATE TABLE hadith_gradings (
  id              SERIAL PRIMARY KEY,
  hadith_id       INTEGER NOT NULL REFERENCES hadiths(id),
  scholar         TEXT NOT NULL,                 -- 'al-albani', 'ibn-hajar', etc.
  grade           TEXT NOT NULL                  -- 'sahih', 'hassan', 'daif', etc.
                  CHECK (grade IN ('sahih', 'hassan', 'daif', 'mawdu', 'hasan_sahih', 'sahih_li_ghayrihi', 'hasan_li_ghayrihi')),
  notes           TEXT,
  UNIQUE (hadith_id, scholar)
);

-- ── Catégories thématiques ────────────────────────────────
CREATE TABLE hadith_categories (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  name_english    TEXT NOT NULL
);

CREATE TABLE hadith_category_links (
  hadith_id       INTEGER NOT NULL REFERENCES hadiths(id),
  category_id     INTEGER NOT NULL REFERENCES hadith_categories(id),
  PRIMARY KEY (hadith_id, category_id)
);

COMMENT ON TABLE hadith_collections IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE hadiths IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE hadith_translations IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE hadith_gradings IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE hadith_categories IS '🔒 ZONE SACRÉE — LECTURE SEULE';
