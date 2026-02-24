-- ============================================================
-- 001_sacred_zone_quran.sql
-- 🔒 ZONE SACRÉE — CORAN
-- ⚠️ CES TABLES SONT IMMUABLES — AUCUN UPDATE/DELETE AUTORISÉ
-- ============================================================

-- ── Sourates ──────────────────────────────────────────────
CREATE TABLE quran_surahs (
  id              SMALLINT PRIMARY KEY,         -- Numéro sourate (1-114)
  name_arabic     TEXT NOT NULL,                -- اسم السورة بالعربية
  name_english    TEXT NOT NULL,                -- Nom translittéré
  name_french     TEXT NOT NULL,                -- Nom en français
  revelation_type TEXT NOT NULL                 -- 'meccan' ou 'medinan'
                  CHECK (revelation_type IN ('meccan', 'medinan')),
  ayah_count      SMALLINT NOT NULL,            -- Nombre de versets
  has_bismillah   BOOLEAN NOT NULL DEFAULT TRUE -- FALSE pour At-Tawbah (9)
);

-- ── Versets ───────────────────────────────────────────────
CREATE TABLE quran_ayahs (
  id              INTEGER PRIMARY KEY,           -- ID unique global
  surah_number    SMALLINT NOT NULL REFERENCES quran_surahs(id),
  ayah_number     SMALLINT NOT NULL,             -- Numéro dans la sourate
  text_uthmani    TEXT NOT NULL,                 -- Texte arabe (Mushaf Hafs)
  text_simple     TEXT NOT NULL,                 -- Texte arabe simplifié (sans tashkeel)
  juz             SMALLINT NOT NULL,             -- Juz (1-30)
  hizb            SMALLINT NOT NULL,             -- Hizb
  rub_el_hizb     SMALLINT NOT NULL,             -- Rub' el-Hizb
  sajdah          BOOLEAN NOT NULL DEFAULT FALSE,-- Verset de prosternation
  UNIQUE (surah_number, ayah_number)
);

-- ── Traductions ───────────────────────────────────────────
CREATE TABLE quran_translations (
  id              SERIAL PRIMARY KEY,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  language_code   VARCHAR(5) NOT NULL,           -- 'fr', 'en', 'de', etc.
  translator      TEXT NOT NULL,                 -- Nom du traducteur
  text            TEXT NOT NULL,                 -- Texte traduit
  UNIQUE (ayah_id, language_code, translator)
);

-- ── Tafsirs ──────────────────────────────────────────────
CREATE TABLE quran_tafsirs (
  id              SERIAL PRIMARY KEY,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  scholar         TEXT NOT NULL,                 -- 'ibn_kathir', 'saadi', 'tabari'
  language_code   VARCHAR(5) NOT NULL,
  text            TEXT NOT NULL,
  UNIQUE (ayah_id, scholar, language_code)
);

-- ── Traduction mot à mot ──────────────────────────────────
CREATE TABLE quran_word_by_word (
  id              SERIAL PRIMARY KEY,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  word_position   SMALLINT NOT NULL,             -- Position du mot dans le verset
  text_arabic     TEXT NOT NULL,                 -- Mot en arabe
  transliteration TEXT,                          -- Translittération
  translation_en  TEXT,                          -- Traduction anglaise du mot
  translation_fr  TEXT,                          -- Traduction française du mot
  UNIQUE (ayah_id, word_position)
);

-- ── Règles de Tajweed ────────────────────────────────────
CREATE TABLE quran_tajweed_rules (
  id              SERIAL PRIMARY KEY,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  word_position   SMALLINT NOT NULL,
  char_position   SMALLINT NOT NULL,
  rule_name       TEXT NOT NULL,                 -- Ex : 'ghunnah', 'madd', 'idgham'
  color_code      VARCHAR(7)                     -- Code couleur HEX pour affichage
);

-- ── Récitateurs ──────────────────────────────────────────
CREATE TABLE reciters (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_english    TEXT NOT NULL,
  style           TEXT NOT NULL                  -- 'murattal', 'mujawwad', 'muallim'
                  CHECK (style IN ('murattal', 'mujawwad', 'muallim'))
);

-- ── Récitations audio ────────────────────────────────────
CREATE TABLE audio_recitations (
  id              SERIAL PRIMARY KEY,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  reciter_id      INTEGER NOT NULL REFERENCES reciters(id),
  audio_url       TEXT NOT NULL,                 -- URL Cloudflare R2
  duration_ms     INTEGER,                       -- Durée en millisecondes
  UNIQUE (ayah_id, reciter_id)
);

COMMENT ON TABLE quran_surahs IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE quran_ayahs IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE quran_translations IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE quran_tafsirs IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE quran_word_by_word IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE quran_tajweed_rules IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE reciters IS '🔒 ZONE SACRÉE — LECTURE SEULE';
COMMENT ON TABLE audio_recitations IS '🔒 ZONE SACRÉE — LECTURE SEULE';
