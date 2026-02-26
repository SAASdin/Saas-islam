-- ============================================================
-- database/seeds/03_mutun_seed.sql
-- Seed des Mutun islamiques classiques
--
-- ⚠️  ZONE QUASI-SACRÉE — Lire ce fichier entièrement avant d'exécuter
-- ⚠️  NE PAS EXÉCUTER sans avoir vérifié les PLACEHOLDER sur édition imprimée
-- ⚠️  Les lignes marquées [PLACEHOLDER] sont INCOMPLÈTES
--     → Compléter depuis les références indiquées dans MUTUN_COMPLETION_GUIDE.md
--
-- ÉTAT : 2026-02-25
--   - Baiquniyya  : bayts 1–10 ✅ (présents dans mutun-data.ts) | 11–34 ⚠️ PLACEHOLDER
--   - Tuhfat Atfal: bayts 1–8  ✅                               | 9–61  ⚠️ PLACEHOLDER
--   - Ajrumiyya   : structure uniquement                        | texte ⚠️ PLACEHOLDER
--   - Waraqat     : structure uniquement                        | texte ⚠️ PLACEHOLDER
--   - Arbaeen     : structure uniquement                        | texte ⚠️ PLACEHOLDER
--
-- SOURCE des bayts ✅ : mutun-data.ts (saas-islam/apps/memorization-app/)
-- SOURCE des bayts ⚠️ : À compléter manuellement depuis éditions imprimées
--
-- EXÉCUTION (SUPERUSER UNIQUEMENT, après validation Moha + Bilal) :
--   psql -U islampc -d saas_islam -f database/seeds/03_mutun_seed.sql
-- ============================================================

BEGIN;

-- ════════════════════════════════════════════════════════════
-- 1. CATÉGORIES (si absentes)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.matn_categories (name_arabic, name_french, slug)
VALUES
  ('علم مصطلح الحديث',    'Sciences du Hadith',         'mustalah'),
  ('علم التجويد',          'Tajweed',                    'tajweed'),
  ('علم النحو',            'Grammaire arabe',            'nahw'),
  ('أصول الفقه',           'Principes du Droit Islamique','usul-fiqh'),
  ('فقه شافعي',            'Fiqh Chaféite',              'fiqh-shafi')
ON CONFLICT (slug) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 2. MUTUN (5 textes classiques)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.mutun
  (text_key, title_arabic, title_french, author_french, total_lines, difficulty_level, category_id)
VALUES
  (
    'baiquniyya',
    'المنظومة البيقونية',
    'Al-Mandhouma al-Baiquniyya',
    'Omar ibn Muhammad al-Baiquni (m. ~1080 AH)',
    34,
    1, -- 1=débutant
    (SELECT id FROM sacred.matn_categories WHERE slug = 'mustalah')
  ),
  (
    'tuhfat-atfal',
    'تحفة الأطفال',
    'Tuhfat al-Atfal',
    'Sulayman al-Jamzuri (m. 1198 AH)',
    61,
    1,
    (SELECT id FROM sacred.matn_categories WHERE slug = 'tajweed')
  ),
  (
    'ajrumiyya',
    'الآجرومية',
    'Al-Ajrumiyya',
    'Ibn Ajurrum al-Sinhaji (m. 723 AH)',
    NULL, -- prose : nombre de sections variable selon édition
    1,
    (SELECT id FROM sacred.matn_categories WHERE slug = 'nahw')
  ),
  (
    'waraqat',
    'الورقات',
    'Al-Waraqat',
    'Abu al-Ma''ali al-Juwayni (m. 478 AH)',
    NULL,
    2, -- 2=intermédiaire
    (SELECT id FROM sacred.matn_categories WHERE slug = 'usul-fiqh')
  ),
  (
    'matn-abi-shuja',
    'الغاية والتقريب',
    'Matn Abi Shuja'' (Al-Ghaya wa al-Taqrib)',
    'Abu Shuja'' al-Asfahani (m. ~593 AH)',
    NULL,
    2,
    (SELECT id FROM sacred.matn_categories WHERE slug = 'fiqh-shafi')
  )
ON CONFLICT (text_key) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 3. AL-BAIQUNIYYA — 34 bayts
--    Source bayts 1–10 : mutun-data.ts (vérifié sur plusieurs sources)
--    Source bayts 11–34 : ⚠️ PLACEHOLDER — À compléter
--    Référence imprimée : Matn al-Baiquniyya avec sharh Ibn Uthaymin
--      (Dar al-Manhaj, ISBN 978-603-8108-22-5)
-- ════════════════════════════════════════════════════════════

