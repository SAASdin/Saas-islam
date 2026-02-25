-- ============================================================
-- 002_app_zone.sql
-- 🔓 ZONE APPLICATIVE — Données utilisateurs (lecture/écriture)
-- app_user : SELECT, INSERT, UPDATE, DELETE autorisés
-- Exécuter APRÈS 001_sacred_zone.sql
-- ============================================================

-- ════════════════════════════════════════════
-- 👤 UTILISATEURS & AUTH
-- ════════════════════════════════════════════

-- Utilisateurs
CREATE TABLE IF NOT EXISTS app.users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  username        TEXT UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  bio             TEXT,
  country_code    CHAR(2),                            -- FR, MA, DZ, TN...
  language_pref   CHAR(2) NOT NULL DEFAULT 'fr',      -- Langue préférée
  role            TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ
);
COMMENT ON TABLE app.users IS '👤 Comptes utilisateurs de la plateforme.';

-- Méthodes d'authentification (OAuth, email/mdp, etc.)
CREATE TABLE IF NOT EXISTS app.user_auth (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL,                      -- 'google', 'apple', 'email', 'phone'
  provider_id     TEXT NOT NULL,                      -- ID chez le provider OAuth
  email           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_auth UNIQUE (provider, provider_id)
);
COMMENT ON TABLE app.user_auth IS '🔐 Méthodes d''auth (OAuth, email). Ne jamais stocker de mot de passe en clair.';

-- Paramètres utilisateur
CREATE TABLE IF NOT EXISTS app.user_settings (
  user_id         UUID PRIMARY KEY REFERENCES app.users(id) ON DELETE CASCADE,
  -- Coran
  quran_font      TEXT NOT NULL DEFAULT 'kfgqpc',     -- 'kfgqpc', 'amiri', 'scheherazade'
  quran_font_size SMALLINT NOT NULL DEFAULT 24,       -- En px (min 16)
  quran_translation_key TEXT,                         -- Traducteur préféré
  quran_tafsir_key TEXT,                              -- Tafsir préféré
  show_transliteration BOOLEAN NOT NULL DEFAULT FALSE,
  -- Prière
  prayer_method   TEXT NOT NULL DEFAULT 'mwl',        -- Méthode de calcul des prières
  prayer_madhab   TEXT NOT NULL DEFAULT 'shafi',      -- Madhab pour Asr
  prayer_latitude DECIMAL(9,6),                       -- Position GPS
  prayer_longitude DECIMAL(9,6),
  prayer_city     TEXT,
  -- Affichage
  theme           TEXT NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'sepia')),
  language_ui     CHAR(2) NOT NULL DEFAULT 'fr',
  -- Notifications
  notif_prayer    BOOLEAN NOT NULL DEFAULT TRUE,
  notif_ayah_day  BOOLEAN NOT NULL DEFAULT TRUE,
  notif_hadith_day BOOLEAN NOT NULL DEFAULT FALSE,
  notif_dua       BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.user_settings IS '⚙️ Préférences utilisateur (thème, police Coran, prière...).';

-- ════════════════════════════════════════════
-- 📚 PROGRESSION & MÉMORISATION
-- ════════════════════════════════════════════

-- Progression de lecture du Coran
CREATE TABLE IF NOT EXISTS app.user_quran_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  surah_id        SMALLINT NOT NULL,                  -- Référence vers sacred.quran_surahs.id
  ayah_id         INT NOT NULL,                       -- Référence vers sacred.quran_ayahs.id
  last_read_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_bookmarked   BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT uq_quran_progress UNIQUE (user_id, surah_id)
);
COMMENT ON TABLE app.user_quran_progress IS '📖 Progression de lecture Coran par utilisateur.';

-- Mémorisation du Coran
CREATE TABLE IF NOT EXISTS app.user_quran_memorization (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  ayah_id         INT NOT NULL,                       -- Référence vers sacred.quran_ayahs.id
  status          TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'reviewing', 'memorized')),
  -- SRS (Spaced Repetition System)
  easiness_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,  -- Facteur de facilité (Anki)
  interval_days   SMALLINT NOT NULL DEFAULT 1,        -- Intervalle actuel en jours
  repetitions     SMALLINT NOT NULL DEFAULT 0,        -- Nombre de répétitions réussies
  next_review_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  CONSTRAINT uq_quran_memo UNIQUE (user_id, ayah_id)
);
COMMENT ON TABLE app.user_quran_memorization IS '🧠 Mémorisation Coran avec SRS (Spaced Repetition).';

