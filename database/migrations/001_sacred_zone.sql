-- ============================================================
-- 001_sacred_zone.sql
-- 🔒 ZONE SACRÉE — Données islamiques immuables
-- ⚠️  AUCUNE modification après import initial validé
-- ⚠️  app_user : SELECT uniquement
-- Exécuter APRÈS 000_setup_database.sql
-- ============================================================

-- ════════════════════════════════════════════
-- 📖 CORAN (القرآن الكريم)
-- ════════════════════════════════════════════

-- Sourates (114 au total)
CREATE TABLE IF NOT EXISTS sacred.quran_surahs (
  id              SMALLINT PRIMARY KEY,               -- 1 à 114
  name_arabic     TEXT NOT NULL,                      -- اسم السورة بالعربية
  name_transliteration TEXT NOT NULL,                 -- Al-Fatiha, Al-Baqarah...
  name_french     TEXT NOT NULL,                      -- L'Ouverture, La Vache...
  name_english    TEXT NOT NULL,                      -- The Opening, The Cow...
  revelation_type TEXT NOT NULL CHECK (revelation_type IN ('mecquoise', 'médinoise')),
  ayah_count      SMALLINT NOT NULL,                  -- Nombre de versets
  juz_start       SMALLINT NOT NULL,                  -- Juz de début
  page_mushaf     SMALLINT NOT NULL,                  -- Page dans le Mushaf Uthmani
  has_bismillah   BOOLEAN NOT NULL DEFAULT TRUE,      -- FALSE pour At-Tawbah (sourate 9)
  CONSTRAINT chk_surah_id CHECK (id BETWEEN 1 AND 114),
  CONSTRAINT chk_revelation CHECK (revelation_type IN ('mecquoise', 'médinoise'))
);
COMMENT ON TABLE sacred.quran_surahs IS '📖 114 sourates du Coran. Source : Mushaf Uthmani (Hafs an Asim). IMMUABLE.';

-- Versets coraniques
CREATE TABLE IF NOT EXISTS sacred.quran_ayahs (
  id              SERIAL PRIMARY KEY,
  surah_id        SMALLINT NOT NULL REFERENCES sacred.quran_surahs(id),
  ayah_number     SMALLINT NOT NULL,                  -- Numéro du verset dans la sourate
  ayah_number_quran INT NOT NULL,                     -- Numéro séquentiel global (1-6236)
  text_uthmani    TEXT NOT NULL,                      -- Texte arabe Mushaf Uthmani (Hafs)
  text_simple     TEXT NOT NULL,                      -- Texte arabe simplifié (sans tashkeel)
  juz             SMALLINT NOT NULL,                  -- Juz (1-30)
  hizb            SMALLINT NOT NULL,                  -- Hizb (1-60)
  rub             SMALLINT NOT NULL,                  -- Rub' al-Hizb (1-240)
  page_mushaf     SMALLINT NOT NULL,                  -- Page dans le Mushaf Uthmani
  sajda           BOOLEAN NOT NULL DEFAULT FALSE,     -- Verset de prosternation
  sajda_type      TEXT CHECK (sajda_type IN ('recommended', 'obligatory')),
  CONSTRAINT uq_ayah UNIQUE (surah_id, ayah_number)
);
COMMENT ON TABLE sacred.quran_ayahs IS '📖 Versets coraniques — texte Uthmani Hafs. Source : Tanzil.net. IMMUABLE.';

-- Traductions validées (plusieurs langues)
CREATE TABLE IF NOT EXISTS sacred.quran_translations (
  id              SERIAL PRIMARY KEY,
  ayah_id         INT NOT NULL REFERENCES sacred.quran_ayahs(id),
  language_code   CHAR(2) NOT NULL,                   -- 'fr', 'en', 'de', 'tr'...
  translator_name TEXT NOT NULL,                      -- Hamidullah, Pikthall...
  translator_key  TEXT NOT NULL,                      -- identifiant unique du traducteur
  translation     TEXT NOT NULL,                      -- Texte de la traduction
  is_validated    BOOLEAN NOT NULL DEFAULT TRUE,      -- Validé par un savant
  CONSTRAINT uq_translation UNIQUE (ayah_id, translator_key)
);
COMMENT ON TABLE sacred.quran_translations IS '📖 Traductions validées du Coran. JAMAIS une traduction automatique ici. IMMUABLE.';

-- Tafsirs (exégèses)
CREATE TABLE IF NOT EXISTS sacred.quran_tafsirs (
  id              SERIAL PRIMARY KEY,
  ayah_id         INT NOT NULL REFERENCES sacred.quran_ayahs(id),
  tafsir_name     TEXT NOT NULL,                      -- Ibn Kathir, As-Saadi, Tabari...
  tafsir_key      TEXT NOT NULL,                      -- identifiant unique
  language_code   CHAR(2) NOT NULL DEFAULT 'ar',
  content         TEXT NOT NULL,
  CONSTRAINT uq_tafsir UNIQUE (ayah_id, tafsir_key)
);
COMMENT ON TABLE sacred.quran_tafsirs IS '📖 Exégèses coraniques (Ibn Kathir, Tabari, Saadi...). IMMUABLE.';

