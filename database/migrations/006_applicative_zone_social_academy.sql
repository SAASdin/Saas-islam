-- ============================================================
-- 006_applicative_zone_social_academy.sql
-- 🔓 ZONE APPLICATIVE — SOCIAL HALAL & ACADÉMIE
-- ============================================================

-- ════════════════════════════════════════════════
-- SOCIAL HALAL
-- ════════════════════════════════════════════════

-- ── Relations (abonnements entre utilisateurs) ───────────
CREATE TABLE social_follows (
  follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ── Posts ─────────────────────────────────────────────────
CREATE TABLE social_posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL
                  CHECK (content_type IN ('text', 'ayah_share', 'hadith_share', 'memorization', 'video', 'audio')),
  caption         TEXT,
  text_content    TEXT,                          -- Pour les posts texte
  media_url       TEXT,                          -- URL vidéo/audio sur R2
  -- Référence optionnelle au contenu religieux partagé
  ref_ayah_id     INTEGER REFERENCES quran_ayahs(id),
  ref_hadith_id   INTEGER REFERENCES hadiths(id),
  is_published    BOOLEAN DEFAULT TRUE,
  is_moderated    BOOLEAN DEFAULT FALSE,         -- Vérifié par un modérateur
  moderation_flag TEXT,                          -- Raison si signalé
  views_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Commentaires ─────────────────────────────────────────
CREATE TABLE social_comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  is_hidden       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Likes / Réactions (halal — pas de "like" vide) ───────
CREATE TABLE social_reactions (
  post_id         UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction        TEXT NOT NULL
                  CHECK (reaction IN ('mashallah', 'barakallah', 'ameen', 'jazakallah')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- ── Signalements ─────────────────────────────────────────
CREATE TABLE social_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  post_id         UUID REFERENCES social_posts(id),
  comment_id      UUID REFERENCES social_comments(id),
  reason          TEXT NOT NULL
                  CHECK (reason IN ('haram_content', 'spam', 'misinformation', 'inappropriate', 'other')),
  details         TEXT,
  resolved        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);


-- ════════════════════════════════════════════════
-- ACADÉMIE ISLAMIQUE
-- ════════════════════════════════════════════════

-- ── Cours ─────────────────────────────────────────────────
CREATE TABLE academy_courses (
  id              SERIAL PRIMARY KEY,
  title_fr        TEXT NOT NULL,
  title_ar        TEXT,
  description_fr  TEXT,
  domain          TEXT NOT NULL
                  CHECK (domain IN ('fiqh', 'aqida', 'tafsir', 'hadith', 'arabic', 'seerah', 'other')),
  level           TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  instructor_id   UUID REFERENCES users(id),
  is_published    BOOLEAN DEFAULT FALSE,
  thumbnail_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Leçons ───────────────────────────────────────────────
CREATE TABLE academy_lessons (
  id              SERIAL PRIMARY KEY,
  course_id       INTEGER NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  lesson_number   SMALLINT NOT NULL,
  title_fr        TEXT NOT NULL,
  content_fr      TEXT,
  video_url       TEXT,
  duration_min    SMALLINT,
  UNIQUE (course_id, lesson_number)
);

-- ── Inscriptions ─────────────────────────────────────────
CREATE TABLE academy_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id       INTEGER NOT NULL REFERENCES academy_courses(id),
  enrolled_at     TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, course_id)
);

-- ── Progression dans les cours ───────────────────────────
CREATE TABLE academy_lesson_progress (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id       INTEGER NOT NULL REFERENCES academy_lessons(id),
  completed       BOOLEAN DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  PRIMARY KEY (user_id, lesson_id)
);

-- ── Devoirs ──────────────────────────────────────────────
CREATE TABLE academy_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id),
  lesson_id       INTEGER NOT NULL REFERENCES academy_lessons(id),
  submission_text TEXT,
  submission_url  TEXT,
  submitted_at    TIMESTAMPTZ DEFAULT NOW(),
  grade           SMALLINT CHECK (grade BETWEEN 0 AND 100),
  feedback        TEXT,
  graded_at       TIMESTAMPTZ
);