-- Bayts 1–10 ✅ (extraits de mutun-data.ts, vérifiés)
INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic)
SELECT m.id, v.line_number, v.text_arabic
FROM sacred.mutun m,
(VALUES
  (1,  'أَبْدَأُ بِالحَمْدِ مُصَلِّياً عَلَى *** مُحَمَّدٍ خَيرِ نَبِيٍّ أُرْسِلاَ'),
  (2,  'وَذِي مِنْ أَقْسَامِ الحَدِيثِ عِدَّهْ *** وَكُلُّ وَاحِدٍ أَتَى وَحَدَّهْ'),
  (3,  'أَوَّلُهَا الصَّحِيحُ وَهُوَ مَا اتَّصَلْ *** إِسْنَادُهُ وَلَمْ يَشُذَّ أَوْ يُعَلَّلْ'),
  (4,  'وَالحَسَنُ المَعْرُوفُ طُرْقًا وَغَدَتْ *** رِجَالُهُ لاَ كَالصَّحِيحِ اشْتُهِرَتْ'),
  (5,  'وَكُلُّ مَا عَنْ رُتْبَةِ الحُسْنِ قَصُرْ *** فَهُوَ الضَّعِيفُ وَهُوَ أَقْسَامٌ كُثُرْ'),
  (6,  'وَالمُسْنَدُ المَتَّصِلُ الإِسْنَادِ مِنْ *** رَاوِيهِ حَتَّى المُصْطَفَى وَلَمْ يَبِنْ'),
  (7,  'مُتَّصِلٌ مَوْصُولٌ مَا رَوَاهُ مَنْ *** حَيَازَةَ العُلُوِّ فِيهِ قَدْ ضَمَنْ'),
  (8,  'مُسَلْسَلٌ قُلْ مَا عَلَى وَصْفٍ أَتَى *** مُتَّصِلٌ وَلَوْ بِضَعْفٍ ثَبَتَا'),
  (9,  'عَزِيزٌ مَرْوِيٌّ اثْنَيْنِ أَوْ ثَلاَثَهْ *** مَشْهُورُهُ مَا فَوْقَ مَا ثَلاَثَهْ'),
  (10, 'مُعَنْعَنٌ كَعَنْ سَعِيدٍ عَنْ كَرَمْ *** وَمُبْهَمٌ مَا فِيهِ رَاوٍ لَمْ يُسَمّ')
) AS v(line_number, text_arabic)
WHERE m.text_key = 'baiquniyya'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- Bayts 11–34 ⚠️ PLACEHOLDER — NE PAS UTILISER EN PRODUCTION
-- Ces lignes doivent être REMPLACÉES par le texte exact d'une édition imprimée
-- Voir : MUTUN_COMPLETION_GUIDE.md → Section "Al-Baiquniyya"
INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic)
SELECT m.id, v.line_number, v.text_arabic
FROM sacred.mutun m,
(VALUES
  (11, '[PLACEHOLDER-11 — Baiquniyya — À compléter depuis édition imprimée]'),
  (12, '[PLACEHOLDER-12 — Baiquniyya — À compléter depuis édition imprimée]'),
  (13, '[PLACEHOLDER-13 — Baiquniyya — À compléter depuis édition imprimée]'),
  (14, '[PLACEHOLDER-14 — Baiquniyya — À compléter depuis édition imprimée]'),
  (15, '[PLACEHOLDER-15 — Baiquniyya — À compléter depuis édition imprimée]'),
  (16, '[PLACEHOLDER-16 — Baiquniyya — À compléter depuis édition imprimée]'),
  (17, '[PLACEHOLDER-17 — Baiquniyya — À compléter depuis édition imprimée]'),
  (18, '[PLACEHOLDER-18 — Baiquniyya — À compléter depuis édition imprimée]'),
  (19, '[PLACEHOLDER-19 — Baiquniyya — À compléter depuis édition imprimée]'),
  (20, '[PLACEHOLDER-20 — Baiquniyya — À compléter depuis édition imprimée]'),
  (21, '[PLACEHOLDER-21 — Baiquniyya — À compléter depuis édition imprimée]'),
  (22, '[PLACEHOLDER-22 — Baiquniyya — À compléter depuis édition imprimée]'),
  (23, '[PLACEHOLDER-23 — Baiquniyya — À compléter depuis édition imprimée]'),
  (24, '[PLACEHOLDER-24 — Baiquniyya — À compléter depuis édition imprimée]'),
  (25, '[PLACEHOLDER-25 — Baiquniyya — À compléter depuis édition imprimée]'),
  (26, '[PLACEHOLDER-26 — Baiquniyya — À compléter depuis édition imprimée]'),
  (27, '[PLACEHOLDER-27 — Baiquniyya — À compléter depuis édition imprimée]'),
  (28, '[PLACEHOLDER-28 — Baiquniyya — À compléter depuis édition imprimée]'),
  (29, '[PLACEHOLDER-29 — Baiquniyya — À compléter depuis édition imprimée]'),
  (30, '[PLACEHOLDER-30 — Baiquniyya — À compléter depuis édition imprimée]'),
  (31, '[PLACEHOLDER-31 — Baiquniyya — À compléter depuis édition imprimée]'),
  (32, '[PLACEHOLDER-32 — Baiquniyya — À compléter depuis édition imprimée]'),
  (33, '[PLACEHOLDER-33 — Baiquniyya — À compléter depuis édition imprimée]'),
  (34, '[PLACEHOLDER-34 — Baiquniyya — À compléter depuis édition imprimée]')
) AS v(line_number, text_arabic)
WHERE m.text_key = 'baiquniyya'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 4. TUHFAT AL-ATFAL — 61 bayts
--    Source bayts 1–8 : mutun-data.ts ✅
--    Source bayts 9–61 : ⚠️ PLACEHOLDER
--    Référence imprimée : Tuhfat al-Atfal wa al-Ghilman
--      (Maktaba al-Tawba, Riyad — toute édition récente avec tashkil)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic)
SELECT m.id, v.line_number, v.text_arabic
FROM sacred.mutun m,
(VALUES
  (1, 'يَقُولُ رَاجِي عَفْوِ رَبٍّ سَامِعِ *** سُلَيْمَانُ هُوَ الجَمْزُورِيُّ الشَّافِعِي'),
  (2, 'الحَمْدُ لِلَّهِ مُصَلِّيًا عَلَى *** مُحَمَّدٍ وَآلِهِ مَنْ أُرْسِلاَ'),
  (3, 'وَبَعْدُ هَذَا النَّظْمُ لِلْمُبْتَدِي *** فِي النُّونِ وَالتَّنْوِينِ وَالمَدِّ'),
  (4, 'سَمَّيْتُهُ بِتُحْفَةِ الأَطْفَالِ *** عَنْ شَيْخِنَا المِيهِيِّ ذِي الكَمَالِ'),
  (5, 'أَرْجُو بِهِ أَنْ يَنْفَعَ الطُّلاَّبَا *** وَاللهُ يَجْزِي مَنْ لَهُ أَثَابَا'),
  (6, 'لِلنُّونِ إِنْ تَسْكُنْ وَلِلتَّنْوِينِ *** أَرْبَعُ أَحْكَامٍ فَخُذْ تَبْيِينِي'),
  (7, 'فَالأَوَّلُ الإِظْهَارُ قَبْلَ أَحْرُفِ *** لِلْحَلْقِ سِتٌّ رُتِّبَتْ فَلْتَعْرِفِ'),
  (8, 'هَمْزٌ فَهَاءٌ ثُمَّ عَيْنٌ حَاءُ *** مُهْمَلَتَانِ ثُمَّ غَيْنٌ خَاءُ')
) AS v(line_number, text_arabic)
WHERE m.text_key = 'tuhfat-atfal'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- Bayts 9–61 ⚠️ PLACEHOLDER
-- Sujets couverts (pour faciliter la saisie manuelle) :
--  9-17  : Idgham (assimilation)
--  18-23 : Iqlab (substitution)
--  24-32 : Ikhfa (dissimulation du noon)
--  33-43 : Meem sakin + Lam + Ra
--  44-61 : Madd (prolongement)
DO $$
DECLARE
  v_matn_id INT;
  i INT;