-- Traduction mot à mot
CREATE TABLE IF NOT EXISTS sacred.quran_word_by_word (
  id              SERIAL PRIMARY KEY,
  ayah_id         INT NOT NULL REFERENCES sacred.quran_ayahs(id),
  word_position   SMALLINT NOT NULL,                  -- Position du mot dans le verset
  word_arabic     TEXT NOT NULL,                      -- Mot arabe
  word_transliteration TEXT,                          -- Translittération
  translation_en  TEXT,                               -- Traduction anglaise du mot
  translation_fr  TEXT,                               -- Traduction française du mot
  root_arabic     TEXT,                               -- Racine arabe (ثلاثية)
  grammar_type    TEXT,                               -- Nom, verbe, particule...
  CONSTRAINT uq_word UNIQUE (ayah_id, word_position)
);
COMMENT ON TABLE sacred.quran_word_by_word IS '📖 Analyse mot à mot. Source : corpus.quran.com. IMMUABLE.';

-- Règles de tajweed par verset
CREATE TABLE IF NOT EXISTS sacred.quran_tajweed (
  id              SERIAL PRIMARY KEY,
  ayah_id         INT NOT NULL REFERENCES sacred.quran_ayahs(id),
  char_start      INT NOT NULL,                       -- Position de début dans le verset
  char_end        INT NOT NULL,                       -- Position de fin
  rule_name       TEXT NOT NULL,                      -- ghunna, madd, qalqala...
  rule_color      CHAR(7) NOT NULL                    -- Couleur hex (#FF0000)
);
COMMENT ON TABLE sacred.quran_tajweed IS '📖 Règles de tajweed pour la coloration. IMMUABLE.';

-- ════════════════════════════════════════════
-- 🕌 HADITHS
-- ════════════════════════════════════════════

-- Collections de hadiths
CREATE TABLE IF NOT EXISTS sacred.hadith_collections (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,                      -- اسم الكتاب بالعربية
  name_french     TEXT NOT NULL,                      -- Sahih Al-Bukhari...
  name_english    TEXT NOT NULL,
  author          TEXT NOT NULL,                      -- Al-Bukhari, Muslim...
  death_year_hijri SMALLINT,                          -- Année de décès (Hijri)
  total_hadiths   INT,                                -- Nombre total de hadiths
  collection_key  TEXT NOT NULL UNIQUE                -- 'bukhari', 'muslim', 'tirmidhi'...
);
COMMENT ON TABLE sacred.hadith_collections IS '🕌 Collections de hadiths. IMMUABLE.';

-- Hadiths
CREATE TABLE IF NOT EXISTS sacred.hadiths (
  id              SERIAL PRIMARY KEY,
  collection_id   INT NOT NULL REFERENCES sacred.hadith_collections(id),
  hadith_number   TEXT NOT NULL,                      -- Numéro dans la collection
  book_number     SMALLINT,                           -- Numéro du livre
  chapter_number  SMALLINT,                           -- Numéro du chapitre
  chapter_name_arabic TEXT,
  chapter_name_french TEXT,
  text_arabic     TEXT NOT NULL,                      -- Matn (texte) en arabe
  text_french     TEXT,                               -- Traduction française validée
  text_english    TEXT,                               -- Traduction anglaise validée
  isnad_arabic    TEXT,                               -- Chaîne de transmission (arabe)
  grade           TEXT,                               -- sahih, hassan, da'if...
  grade_source    TEXT,                               -- Qui a classifié (Al-Albani, etc.)
  reference       TEXT NOT NULL,                      -- Référence exacte (Bukhari 1/1)
  CONSTRAINT uq_hadith UNIQUE (collection_id, hadith_number)
);
COMMENT ON TABLE sacred.hadiths IS '🕌 Hadiths — texte arabe + traductions validées. IMMUABLE.';

-- Chaînes de narration
CREATE TABLE IF NOT EXISTS sacred.hadith_narrators (
  id              SERIAL PRIMARY KEY,
  hadith_id       INT NOT NULL REFERENCES sacred.hadiths(id),
  narrator_name   TEXT NOT NULL,
  narrator_arabic TEXT,
  position_in_chain SMALLINT NOT NULL,               -- Position dans l'isnad
  death_year_hijri SMALLINT
);
COMMENT ON TABLE sacred.hadith_narrators IS '🕌 Narateurs des hadiths (isnad). IMMUABLE.';

-- ════════════════════════════════════════════
-- 🤲 SCIENCES ISLAMIQUES
-- ════════════════════════════════════════════

-- Dou'as (invocations)
CREATE TABLE IF NOT EXISTS sacred.duas (
  id              SERIAL PRIMARY KEY,
  category        TEXT NOT NULL,                      -- matin, soir, repas, voyage...
  subcategory     TEXT,
  title_arabic    TEXT NOT NULL,                      -- Titre en arabe
  title_french    TEXT NOT NULL,
  text_arabic     TEXT NOT NULL,                      -- Texte de la dou'a
  transliteration TEXT NOT NULL,                      -- Translittération validée
  translation_fr  TEXT NOT NULL,                      -- Traduction validée
  translation_en  TEXT,
  source          TEXT NOT NULL,                      -- Référence (Hadith, Coran...)
  reference_detail TEXT,                              -- Détail de la référence
  virtue          TEXT,                               -- Vertu de la dou'a
  display_order   SMALLINT NOT NULL DEFAULT 0
);
COMMENT ON TABLE sacred.duas IS '🤲 Invocations islamiques. IMMUABLE.';

-- 99 Noms d'Allah (أسماء الله الحسنى)
CREATE TABLE IF NOT EXISTS sacred.allah_names (
  id              SMALLINT PRIMARY KEY,               -- 1 à 99
  name_arabic     TEXT NOT NULL,                      -- الاسم بالعربية
  name_transliteration TEXT NOT NULL,                 -- Ar-Rahman...
  name_french     TEXT NOT NULL,                      -- Le Tout-Miséricordieux...
  name_english    TEXT NOT NULL,                      -- The Most Gracious...
  meaning_arabic  TEXT NOT NULL,                      -- Explication en arabe
  meaning_french  TEXT NOT NULL,                      -- Explication en français
  meaning_english TEXT NOT NULL,
  quran_occurrence TEXT,                              -- Référence coranique
  CONSTRAINT chk_name_id CHECK (id BETWEEN 1 AND 99)
);
COMMENT ON TABLE sacred.allah_names IS '🌟 99 Noms d''Allah. IMMUABLE.';

-- Prophètes (Seerah)
CREATE TABLE IF NOT EXISTS sacred.prophets (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  name_english    TEXT NOT NULL,
  title           TEXT,                               -- Titre honorifique
  quran_mentions  INT,                                -- Nombre de mentions dans le Coran
  birth_place     TEXT,
  summary_french  TEXT NOT NULL,
  summary_english TEXT,
  quran_surahs    TEXT[],                             -- Sourates qui le mentionnent
  display_order   SMALLINT NOT NULL DEFAULT 0
);
COMMENT ON TABLE sacred.prophets IS '🌟 Seerah des Prophètes. IMMUABLE.';

-- Calendrier islamique
CREATE TABLE IF NOT EXISTS sacred.islamic_calendar (
  id              SERIAL PRIMARY KEY,
  month_hijri     SMALLINT NOT NULL,                  -- 1 à 12
  month_name_arabic TEXT NOT NULL,                    -- المحرم، صفر...
  month_name_french TEXT NOT NULL,                    -- Muharram, Safar...
  month_name_english TEXT NOT NULL,
  day_hijri       SMALLINT NOT NULL,                  -- 1 à 30
  event_name_arabic TEXT,
  event_name_french TEXT NOT NULL,
  event_name_english TEXT,
  event_type      TEXT NOT NULL,                      -- 'obligatoire', 'recommandé', 'interdit'
  description_fr  TEXT,
  CONSTRAINT uq_cal UNIQUE (month_hijri, day_hijri, event_name_french)
);
COMMENT ON TABLE sacred.islamic_calendar IS '📅 Calendrier islamique — fêtes et événements. IMMUABLE.';

-- Biographies des savants
CREATE TABLE IF NOT EXISTS sacred.scholars (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  birth_year_hijri SMALLINT,
  death_year_hijri SMALLINT,
  specialities    TEXT[],                             -- ['Fiqh', 'Hadith', 'Tafsir']
  school          TEXT,                               -- Hanafi, Maliki, Shafi'i, Hanbali
  biography_fr    TEXT NOT NULL,
  biography_en    TEXT,
  notable_works   TEXT[]
);
COMMENT ON TABLE sacred.scholars IS '🎓 Biographies de savants islamiques. IMMUABLE.';

-- ════════════════════════════════════════════
-- 📚 MUTUN & LIVRES DE RÉFÉRENCE
-- ════════════════════════════════════════════

-- Catégories de mutun
CREATE TABLE IF NOT EXISTS sacred.mutun_categories (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,                      -- النحو، الفقه...
  name_french     TEXT NOT NULL,                      -- Nahw, Fiqh, Aqida...
  name_english    TEXT NOT NULL,
  description_fr  TEXT,
  display_order   SMALLINT NOT NULL DEFAULT 0
);
COMMENT ON TABLE sacred.mutun_categories IS '📚 Catégories des Mutun (Nahw, Fiqh, Aqida...). IMMUABLE.';

-- Mutun (textes de mémorisation)
CREATE TABLE IF NOT EXISTS sacred.mutun (
  id              SERIAL PRIMARY KEY,
  category_id     INT NOT NULL REFERENCES sacred.mutun_categories(id),
  title_arabic    TEXT NOT NULL,                      -- الآجرومية
  title_french    TEXT NOT NULL,                      -- Al-Ajrumiyya
  author_arabic   TEXT NOT NULL,
  author_french   TEXT NOT NULL,
  author_id       INT REFERENCES sacred.scholars(id),
  composition_year_hijri SMALLINT,
  total_lines     INT,                                -- Nombre de vers/lignes
  difficulty_level SMALLINT CHECK (difficulty_level BETWEEN 1 AND 5),
  description_fr  TEXT,
  text_key        TEXT NOT NULL UNIQUE                -- identifiant 'ajrumiyya', 'waraqat'...
);
COMMENT ON TABLE sacred.mutun IS '📚 Mutun islamiques pour la mémorisation. IMMUABLE.';

-- Vers/lignes des mutun
CREATE TABLE IF NOT EXISTS sacred.mutun_lines (
  id              SERIAL PRIMARY KEY,
  matn_id         INT NOT NULL REFERENCES sacred.mutun(id),
  line_number     INT NOT NULL,
  text_arabic     TEXT NOT NULL,                      -- Texte arabe du vers
  transliteration TEXT,                              -- Translittération
  translation_fr  TEXT,                               -- Traduction française
  chapter_name_fr TEXT,                               -- Chapitre (si applicable)
  CONSTRAINT uq_matn_line UNIQUE (matn_id, line_number)
);
COMMENT ON TABLE sacred.mutun_lines IS '📚 Vers et lignes des Mutun. IMMUABLE.';

-- Livres de référence islamiques
CREATE TABLE IF NOT EXISTS sacred.reference_books (
  id              SERIAL PRIMARY KEY,
  title_arabic    TEXT NOT NULL,
  title_french    TEXT NOT NULL,
  author_arabic   TEXT NOT NULL,
  author_french   TEXT NOT NULL,
  author_id       INT REFERENCES sacred.scholars(id),
  domain          TEXT NOT NULL,                      -- 'Fiqh', 'Aqida', 'Hadith', 'Tafsir'...
  school          TEXT,                               -- Hanafi, Maliki...
  century_hijri   SMALLINT,                           -- Siècle de rédaction (Hijri)
  description_fr  TEXT,
  total_chapters  INT
);
COMMENT ON TABLE sacred.reference_books IS '📚 Livres de référence islamiques. IMMUABLE.';

-- Chapitres des livres
CREATE TABLE IF NOT EXISTS sacred.book_chapters (
  id              SERIAL PRIMARY KEY,
  book_id         INT NOT NULL REFERENCES sacred.reference_books(id),
  chapter_number  INT NOT NULL,
  title_arabic    TEXT,
  title_french    TEXT NOT NULL,
  CONSTRAINT uq_chapter UNIQUE (book_id, chapter_number)
);

-- Contenu des chapitres
CREATE TABLE IF NOT EXISTS sacred.book_content (
  id              SERIAL PRIMARY KEY,
  chapter_id      INT NOT NULL REFERENCES sacred.book_chapters(id),
  paragraph_number INT NOT NULL,
  text_arabic     TEXT NOT NULL,
  translation_fr  TEXT,
  translation_en  TEXT,
  CONSTRAINT uq_book_para UNIQUE (chapter_id, paragraph_number)
);
COMMENT ON TABLE sacred.book_content IS '📚 Contenu des livres islamiques de référence. IMMUABLE.';

-- ════════════════════════════════════════════
-- 🔒 PERMISSIONS — ZONE SACRÉE
-- Bloquer toute écriture pour app_user
-- ════════════════════════════════════════════

GRANT USAGE ON SCHEMA sacred TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA sacred TO app_user;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON ALL TABLES IN SCHEMA sacred FROM app_user;

-- S'assurer que les futures tables seront aussi en lecture seule
ALTER DEFAULT PRIVILEGES IN SCHEMA sacred
  GRANT SELECT ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA sacred
  REVOKE INSERT, UPDATE, DELETE ON TABLES FROM app_user;

-- Log des tentatives d'écriture sur les tables sacrées (optionnel — à activer via trigger)
-- Les triggers d'audit seront dans 005_audit_triggers.sql
