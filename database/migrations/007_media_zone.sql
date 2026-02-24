-- ============================================================
-- 007_media_zone.sql
-- 🎬 ZONE MÉDIA — Vidéos, Playlists YouTube, Traductions
-- Gérée par les admins uniquement
-- ============================================================

-- ── Chaînes YouTube de savants ───────────────────────────
CREATE TABLE youtube_channels (
  id              SERIAL PRIMARY KEY,
  channel_id      TEXT UNIQUE NOT NULL,          -- ID YouTube (ex: UCxxxxxxx)
  channel_name    TEXT NOT NULL,
  scholar_id      INTEGER REFERENCES scholars(id),
  language        VARCHAR(5) DEFAULT 'ar',
  is_active       BOOLEAN DEFAULT TRUE,
  last_scraped_at TIMESTAMPTZ
);

-- ── Playlists YouTube ────────────────────────────────────
CREATE TABLE youtube_playlists (
  id              SERIAL PRIMARY KEY,
  channel_id      INTEGER REFERENCES youtube_channels(id),
  playlist_id     TEXT UNIQUE NOT NULL,          -- ID YouTube
  title           TEXT NOT NULL,
  description     TEXT,
  video_count     INTEGER DEFAULT 0,
  domain          TEXT CHECK (domain IN ('tafsir', 'hadith', 'fiqh', 'aqida', 'arabic', 'seerah', 'other')),
  last_synced_at  TIMESTAMPTZ
);

-- ── Vidéos YouTube indexées ──────────────────────────────
CREATE TABLE youtube_videos (
  id              SERIAL PRIMARY KEY,
  playlist_id     INTEGER REFERENCES youtube_playlists(id),
  youtube_id      TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  duration_sec    INTEGER,
  published_at    TIMESTAMPTZ,
  thumbnail_url   TEXT,
  language        VARCHAR(5) DEFAULT 'ar',
  is_downloaded   BOOLEAN DEFAULT FALSE,
  local_path      TEXT,                          -- Chemin si téléchargé
  scraped_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Vidéos traduites ─────────────────────────────────────
CREATE TABLE translated_videos (
  id              SERIAL PRIMARY KEY,
  source_video_id INTEGER NOT NULL REFERENCES youtube_videos(id),
  target_language VARCHAR(5) NOT NULL,           -- 'fr', 'en', etc.
  transcript_ar   TEXT,                          -- Transcription arabe (Whisper)
  translation_text TEXT,                         -- Traduction générée
  subtitle_url    TEXT,                          -- URL fichier .srt / .vtt
  is_verified     BOOLEAN DEFAULT FALSE,         -- Relu par un humain ?
  verified_by     UUID REFERENCES users(id),
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (source_video_id, target_language)
);

-- ── Vidéos (contenu propriétaire) ────────────────────────
CREATE TABLE videos (
  id              SERIAL PRIMARY KEY,
  title_fr        TEXT NOT NULL,
  title_ar        TEXT,
  description_fr  TEXT,
  content_type    TEXT NOT NULL
                  CHECK (content_type IN ('course', 'conference', 'recitation', 'reminder', 'clip')),
  domain          TEXT CHECK (domain IN ('tafsir', 'hadith', 'fiqh', 'aqida', 'arabic', 'seerah', 'quran', 'other')),
  video_url       TEXT NOT NULL,                 -- Cloudflare R2
  thumbnail_url   TEXT,
  duration_sec    INTEGER,
  language        VARCHAR(5) DEFAULT 'fr',
  scholar_id      INTEGER REFERENCES scholars(id),
  is_published    BOOLEAN DEFAULT FALSE,
  views_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
