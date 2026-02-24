-- ============================================================
-- 005_app_extras.sql
-- 🌟 Extensions zone applicative
-- Inspiré du travail de Bilal (PR dev/bilal/schema-bdd) :
--   - Réactions halal (MashAllah, BarakAllah...) au lieu du "like" vide
--   - Badges islamiques
--   - Streaks de mémorisation/lecture
-- Décision du 2026-02-24 : intégrées dans l'architecture 3 schémas (Option A)
-- ============================================================

-- ════════════════════════════════════════════
-- 🤲 RÉACTIONS HALAL (idée Bilal)
-- Remplace le "like" vide par des réactions à sens islamique
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.reaction_types (
  id          SERIAL PRIMARY KEY,
  key         TEXT NOT NULL UNIQUE,               -- 'mashallah', 'barakallah', 'ameen', 'jazakallah'
  label_ar    TEXT NOT NULL,                      -- ما شاء الله
  label_fr    TEXT NOT NULL,                      -- MashAllah
  emoji       TEXT NOT NULL,                      -- 🌟
  description_fr TEXT,                            -- Explication du sens
  display_order SMALLINT NOT NULL DEFAULT 0
);
COMMENT ON TABLE app.reaction_types IS '🤲 Types de réactions halal (MashAllah, BarakAllah...). Pas de "like" vide.';

-- Insérer les réactions islamiques de base
INSERT INTO app.reaction_types (key, label_ar, label_fr, emoji, description_fr, display_order) VALUES
  ('mashallah',   'ما شاء الله',     'MashAllah',    '🌟', 'Ce qu''Allah a voulu — pour exprimer admiration et gratitude',    1),
  ('barakallah',  'بارك الله فيك',   'BarakAllah',   '🤲', 'Qu''Allah te bénisse — pour remercier quelqu''un',               2),
  ('ameen',       'آمين',            'Ameen',        '🌙', 'Amen — pour approuver une dou''a ou un rappel',                  3),
  ('jazakallah',  'جزاك الله خيرًا', 'JazakAllah',   '💚', 'Qu''Allah te récompense — pour exprimer de la gratitude',       4),
  ('subhanallah', 'سبحان الله',      'SubhanAllah',  '✨', 'Gloire à Allah — pour exprimer émerveillement',                  5)
ON CONFLICT (key) DO NOTHING;

-- Réactions sur les posts
CREATE TABLE IF NOT EXISTS app.social_reactions (
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  post_id         UUID NOT NULL REFERENCES app.social_posts(id) ON DELETE CASCADE,
  reaction_type   TEXT NOT NULL REFERENCES app.reaction_types(key),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);
COMMENT ON TABLE app.social_reactions IS '🤲 Réactions halal sur les posts (MashAllah, BarakAllah...).';

CREATE INDEX IF NOT EXISTS idx_reactions_post ON app.social_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_type ON app.social_reactions(reaction_type);

-- ════════════════════════════════════════════
-- 🏅 BADGES ISLAMIQUES (idée Bilal)
-- Récompenses pour la mémorisation, la lecture, la progression
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.badges (
  id              SERIAL PRIMARY KEY,
  key             TEXT NOT NULL UNIQUE,
  name_arabic     TEXT NOT NULL,
  name_french     TEXT NOT NULL,
  description_fr  TEXT NOT NULL,
  icon_url        TEXT,
  category        TEXT NOT NULL CHECK (category IN ('quran', 'hadith', 'mutun', 'social', 'academy', 'streak')),
  condition_type  TEXT NOT NULL,                  -- 'ayahs_memorized', 'surahs_read', 'streak_days'...
  condition_value INT NOT NULL,                   -- Valeur seuil (ex: 10 pour "10 versets mémorisés")
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE app.badges IS '🏅 Badges islamiques pour la progression.';

-- Badges initiaux
INSERT INTO app.badges (key, name_arabic, name_french, description_fr, category, condition_type, condition_value) VALUES
  ('al_fatiha',       'الفاتحة',        'Al-Fatiha',         'A mémorisé Sourate Al-Fatiha',                  'quran',   'surahs_memorized', 1),
  ('juz_amma',        'جزء عمّ',        'Juz Amma',          'A mémorisé le 30e Juz (Juz Amma)',              'quran',   'juz_memorized',    30),
  ('half_quran',      'نصف القرآن',     'Moitié du Coran',   'A mémorisé 15 Juz',                             'quran',   'juz_memorized',    15),
  ('hafiz',           'حافظ القرآن',    'Hafiz',             'A mémorisé le Coran entier (30 Juz)',           'quran',   'juz_memorized',    30),
  ('ajrumiyya',       'الآجرومية',      'Al-Ajrumiyya',      'A mémorisé le Matn Al-Ajrumiyya (Nahw)',        'mutun',   'matn_memorized',   1),
  ('streak_7',        '7 أيام',         '7 jours',           'A maintenu un streak de 7 jours',               'streak',  'streak_days',      7),
  ('streak_30',       '30 يومًا',       '30 jours',          'A maintenu un streak de 30 jours',              'streak',  'streak_days',      30),
  ('streak_100',      '100 يوم',        '100 jours',         'A maintenu un streak de 100 jours',             'streak',  'streak_days',      100),
  ('first_share',     'أول مشاركة',     'Première prière',   'A partagé son premier rappel islamique',        'social',  'posts_shared',     1),
  ('course_complete', 'إتمام الدرس',    'Cours terminé',     'A terminé son premier cours à l''académie',     'academy', 'courses_completed',1)
ON CONFLICT (key) DO NOTHING;

-- Badges débloqués par utilisateur
CREATE TABLE IF NOT EXISTS app.user_badges (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES app.users(id) ON DELETE CASCADE,
  badge_id        INT NOT NULL REFERENCES app.badges(id),
  unlocked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_badge UNIQUE (user_id, badge_id)
);
COMMENT ON TABLE app.user_badges IS '🏅 Badges débloqués par chaque utilisateur.';

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON app.user_badges(user_id);

-- ════════════════════════════════════════════
-- 🔥 STREAKS (idée Bilal)
-- Suivi de la régularité de lecture/mémorisation
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS app.user_streaks (
  user_id             UUID PRIMARY KEY REFERENCES app.users(id) ON DELETE CASCADE,
  current_streak      INT NOT NULL DEFAULT 0,     -- Streak actuel (jours consécutifs)
  longest_streak      INT NOT NULL DEFAULT 0,     -- Record personnel
  last_activity_date  DATE,                       -- Dernière date d'activité
  streak_type         TEXT NOT NULL DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly')),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE app.user_streaks IS '🔥 Streaks de régularité islamique (lecture, mémorisation).';

-- ════════════════════════════════════════════
-- 🔒 PERMISSIONS
-- ════════════════════════════════════════════

GRANT SELECT ON app.reaction_types TO app_user;
GRANT SELECT ON app.badges TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.social_reactions TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_badges TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_streaks TO app_user;