-- Mémorisation des Mutun
CREATE TABLE IF NOT EXISTS app.user_mutun_memorization (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  matn_id         INT NOT NULL,                       -- Référence vers sacred.mutun.id
  line_id         INT NOT NULL,                       -- Référence vers sacred.mutun_lines.id
  status          TEXT NOT NULL DEFAULT 'learning' CHECK (status IN ('learning', 'reviewing', 'memorized')),
  -- SRS
  easiness_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
  interval_days   SMALLINT NOT NULL DEFAULT 1,
  repetitions     SMALLINT NOT NULL DEFAULT 0,
  next_review_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  last_reviewed_at TIMESTAMPTZ,
  CONSTRAINT uq_mutun_memo UNIQUE (user_id, line_id)
);
COMMENT ON TABLE app.user_mutun_memorization IS '🧠 Mémorisation Mutun avec SRS.';

-- Favoris (versets, hadiths, dou''as...)
CREATE TABLE IF NOT EXISTS app.user_favorites (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL CHECK (content_type IN ('ayah', 'hadith', 'dua', 'video', 'post')),
  content_id      INT NOT NULL,                       -- ID dans la table correspondante
  note            TEXT,                               -- Note personnelle
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_favorite UNIQUE (user_id, content_type, content_id)
);
COMMENT ON TABLE app.user_favorites IS '❤️ Favoris utilisateur (versets, hadiths, dou''as...).';

-- Notes personnelles
CREATE TABLE IF NOT EXISTS app.user_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL CHECK (content_type IN ('ayah', 'hadith', 'matn_line', 'book_content')),
  content_id      INT NOT NULL,
  note_text       TEXT NOT NULL,
  is_private      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.user_notes IS '📝 Notes personnelles sur des versets, hadiths...';

-- ════════════════════════════════════════════
-- 📱 RÉSEAU SOCIAL HALAL
-- ════════════════════════════════════════════

-- Posts
CREATE TABLE IF NOT EXISTS app.social_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  content_text    TEXT,                               -- Texte du post
  content_type    TEXT NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'video', 'audio', 'quran_share', 'hadith_share')),
  -- Si partage de contenu religieux (lecture seule depuis sacred)
  shared_ayah_id  INT,                                -- Référence vers sacred.quran_ayahs.id
  shared_hadith_id INT,                               -- Référence vers sacred.hadiths.id
  -- Médias
  media_url       TEXT,                               -- URL vidéo/audio (Cloudflare R2)
  thumbnail_url   TEXT,
  duration_sec    INT,                                -- Durée vidéo/audio
  -- Modération
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by    UUID REFERENCES app.users(id),
  moderated_at    TIMESTAMPTZ,
  rejection_reason TEXT,
  -- Stats
  likes_count     INT NOT NULL DEFAULT 0,
  comments_count  INT NOT NULL DEFAULT 0,
  shares_count    INT NOT NULL DEFAULT 0,
  views_count     INT NOT NULL DEFAULT 0,
  -- Dates
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE app.social_posts IS '📱 Posts du réseau social halal. Modération stricte.';

-- Commentaires
CREATE TABLE IF NOT EXISTS app.social_comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID NOT NULL REFERENCES app.social_posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  parent_id       UUID REFERENCES app.social_comments(id), -- Sous-commentaire
  content_text    TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE app.social_comments IS '💬 Commentaires sur les posts. Modération obligatoire.';

-- Likes
CREATE TABLE IF NOT EXISTS app.social_likes (
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  post_id         UUID REFERENCES app.social_posts(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES app.social_comments(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_like_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  CONSTRAINT uq_post_like UNIQUE (user_id, post_id),
  CONSTRAINT uq_comment_like UNIQUE (user_id, comment_id)
);

-- Relations (follow/following)
CREATE TABLE IF NOT EXISTS app.social_follows (
  follower_id     UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT pk_follow PRIMARY KEY (follower_id, following_id),
  CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);
COMMENT ON TABLE app.social_follows IS '👥 Relations follow entre utilisateurs.';

-- Signalements de contenu
CREATE TABLE IF NOT EXISTS app.social_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID NOT NULL REFERENCES app.users(id),
  content_type    TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'user')),
  content_id      UUID NOT NULL,
  reason          TEXT NOT NULL CHECK (reason IN ('haram', 'faux', 'spam', 'inapproprie', 'autre')),
  details         TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.social_reports IS '🚨 Signalements de contenu inapproprié.';

