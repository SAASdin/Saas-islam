-- ============================================================
-- 004_applicative_zone_users.sql
-- 🔓 ZONE APPLICATIVE — UTILISATEURS & AUTH
-- Ces tables peuvent être lues ET modifiées par app_user
-- ============================================================

-- ── Utilisateurs ─────────────────────────────────────────
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE NOT NULL,
  username        TEXT UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  gender          TEXT CHECK (gender IN ('male', 'female', 'not_specified')) DEFAULT 'not_specified',
  country_code    VARCHAR(2),                    -- Code pays ISO
  language_code   VARCHAR(5) DEFAULT 'fr',       -- Langue préférée
  role            TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'moderator', 'admin')),
  is_verified     BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ
);

-- ── Paramètres utilisateur ───────────────────────────────
CREATE TABLE user_settings (
  user_id                   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  -- Coran
  quran_font_size           SMALLINT DEFAULT 22 CHECK (quran_font_size BETWEEN 16 AND 48),
  quran_translation_lang    VARCHAR(5) DEFAULT 'fr',
  quran_reciter_id          INTEGER REFERENCES reciters(id),
  show_transliteration      BOOLEAN DEFAULT FALSE,
  show_translation          BOOLEAN DEFAULT TRUE,
  show_tafsir               BOOLEAN DEFAULT FALSE,
  -- Prière
  prayer_method             TEXT DEFAULT 'MWL'   -- MWL, ISNA, Egypt, Makkah, Karachi...
                            CHECK (prayer_method IN ('MWL', 'ISNA', 'Egypt', 'Makkah', 'Karachi', 'Tehran', 'Jafari')),
  prayer_asr_method         TEXT DEFAULT 'standard'
                            CHECK (prayer_asr_method IN ('standard', 'hanafi')),
  -- UI
  theme                     TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  -- Notifications
  notif_fajr               BOOLEAN DEFAULT TRUE,
  notif_dhuhr              BOOLEAN DEFAULT TRUE,
  notif_asr                BOOLEAN DEFAULT TRUE,
  notif_maghrib            BOOLEAN DEFAULT TRUE,
  notif_isha               BOOLEAN DEFAULT TRUE,
  notif_daily_ayah         BOOLEAN DEFAULT TRUE,
  notif_daily_hadith       BOOLEAN DEFAULT TRUE,
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ── Marque-pages ─────────────────────────────────────────
CREATE TABLE user_bookmarks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL CHECK (content_type IN ('ayah', 'hadith', 'dua', 'matn_line')),
  content_id      INTEGER NOT NULL,              -- ID dans la table correspondante
  note            TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

-- ── Favoris ───────────────────────────────────────────────
CREATE TABLE user_favorites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL CHECK (content_type IN ('ayah', 'hadith', 'dua', 'video', 'scholar')),
  content_id      INTEGER NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

-- ── Notes personnelles ───────────────────────────────────
CREATE TABLE user_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL,
  content_id      INTEGER NOT NULL,
  note_text       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Abonnements ──────────────────────────────────────────
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status          TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  stripe_sub_id   TEXT                           -- ID Stripe (si applicable)
);

-- ── Paiements ────────────────────────────────────────────
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  amount_cents    INTEGER NOT NULL,
  currency        VARCHAR(3) DEFAULT 'EUR',
  status          TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  provider        TEXT DEFAULT 'stripe',
  provider_ref    TEXT,                          -- ID transaction externe
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
