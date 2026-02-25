-- ============================================================
-- 003_media_zone.sql
-- 🎬 ZONE MÉDIA — Vidéos, audio, récitations
-- Gérée par admin uniquement
-- Exécuter APRÈS 002_app_zone.sql
-- ============================================================

-- ════════════════════════════════════════════
-- 🎤 RÉCITATEURS
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS media.reciters (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  name_english    TEXT NOT NULL,
  bio_fr          TEXT,
  country         TEXT,
  style           TEXT,                               -- 'Hafs', 'Warsh', 'Qaloun'...
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  avatar_url      TEXT
);
COMMENT ON TABLE media.reciters IS '🎤 Récitateurs du Coran.';

-- Récitations audio du Coran
CREATE TABLE IF NOT EXISTS media.audio_recitations (
  id              SERIAL PRIMARY KEY,
  reciter_id      INT NOT NULL REFERENCES media.reciters(id),
  surah_id        SMALLINT NOT NULL,                  -- Référence sacred.quran_surahs.id
  ayah_id         INT,                                -- NULL = récitation complète de la sourate
  audio_url       TEXT NOT NULL,                      -- URL Cloudflare R2
  duration_sec    INT NOT NULL,
  file_size_bytes BIGINT,
  quality         TEXT NOT NULL DEFAULT 'high' CHECK (quality IN ('low', 'medium', 'high')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_recitation UNIQUE (reciter_id, surah_id, ayah_id)
);
COMMENT ON TABLE media.audio_recitations IS '🔊 Fichiers audio des récitations coraniques.';

-- ════════════════════════════════════════════
-- 📺 VIDÉOS & CONFÉRENCES
-- ════════════════════════════════════════════

-- Savants (conférenciers)
CREATE TABLE IF NOT EXISTS media.speakers (
  id              SERIAL PRIMARY KEY,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  bio_fr          TEXT,
  country         TEXT,
  specialities    TEXT[],
  avatar_url      TEXT,
  youtube_channel TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE media.speakers IS '🎤 Savants et conférenciers islamiques.';

-- Vidéos
CREATE TABLE IF NOT EXISTS media.videos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar        TEXT,                               -- Titre original arabe
  title_fr        TEXT,                               -- Titre traduit
  title_en        TEXT,
  description_fr  TEXT,
  speaker_id      INT REFERENCES media.speakers(id),
  domain          TEXT,                               -- 'Fiqh', 'Aqida', 'Tafsir', 'Seerah'...
  -- Sources
  source_type     TEXT NOT NULL CHECK (source_type IN ('youtube', 'upload', 'live')),
  youtube_video_id TEXT UNIQUE,                       -- ID YouTube (si source YouTube)
  youtube_channel_id TEXT,
  video_url       TEXT,                               -- URL Cloudflare R2 (si upload)
  thumbnail_url   TEXT,
  duration_sec    INT,
  -- Sous-titres et traductions
  has_arabic_subs BOOLEAN NOT NULL DEFAULT FALSE,
  has_french_subs BOOLEAN NOT NULL DEFAULT FALSE,
  has_english_subs BOOLEAN NOT NULL DEFAULT FALSE,
  subtitles_url_ar TEXT,
  subtitles_url_fr TEXT,
  subtitles_url_en TEXT,
  is_auto_translated BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE si traduction automatique Whisper
  -- Modération
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Stats
  views_count     INT NOT NULL DEFAULT 0,
  -- Dates
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE media.videos IS '📺 Vidéos de conférences islamiques. Traductions automatiques clairement marquées.';

-- Playlists YouTube scrapées
CREATE TABLE IF NOT EXISTS media.youtube_playlists (
  id              SERIAL PRIMARY KEY,
  youtube_playlist_id TEXT NOT NULL UNIQUE,           -- ID de la playlist YouTube
  title           TEXT NOT NULL,
  channel_id      TEXT NOT NULL,
  channel_title   TEXT NOT NULL,
  speaker_id      INT REFERENCES media.speakers(id),
  last_scraped_at TIMESTAMPTZ,
  total_videos    INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE media.youtube_playlists IS '📺 Playlists YouTube scrapées automatiquement.';

-- Vidéos traduites automatiquement (Video Translator service)
CREATE TABLE IF NOT EXISTS media.translated_videos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id        UUID NOT NULL REFERENCES media.videos(id),
  target_language CHAR(2) NOT NULL,                   -- 'fr', 'en', 'de'...
  -- Transcription
  transcript_ar   TEXT,                               -- Transcription arabe (Whisper)
  transcript_fr   TEXT,                               -- Traduction auto FR
  transcript_en   TEXT,                               -- Traduction auto EN
  -- OBLIGATOIRE : label "traduction automatique non vérifiée"
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,     -- FALSE = traduction auto non relue
  verified_by     UUID REFERENCES app.users(id),
  verified_at     TIMESTAMPTZ,
  -- Sous-titres synchronisés
  subtitles_srt_url TEXT,                             -- URL du fichier SRT
  whisper_model   TEXT,                               -- Modèle Whisper utilisé
  translation_service TEXT NOT NULL DEFAULT 'deepl',  -- 'deepl', 'gpt4', 'manual'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_translation UNIQUE (video_id, target_language)
);
COMMENT ON TABLE media.translated_videos IS '🌐 Vidéos traduites automatiquement. is_verified=FALSE par défaut.';

-- ════════════════════════════════════════════
-- 🔒 PERMISSIONS — ZONE MÉDIA
-- app_user : lecture seule (videos approuvées)
-- admin : tout
-- ════════════════════════════════════════════

GRANT USAGE ON SCHEMA media TO app_user;
GRANT SELECT ON ALL TABLES IN SCHEMA media TO app_user;
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA media FROM app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA media
  GRANT SELECT ON TABLES TO app_user;

-- ════════════════════════════════════════════
-- 📑 INDEX — PERFORMANCES
-- ════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_audio_reciter ON media.audio_recitations(reciter_id);
CREATE INDEX IF NOT EXISTS idx_audio_surah ON media.audio_recitations(surah_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON media.videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_domain ON media.videos(domain);
CREATE INDEX IF NOT EXISTS idx_videos_speaker ON media.videos(speaker_id);
CREATE INDEX IF NOT EXISTS idx_videos_youtube ON media.videos(youtube_video_id);