-- ════════════════════════════════════════════
-- 🎓 ACADÉMIE ISLAMIQUE
-- ════════════════════════════════════════════

-- Cours
CREATE TABLE IF NOT EXISTS app.academy_courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_fr        TEXT NOT NULL,
  description_fr  TEXT,
  instructor_id   UUID REFERENCES app.users(id),
  domain          TEXT NOT NULL,                      -- 'Fiqh', 'Aqida', 'Tafsir'...
  level           TEXT NOT NULL CHECK (level IN ('debutant', 'intermediaire', 'avance')),
  language        CHAR(2) NOT NULL DEFAULT 'fr',
  thumbnail_url   TEXT,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  is_free         BOOLEAN NOT NULL DEFAULT TRUE,
  price_cents     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.academy_courses IS '🎓 Cours de l''académie islamique.';

-- Inscriptions aux cours
CREATE TABLE IF NOT EXISTS app.academy_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES app.academy_courses(id),
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  progress_pct    SMALLINT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  CONSTRAINT uq_enrollment UNIQUE (user_id, course_id)
);
COMMENT ON TABLE app.academy_enrollments IS '🎓 Inscriptions aux cours.';

-- Devoirs et évaluations
CREATE TABLE IF NOT EXISTS app.academy_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID NOT NULL REFERENCES app.academy_courses(id),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  title_fr        TEXT NOT NULL,
  content         TEXT,
  file_url        TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  grade           SMALLINT CHECK (grade BETWEEN 0 AND 100),
  feedback        TEXT,
  graded_by       UUID REFERENCES app.users(id),
  graded_at       TIMESTAMPTZ
);
COMMENT ON TABLE app.academy_assignments IS '🎓 Devoirs soumis par les étudiants.';

-- ════════════════════════════════════════════
-- 💳 ABONNEMENTS & PAIEMENTS
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.subscription_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,                      -- 'Gratuit', 'Premium', 'Famille'
  price_cents     INT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'EUR',
  interval        TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features        JSONB NOT NULL DEFAULT '[]',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS app.subscriptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  plan_id         UUID NOT NULL REFERENCES app.subscription_plans(id),
  status          TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'expired', 'trialing')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL,
  stripe_sub_id   TEXT,                               -- ID Stripe (jamais commité en clair)
  CONSTRAINT uq_active_sub UNIQUE (user_id, status)
);

CREATE TABLE IF NOT EXISTS app.payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id),
  subscription_id UUID REFERENCES app.subscriptions(id),
  amount_cents    INT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'EUR',
  status          TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'refunded')),
  payment_method  TEXT,
  stripe_payment_id TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.payments IS '💳 Historique des paiements. Clés Stripe dans .env, jamais ici.';

-- ════════════════════════════════════════════
-- 🔒 PERMISSIONS — ZONE APPLICATIVE
-- app_user a tous les droits
-- ════════════════════════════════════════════

GRANT USAGE ON SCHEMA app TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA app
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ════════════════════════════════════════════
-- 📑 INDEX — PERFORMANCES
-- ════════════════════════════════════════════

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON app.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON app.users(role);

-- Quran progress
CREATE INDEX IF NOT EXISTS idx_quran_progress_user ON app.user_quran_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_memo_user ON app.user_quran_memorization(user_id);
CREATE INDEX IF NOT EXISTS idx_quran_memo_review ON app.user_quran_memorization(next_review_at);

-- Social posts
CREATE INDEX IF NOT EXISTS idx_posts_user ON app.social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON app.social_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created ON app.social_posts(created_at DESC);

-- Social follows
CREATE INDEX IF NOT EXISTS idx_follows_follower ON app.social_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON app.social_follows(following_id);

-- Academy
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON app.academy_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON app.academy_enrollments(course_id);

-- Favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON app.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON app.user_favorites(content_type, content_id);