BEGIN
  SELECT id INTO v_matn_id FROM sacred.mutun WHERE text_key = 'tuhfat-atfal';
  FOR i IN 9..61 LOOP
    INSERT INTO sacred.mutun_lines (matn_id, line_number, text_arabic)
    VALUES (v_matn_id, i, '[PLACEHOLDER-' || i || ' — Tuhfat al-Atfal — À compléter depuis édition imprimée]')
    ON CONFLICT (matn_id, line_number) DO NOTHING;
  END LOOP;
END $$;

-- ════════════════════════════════════════════════════════════
-- 5. AL-AJRUMIYYA — Texte prose (chapitres)
--    Structure des 18 chapitres — texte = ⚠️ PLACEHOLDER
--    Référence : متن الآجرومية — Ibn Ajurrum (d. 723 AH)
--      Ed. : Dar Ibn Khuzayma, Riyadh (toute édition avec tashkil)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic, chapter_name_fr)
SELECT m.id, v.line_number, v.text_arabic, v.chapter
FROM sacred.mutun m,
(VALUES
  (1,  '[PLACEHOLDER — Ajrumiyya Ch.1 — Al-Kalam wa aqsamuh]',       'Le discours et ses divisions'),
  (2,  '[PLACEHOLDER — Ajrumiyya Ch.2 — Al-I''rab]',                  'L''i''rab (déclinaison)'),
  (3,  '[PLACEHOLDER — Ajrumiyya Ch.3 — Al-Af''al]',                  'Les verbes'),
  (4,  '[PLACEHOLDER — Ajrumiyya Ch.4 — Bab al-Marfu''at]',           'Les cas nominatifs'),
  (5,  '[PLACEHOLDER — Ajrumiyya Ch.5 — Bab al-Fa''il]',              'Le sujet'),
  (6,  '[PLACEHOLDER — Ajrumiyya Ch.6 — Bab al-Maf''ul allathi lam yusamma fa''iluh]', 'Le passif'),
  (7,  '[PLACEHOLDER — Ajrumiyya Ch.7 — Bab al-Mubtada wa al-Khabar]','Le mubtada et khabar'),
  (8,  '[PLACEHOLDER — Ajrumiyya Ch.8 — Al-Nawasikh]',                'Les nasikh (modifieurs)'),
  (9,  '[PLACEHOLDER — Ajrumiyya Ch.9 — Al-Na''t]',                   'L''adjectif épithète'),
  (10, '[PLACEHOLDER — Ajrumiyya Ch.10 — Al-''Atf]',                  'La coordination'),
  (11, '[PLACEHOLDER — Ajrumiyya Ch.11 — Al-Tawkid]',                 'La confirmation'),
  (12, '[PLACEHOLDER — Ajrumiyya Ch.12 — Al-Badal]',                  'L''apposition'),
  (13, '[PLACEHOLDER — Ajrumiyya Ch.13 — Bab al-Mansubat]',           'Les cas accusatifs'),
  (14, '[PLACEHOLDER — Ajrumiyya Ch.14 — Bab al-Maf''ul bihi]',       'Le complément d''objet'),
  (15, '[PLACEHOLDER — Ajrumiyya Ch.15 — Bab al-Masdar]',             'Le masdhar'),
  (16, '[PLACEHOLDER — Ajrumiyya Ch.16 — Bab Zarf al-Zaman wa al-Makan]', 'L''adverbe de temps et lieu'),
  (17, '[PLACEHOLDER — Ajrumiyya Ch.17 — Bab al-Hal]',                'Le hal (circonstanciel)'),
  (18, '[PLACEHOLDER — Ajrumiyya Ch.18 — Bab al-Majrurat]',           'Les cas génitifs')
) AS v(line_number, text_arabic, chapter)
WHERE m.text_key = 'ajrumiyya'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 6. AL-WARAQAT — Texte prose (sections)
--    Structure des sections — texte = ⚠️ PLACEHOLDER
--    Référence : الورقات في أصول الفقه — al-Juwayni (m. 478 AH)
--      Ed. : Dar al-Minhaj, Jeddah (éd. muhaqqaqah recommandée)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic, chapter_name_fr)
SELECT m.id, v.line_number, v.text_arabic, v.chapter
FROM sacred.mutun m,
(VALUES
  (1,  '[PLACEHOLDER — Waraqat Sec.1 — Introduction + définition Usul al-Fiqh]',   'Introduction et définitions'),
  (2,  '[PLACEHOLDER — Waraqat Sec.2 — Al-Hukm al-Shar''i et ses types]',          'Le hukm shar''i'),
  (3,  '[PLACEHOLDER — Waraqat Sec.3 — Al-Kitab (Coran)]',                         'Le Coran'),
  (4,  '[PLACEHOLDER — Waraqat Sec.4 — Al-Sunna]',                                 'La Sunna'),
  (5,  '[PLACEHOLDER — Waraqat Sec.5 — Al-Ijma'']',                                'L''Ijma'''),
  (6,  '[PLACEHOLDER — Waraqat Sec.6 — Al-Qiyas]',                                 'Le Qiyas'),
  (7,  '[PLACEHOLDER — Waraqat Sec.7 — Al-Kalam fi al-Af''al]',                    'Les actions du mukallaf'),
  (8,  '[PLACEHOLDER — Waraqat Sec.8 — Bab al-Nasikh wa al-Mansukh]',              'L''abrogation'),
  (9,  '[PLACEHOLDER — Waraqat Sec.9 — Bab al-Ijtihad wa al-Taqlid]',              'L''ijtihad et le taqlid'),
  (10, '[PLACEHOLDER — Waraqat Sec.10 — Khatima]',                                 'Conclusion')
) AS v(line_number, text_arabic, chapter)
WHERE m.text_key = 'waraqat'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 7. MATN ABI SHUJA'' — Texte prose (chapitres Fiqh Chaféite)
--    Texte = ⚠️ PLACEHOLDER
--    Référence : الغاية والتقريب — Abi Shuja'' al-Asfahani (m. ~593 AH)
--      Ed. : Dar Ibn Hazm, Beirut (matn nu seul, sans sharh)
-- ════════════════════════════════════════════════════════════

