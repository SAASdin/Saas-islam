-- ============================================================
-- 005_applicative_zone_progress.sql
-- 🔓 ZONE APPLICATIVE — PROGRESSION & MÉMORISATION
-- ============================================================

-- ── Progression de lecture Coran ─────────────────────────
CREATE TABLE user_reading_progress (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_surah      SMALLINT NOT NULL REFERENCES quran_surahs(id),
  last_ayah       SMALLINT NOT NULL,
  total_ayahs_read INTEGER DEFAULT 0,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ── Mémorisation du Coran ────────────────────────────────
CREATE TABLE user_quran_memorization (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ayah_id         INTEGER NOT NULL REFERENCES quran_ayahs(id),
  status          TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'memorized', 'review_needed')),
  strength        SMALLINT DEFAULT 0 CHECK (strength BETWEEN 0 AND 5),  -- Force de mémorisation
  next_review_at  TIMESTAMPTZ,               -- Prochaine révision (SRS)
  review_count    INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE (user_id, ayah_id)
);

-- ── Mémorisation des Mutun ───────────────────────────────
CREATE TABLE user_mutun_memorization (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matn_line_id    INTEGER NOT NULL REFERENCES mutun_lines(id),
  status          TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN ('not_started', 'in_progress', 'memorized', 'review_needed')),
  strength        SMALLINT DEFAULT 0 CHECK (strength BETWEEN 0 AND 5),
  next_review_at  TIMESTAMPTZ,
  review_count    INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  UNIQUE (user_id, matn_line_id)
);

-- ── Streaks (jours consécutifs) ───────────────────────────
CREATE TABLE user_streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type   TEXT NOT NULL CHECK (activity_type IN ('reading', 'memorization', 'academy')),
  current_streak  INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_activity_date DATE,
  UNIQUE (user_id, activity_type)
);

-- ── Badges islamiques ────────────────────────────────────
CREATE TABLE badges (
  id              SERIAL PRIMARY KEY,
  name_fr         TEXT NOT NULL,
  description_fr  TEXT NOT NULL,
  icon_url        TEXT,
  requirement     TEXT NOT NULL                  -- Description de la condition
);

CREATE TABLE user_badges (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id        INTEGER NOT NULL REFERENCES badges(id),
  earned_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ── Données initiales : badges
INSERT INTO badges (name_fr, description_fr, requirement) VALUES
  ('Premier verset', 'Premier verset mémorisé', 'Mémoriser 1 verset'),
  ('Juz Amma', 'Juz 30 mémorisé', 'Mémoriser les 37 sourates du 30ème Juz'),
  ('Al-Fatiha', 'Sourate Al-Fatiha mémorisée', 'Mémoriser Al-Fatiha'),
  ('Lecteur assidu', '7 jours consécutifs de lecture', 'Streak de lecture 7 jours'),
  ('Mémorisateur', 'Première mémorisation complète d''une sourate', 'Mémoriser une sourate entière');
