-- ============================================================
-- 006_hadith_books_chapters.sql
-- 🕌 ZONE SACRÉE — Tables livres et chapitres hadiths
-- Source : sunnah.com API v1
-- Exécuter APRÈS 001_sacred_zone.sql
-- ============================================================

-- Livres (كتب) de chaque collection
CREATE TABLE IF NOT EXISTS sacred.hadith_books (
  id              SERIAL PRIMARY KEY,
  collection_id   INT NOT NULL REFERENCES sacred.hadith_collections(id) ON DELETE CASCADE,
  book_number     TEXT NOT NULL,                      -- ex: "1", "2", "3"...
  name_arabic     TEXT,                               -- اسم الكتاب بالعربية
  name_english    TEXT,                               -- Book of Revelation
  total_hadiths   INT DEFAULT 0,
  CONSTRAINT uq_hadith_book UNIQUE (collection_id, book_number)
);
COMMENT ON TABLE sacred.hadith_books IS '🕌 Livres (كتب) des collections de hadiths. IMMUABLE.';

-- Chapitres (أبواب) de chaque livre
CREATE TABLE IF NOT EXISTS sacred.hadith_chapters (
  id              SERIAL PRIMARY KEY,
  collection_id   INT NOT NULL REFERENCES sacred.hadith_collections(id) ON DELETE CASCADE,
  book_id         INT REFERENCES sacred.hadith_books(id) ON DELETE CASCADE,
  chapter_number  TEXT NOT NULL,                      -- ex: "1", "1.00"
  name_arabic     TEXT,                               -- اسم الباب
  name_english    TEXT,                               -- Chapter name
  intro           TEXT,                               -- Introduction du chapitre
  ending          TEXT,                               -- Fin du chapitre
  CONSTRAINT uq_hadith_chapter UNIQUE (collection_id, chapter_number)
);
COMMENT ON TABLE sacred.hadith_chapters IS '🕌 Chapitres (أبواب) des collections de hadiths. IMMUABLE.';

-- Ajouter références FK sur hadiths (si pas déjà présentes)
ALTER TABLE sacred.hadiths 
  ADD COLUMN IF NOT EXISTS book_id INT REFERENCES sacred.hadith_books(id),
  ADD COLUMN IF NOT EXISTS chapter_id INT REFERENCES sacred.hadith_chapters(id),
  ADD COLUMN IF NOT EXISTS chapters TEXT,             -- numéros de chapitres (array JSON)
  ADD COLUMN IF NOT EXISTS text_urdu TEXT,            -- traduction ourdou si disponible
  ADD COLUMN IF NOT EXISTS text_indonesian TEXT;      -- traduction indonésienne si disponible

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_hadiths_collection ON sacred.hadiths(collection_id);
CREATE INDEX IF NOT EXISTS idx_hadiths_book ON sacred.hadiths(book_id);
CREATE INDEX IF NOT EXISTS idx_hadiths_chapter ON sacred.hadiths(chapter_id);
CREATE INDEX IF NOT EXISTS idx_hadiths_grade ON sacred.hadiths(grade);
CREATE INDEX IF NOT EXISTS idx_hadith_books_collection ON sacred.hadith_books(collection_id);
CREATE INDEX IF NOT EXISTS idx_hadith_chapters_book ON sacred.hadith_chapters(book_id);

-- Recherche plein texte (FTS)
CREATE INDEX IF NOT EXISTS idx_hadiths_fts_arabic 
  ON sacred.hadiths USING GIN (to_tsvector('arabic', COALESCE(text_arabic, '')));
CREATE INDEX IF NOT EXISTS idx_hadiths_fts_english 
  ON sacred.hadiths USING GIN (to_tsvector('english', COALESCE(text_english, '')));

-- Revoke sur les nouvelles tables
REVOKE INSERT, UPDATE, DELETE ON sacred.hadith_books FROM app_user;
REVOKE INSERT, UPDATE, DELETE ON sacred.hadith_chapters FROM app_user;
GRANT SELECT ON sacred.hadith_books TO app_user;
GRANT SELECT ON sacred.hadith_chapters TO app_user;