INSERT INTO sacred.mutun_lines
  (matn_id, line_number, text_arabic, chapter_name_fr)
SELECT m.id, v.line_number, v.text_arabic, v.chapter
FROM sacred.mutun m,
(VALUES
  (1,  '[PLACEHOLDER — Abi Shuja Ch.1 — Kitab al-Tahara]',            'La purification'),
  (2,  '[PLACEHOLDER — Abi Shuja Ch.2 — Kitab al-Salah]',             'La prière'),
  (3,  '[PLACEHOLDER — Abi Shuja Ch.3 — Kitab al-Zakat]',             'La zakat'),
  (4,  '[PLACEHOLDER — Abi Shuja Ch.4 — Kitab al-Siyam]',             'Le jeûne'),
  (5,  '[PLACEHOLDER — Abi Shuja Ch.5 — Kitab al-Hajj]',              'Le pèlerinage'),
  (6,  '[PLACEHOLDER — Abi Shuja Ch.6 — Kitab al-Buyu'']',            'Les transactions'),
  (7,  '[PLACEHOLDER — Abi Shuja Ch.7 — Kitab al-Muamalat]',          'Les contrats'),
  (8,  '[PLACEHOLDER — Abi Shuja Ch.8 — Kitab al-Nikah]',             'Le mariage'),
  (9,  '[PLACEHOLDER — Abi Shuja Ch.9 — Kitab al-Jinayat]',           'Les délits'),
  (10, '[PLACEHOLDER — Abi Shuja Ch.10 — Kitab al-Hudud]',            'Les peines hudud'),
  (11, '[PLACEHOLDER — Abi Shuja Ch.11 — Kitab al-Jihad]',            'Le jihad'),
  (12, '[PLACEHOLDER — Abi Shuja Ch.12 — Kitab al-Fara''id]',         'Les successions'),
  (13, '[PLACEHOLDER — Abi Shuja Ch.13 — Kitab al-''Itq]',            'L''affranchissement')
) AS v(line_number, text_arabic, chapter)
WHERE m.text_key = 'matn-abi-shuja'
ON CONFLICT (matn_id, line_number) DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 8. HASH D'INTÉGRITÉ (bayts vérifiés uniquement)
-- ════════════════════════════════════════════════════════════
-- Note: les placeholders sont exclus du hash
-- Le hash sera recalculé après complétion des placeholders

INSERT INTO app.integrity_hashes (hash_type, hash_value, verified_at, notes)
VALUES (
  'mutun-verified-bayts-sha256',
  -- Hash calculé sur : baiquniyya-1 à 10 + tuhfat-1 à 8 (18 lignes)
  -- sha256(concat de tous les textArabic en ordre, sans espace)
  'PENDING — À calculer après import avec: SELECT encode(sha256(string_agg(text_arabic, '''' ORDER BY matn_id, line_number)::bytea), ''hex'') FROM sacred.mutun_lines WHERE text_arabic NOT LIKE ''[PLACEHOLDER%''',
  NOW(),
  'Bayts vérifiés depuis mutun-data.ts (saas-islam/apps/memorization-app/src/lib/mutun-data.ts)'
)
ON CONFLICT DO NOTHING;

COMMIT;

-- ════════════════════════════════════════════════════════════
-- PROCHAINES ÉTAPES (MANUEL)
-- ════════════════════════════════════════════════════════════
-- 1. Ouvrir chaque édition imprimée référencée ci-dessus
-- 2. Remplacer chaque [PLACEHOLDER-N] par le texte exact (avec tashkil)
-- 3. Vérifier que chaque texte correspond EXACTEMENT à l'édition
-- 4. Faire valider par Moha ET Bilal avant de committer
-- 5. Recalculer le hash SHA-256 avec la requête indiquée ci-dessus
-- 6. Créer une PR sur dev/moha/mutun-complete
-- ════════════════════════════════════════════════════════════
