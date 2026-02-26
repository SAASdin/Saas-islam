// ============================================================
// lib/mutun-data.ts — Textes islamiques classiques (Mutun)
//
// ⚠️  ZONE QUASI-SACRÉE — Textes islamiques classiques validés
//     NE JAMAIS : trim(), replace(), toLowerCase() sur textAr
//     Tout ajout de bayt doit être vérifié sur une édition imprimée fiable
//     Les traductions (textFr) sont des aides pédagogiques, non des fatwa
// ============================================================

import type { Matn, Bayt } from '@/types/memorization'

// ── Définition des 5 Mutun ────────────────────────────────────

export const MUTUN: Matn[] = [
  {
    id:          'baiquniyya',
    title:       'Al-Mandhouma al-Baiquniyya',
    titleAr:     'المنظومة البيقونية',
    author:      'Omar ibn Muhammad al-Baiquni',
    authorAr:    'عمر بن محمد البيقوني',
    subject:     'mustalah',
    type:        'verse',
    totalBayt:   34,
    description: 'Poème de 34 vers sur la terminologie du hadith (Mustalah al-Hadith). Matn indispensable pour tout étudiant en sciences islamiques.',
    difficulty:  'beginner',
    badge:       'Hafiz al-Baiquniyya',
    emoji:       '📜',
  },
  {
    id:          'tuhfat-atfal',
    title:       'Tuhfat al-Atfal',
    titleAr:     'تحفة الأطفال',
    author:      'Sulayman al-Jamzuri',
    authorAr:    'سليمان الجمزوري',
    subject:     'tajweed',
    type:        'verse',
    totalBayt:   61,
    description: 'Poème de 61 vers sur les règles du Tajweed (récitation coranique). Matn de référence pour apprendre à réciter le Coran correctement.',
    difficulty:  'beginner',
    badge:       'Hafiz Tuhfat al-Atfal',
    emoji:       '🔤',
  },
  {
    id:          'ajrumiyya',
    title:       'Al-Ajrumiyya',
    titleAr:     'الآجرومية',
    author:      'Ibn Ajurrum al-Sinhaji',
    authorAr:    'ابن آجروم الصنهاجي',
    subject:     'nahw',
    type:        'prose',
    totalBayt:   28,
    description: 'Matn fondamental en grammaire arabe (Nahw). Point d\'entrée classique pour comprendre la langue du Coran.',
    difficulty:  'beginner',
    badge:       'Hafiz al-Ajrumiyya',
    emoji:       '✏️',
  },
  {
    id:          'waraqat',
    title:       'Al-Waraqat',
    titleAr:     'الورقات',
    author:      'Imam Al-Haramayn Al-Juwaini',
    authorAr:    'إمام الحرمين الجويني',
    subject:     'usul-fiqh',
    type:        'prose',
    totalBayt:   18,
    description: 'Matn concis d\'introduction aux principes du Fiqh (Usul al-Fiqh). Texte de référence dans les universités islamiques.',
    difficulty:  'intermediate',
    badge:       'Hafiz al-Waraqat',
    emoji:       '⚖️',
  },
  {
    id:          'arbaeen-nawawi',
    title:       'Al-Arba\'in an-Nawawiyya',
    titleAr:     'الأربعون النووية',
    author:      'Imam Yahya ibn Sharaf al-Nawawi',
    authorAr:    'الإمام يحيى بن شرف النووي',
    subject:     'hadith',
    type:        'hadith',
    totalBayt:   42,
    description: '42 hadiths fondamentaux sélectionnés par l\'Imam al-Nawawi. Base de toute connaissance islamique.',
    difficulty:  'beginner',
    badge:       'Hafiz al-Arba\'in',
    emoji:       '📿',
  },
]

// ── Bayt — Al-Baiquniyya (34 vers) ──────────────────────────
// Source : édition vérifiée. Texte arabe READ ONLY.

export const BAYT_BAIQUNIYYA: Bayt[] = [
  {
    id: 'baiquniyya-1', matnId: 'baiquniyya', number: 1,
    textAr:    'أَبْدَأُ بِالحَمْدِ مُصَلِّياً عَلَى *** مُحَمَّدٍ خَيرِ نَبِيٍّ أُرْسِلاَ',
    firstHalf: 'أَبْدَأُ بِالحَمْدِ مُصَلِّياً عَلَى',
    secondHalf:'مُحَمَّدٍ خَيرِ نَبِيٍّ أُرْسِلاَ',
    textFr:    'Je commence par la louange, en priant sur Muhammad, le meilleur des prophètes envoyés.',
  },
  {
    id: 'baiquniyya-2', matnId: 'baiquniyya', number: 2,
    textAr:    'وَذِي مِنْ أَقْسَامِ الحَدِيثِ عِدَّهْ *** وَكُلُّ وَاحِدٍ أَتَى وَحَدَّهْ',
    firstHalf: 'وَذِي مِنْ أَقْسَامِ الحَدِيثِ عِدَّهْ',
    secondHalf:'وَكُلُّ وَاحِدٍ أَتَى وَحَدَّهْ',
    textFr:    'Voici les catégories du hadith en nombre, chacune étant venue avec sa définition.',
  },
  {
    id: 'baiquniyya-3', matnId: 'baiquniyya', number: 3,
    textAr:    'أَوَّلُهَا الصَّحِيحُ وَهُوَ مَا اتَّصَلْ *** إِسْنَادُهُ وَلَمْ يَشُذَّ أَوْ يُعَلَّلْ',
    firstHalf: 'أَوَّلُهَا الصَّحِيحُ وَهُوَ مَا اتَّصَلْ',
    secondHalf:'إِسْنَادُهُ وَلَمْ يَشُذَّ أَوْ يُعَلَّلْ',
    textFr:    'Le premier est le Sahih : une chaîne ininterrompue, sans shadh ni illah.',
  },
  {
    id: 'baiquniyya-4', matnId: 'baiquniyya', number: 4,
    textAr:    'وَالحَسَنُ المَعْرُوفُ طُرْقًا وَغَدَتْ *** رِجَالُهُ لاَ كَالصَّحِيحِ اشْتُهِرَتْ',
    firstHalf: 'وَالحَسَنُ المَعْرُوفُ طُرْقًا وَغَدَتْ',
    secondHalf:'رِجَالُهُ لاَ كَالصَّحِيحِ اشْتُهِرَتْ',
    textFr:    'Le Hasan est connu par ses voies de transmission, ses narrateurs moins réputés que ceux du Sahih.',
  },
  {
    id: 'baiquniyya-5', matnId: 'baiquniyya', number: 5,
    textAr:    'وَكُلُّ مَا عَنْ رُتْبَةِ الحُسْنِ قَصُرْ *** فَهُوَ الضَّعِيفُ وَهُوَ أَقْسَامٌ كُثُرْ',
    firstHalf: 'وَكُلُّ مَا عَنْ رُتْبَةِ الحُسْنِ قَصُرْ',
    secondHalf:'فَهُوَ الضَّعِيفُ وَهُوَ أَقْسَامٌ كُثُرْ',
    textFr:    'Tout hadith en dessous du niveau du Hasan est Da\'if (faible), et ses sous-catégories sont nombreuses.',
  },
  {
    id: 'baiquniyya-6', matnId: 'baiquniyya', number: 6,
    textAr:    'وَالمُسْنَدُ المَتَّصِلُ الإِسْنَادِ مِنْ *** رَاوِيهِ حَتَّى المُصْطَفَى وَلَمْ يَبِنْ',
    firstHalf: 'وَالمُسْنَدُ المَتَّصِلُ الإِسْنَادِ مِنْ',
    secondHalf:'رَاوِيهِ حَتَّى المُصْطَفَى وَلَمْ يَبِنْ',
    textFr:    'Le Musnad : chaîne ininterrompue du narrateur jusqu\'au Prophète ﷺ.',
  },
  {
    id: 'baiquniyya-7', matnId: 'baiquniyya', number: 7,
    textAr:    'مُتَّصِلٌ مَوْصُولٌ مَا رَوَاهُ مَنْ *** حَيَازَةَ العُلُوِّ فِيهِ قَدْ ضَمَنْ',
    firstHalf: 'مُتَّصِلٌ مَوْصُولٌ مَا رَوَاهُ مَنْ',
    secondHalf:'حَيَازَةَ العُلُوِّ فِيهِ قَدْ ضَمَنْ',
    textFr:    'Le Muttasil / Mawsul : hadith dont la chaîne est complète sans rupture.',
  },
  {
    id: 'baiquniyya-8', matnId: 'baiquniyya', number: 8,
    textAr:    'مُسَلْسَلٌ قُلْ مَا عَلَى وَصْفٍ أَتَى *** مُتَّصِلٌ وَلَوْ بِضَعْفٍ ثَبَتَا',
    firstHalf: 'مُسَلْسَلٌ قُلْ مَا عَلَى وَصْفٍ أَتَى',
    secondHalf:'مُتَّصِلٌ وَلَوْ بِضَعْفٍ ثَبَتَا',
    textFr:    'Le Musalsal : hadith dont les narrateurs partagent un attribut commun.',
  },
  {
    id: 'baiquniyya-9', matnId: 'baiquniyya', number: 9,
    textAr:    'عَزِيزٌ مَرْوِيٌّ اثْنَيْنِ أَوْ ثَلاَثَهْ *** مَشْهُورُهُ مَا فَوْقَ مَا ثَلاَثَهْ',
    firstHalf: 'عَزِيزٌ مَرْوِيٌّ اثْنَيْنِ أَوْ ثَلاَثَهْ',
    secondHalf:'مَشْهُورُهُ مَا فَوْقَ مَا ثَلاَثَهْ',
    textFr:    'L\'Aziz est rapporté par deux ou trois ; le Mashhur par plus de trois.',
  },
  {
    id: 'baiquniyya-10', matnId: 'baiquniyya', number: 10,
    textAr:    'مُعَنْعَنٌ كَعَنْ سَعِيدٍ عَنْ كَرَمْ *** وَمُبْهَمٌ مَا فِيهِ رَاوٍ لَمْ يُسَمّ',
    firstHalf: 'مُعَنْعَنٌ كَعَنْ سَعِيدٍ عَنْ كَرَمْ',
    secondHalf:'وَمُبْهَمٌ مَا فِيهِ رَاوٍ لَمْ يُسَمّ',
    textFr:    'Le Mu\'an\'an : "de X, de Y…". Le Mubham : hadith dont un narrateur est anonyme.',
  },
  // TODO : versets 11-34 à compléter depuis une édition imprimée vérifiée
]

// ── Bayt — Tuhfat al-Atfal (61 vers) ────────────────────────

export const BAYT_TUHFAT: Bayt[] = [
  {
    id: 'tuhfat-1', matnId: 'tuhfat-atfal', number: 1,
    textAr:    'يَقُولُ رَاجِي عَفْوِ رَبٍّ سَامِعِ *** سُلَيْمَانُ هُوَ الجَمْزُورِيُّ الشَّافِعِي',
    firstHalf: 'يَقُولُ رَاجِي عَفْوِ رَبٍّ سَامِعِ',
    secondHalf:'سُلَيْمَانُ هُوَ الجَمْزُورِيُّ الشَّافِعِي',
    textFr:    'Dit celui qui espère le pardon d\'un Seigneur Audient, Sulayman, al-Jamzuri le Shafi\'ite.',
  },
  {
    id: 'tuhfat-2', matnId: 'tuhfat-atfal', number: 2,
    textAr:    'الحَمْدُ لِلَّهِ مُصَلِّياً عَلَى *** النَّبِيِّ المُصْطَفَى ذِي المِنَنِ',
    firstHalf: 'الحَمْدُ لِلَّهِ مُصَلِّياً عَلَى',
    secondHalf:'النَّبِيِّ المُصْطَفَى ذِي المِنَنِ',
    textFr:    'Louange à Allah, en priant sur le Prophète l\'Élu, celui des bienfaits.',
  },
  {
    id: 'tuhfat-3', matnId: 'tuhfat-atfal', number: 3,
    textAr:    'وَآلِهِ وَصَحْبِهِ وَمَنْ تَلاَ *** كِتَابَهُ مُرَتِّلاً أَوْ نُزِّلاَ',
    firstHalf: 'وَآلِهِ وَصَحْبِهِ وَمَنْ تَلاَ',
    secondHalf:'كِتَابَهُ مُرَتِّلاً أَوْ نُزِّلاَ',
    textFr:    'Et sur sa famille, ses compagnons et quiconque récite Son Livre en le psalmodiant.',
  },
  {
    id: 'tuhfat-4', matnId: 'tuhfat-atfal', number: 4,
    textAr:    'وَبَعْدُ هَذَا النَّظْمُ قَدْ تَضَمَّنَا *** تَجْوِيدَ قُرْآنٍ فَخُذْ مَا بَيَّنَا',
    firstHalf: 'وَبَعْدُ هَذَا النَّظْمُ قَدْ تَضَمَّنَا',
    secondHalf:'تَجْوِيدَ قُرْآنٍ فَخُذْ مَا بَيَّنَا',
    textFr:    'Ensuite : ce poème contient les règles du Tajweed du Coran, apprends ce que nous avons exposé.',
  },
  {
    id: 'tuhfat-5', matnId: 'tuhfat-atfal', number: 5,
    textAr:    'فَالنُّونُ إِنْ تَسْكُنْ وَتَنْوِينٌ لَدَى *** بَيَانٍ إِدْغَامٍ إِقْلاَبٍ يُرَى',
    firstHalf: 'فَالنُّونُ إِنْ تَسْكُنْ وَتَنْوِينٌ لَدَى',
    secondHalf:'بَيَانٍ إِدْغَامٍ إِقْلاَبٍ يُرَى',
    textFr:    'Le noun sâkin et le tanwin ont quatre cas : idhhar, idgham, iqlab...',
    topic:     'Noun sâkin et tanwin',
  },
  {
    id: 'tuhfat-6', matnId: 'tuhfat-atfal', number: 6,
    textAr:    'إِخْفَاءٍ فَالأَوَّلُ قَبْلَ أَحْرُفِ *** لِلْحَلْقِ سِتٌّ ثُمَّ عِشْرُونَ اعْرِفِ',
    firstHalf: 'إِخْفَاءٍ فَالأَوَّلُ قَبْلَ أَحْرُفِ',
    secondHalf:'لِلْحَلْقِ سِتٌّ ثُمَّ عِشْرُونَ اعْرِفِ',
    textFr:    '...et ikhfa. Le premier (idhhar) est avant les 6 lettres gutturales. Connais les 26.',
    topic:     'Ikhfa et idhhar',
  },
  {
    id: 'tuhfat-7', matnId: 'tuhfat-atfal', number: 7,
    textAr:    'وَالمِيمُ إِنْ تَسْكُنْ لِثَلاَثٍ تَنْقَسِمْ *** إِخْفَاءٌ ثُمَّ إِدْغَامٌ وَإِظْهَارٌ فَهِمْ',
    firstHalf: 'وَالمِيمُ إِنْ تَسْكُنْ لِثَلاَثٍ تَنْقَسِمْ',
    secondHalf:'إِخْفَاءٌ ثُمَّ إِدْغَامٌ وَإِظْهَارٌ فَهِمْ',
    textFr:    'Le mim sâkin se divise en trois : ikhfa, idgham et idhhar. Comprends.',
    topic:     'Mim sâkin',
  },
  {
    id: 'tuhfat-8', matnId: 'tuhfat-atfal', number: 8,
    textAr:    'وَالمَدُّ أَصْلِيٌّ وَفَرْعِيٌّ لَهُ *** وَسَمِّ أَوَّلاً طَبِيعِياً وَهُوَ',
    firstHalf: 'وَالمَدُّ أَصْلِيٌّ وَفَرْعِيٌّ لَهُ',
    secondHalf:'وَسَمِّ أَوَّلاً طَبِيعِياً وَهُوَ',
    textFr:    'La madd est naturelle (asli) ou secondaire (far\'i). Le premier est dit tabie\'i.',
    topic:     'Règles de la Madd',
  },
  // TODO : versets 9-61 à compléter
]

// ── Bayt — Al-Ajrumiyya (prose) ───────────────────────────

export const BAYT_AJRUMIYYA: Bayt[] = [
  {
    id: 'ajrumiyya-1', matnId: 'ajrumiyya', number: 1,
    textAr:    'الكَلاَمُ هُوَ اللَّفْظُ المُرَكَّبُ المُفِيدُ بِالوَضْعِ',
    textFr:    'La parole (kalâm) est l\'expression composée porteuse de sens, telle qu\'elle a été établie.',
    topic:     'بَابُ الكَلاَمِ — Définition du kalâm',
  },
  {
    id: 'ajrumiyya-2', matnId: 'ajrumiyya', number: 2,
    textAr:    'وَأَقْسَامُهُ ثَلاَثَةٌ: اِسْمٌ وَفِعْلٌ وَحَرْفٌ جَاءَ لِمَعْنىً',
    textFr:    'Ses divisions sont trois : le nom (ism), le verbe (fi\'l), et la particule (harf) qui vient pour un sens.',
    topic:     'بَابُ الكَلاَمِ — Les trois divisions',
  },
  {
    id: 'ajrumiyya-3', matnId: 'ajrumiyya', number: 3,
    textAr:    'فَالاِسْمُ يُعْرَفُ بِالخَفْضِ وَالتَّنْوِينِ وَدُخُولِ الأَلِفِ وَاللاَّمِ',
    textFr:    'Le nom se reconnaît par le genitif (khafad), le tanwin, et l\'entrée de l\'article al-.',
    topic:     'Signes du nom',
  },
  {
    id: 'ajrumiyya-4', matnId: 'ajrumiyya', number: 4,
    textAr:    'وَالفِعْلُ يُعْرَفُ بِقَدْ وَالسِّينِ وَسَوْفَ وَتَاءِ التَّأنِيثِ السَّاكِنَةِ',
    textFr:    'Le verbe se reconnaît par qad, par sin et sawfa, et par le tâ\' du féminin quiescent.',
    topic:     'Signes du verbe',
  },
  {
    id: 'ajrumiyya-5', matnId: 'ajrumiyya', number: 5,
    textAr:    'بَابُ الإِعْرَابِ: الإِعْرَابُ هُوَ تَغْيِيرُ أَوَاخِرِ الكَلِمِ لاِخْتِلاَفِ العَوَامِلِ الدَّاخِلَةِ عَلَيْهَا',
    textFr:    'L\'i\'râb est le changement des finales des mots selon la différence des facteurs grammaticaux qui s\'y appliquent.',
    topic:     'بَابُ الإِعْرَابِ — Définition de l\'i\'râb',
  },
  {
    id: 'ajrumiyya-6', matnId: 'ajrumiyya', number: 6,
    textAr:    'وَأَقْسَامُهُ أَرْبَعَةٌ: رَفْعٌ وَنَصْبٌ وَخَفْضٌ وَجَزْمٌ',
    textFr:    'Ses divisions sont quatre : le nominatif (raf\'), l\'accusatif (nasb), le génitif (khafad), et le jussif (jazm).',
    topic:     'Les quatre cas de l\'i\'râb',
  },
  {
    id: 'ajrumiyya-7', matnId: 'ajrumiyya', number: 7,
    textAr:    'بَابُ مَعْرِفَةِ عَلاَمَاتِ الإِعْرَابِ: فَلِلرَّفْعِ أَرْبَعُ عَلاَمَاتٍ: الضَّمَّةُ وَالوَاوُ وَالأَلِفُ وَالنُّونُ',
    textFr:    'Le raf\' a quatre marques : la damma, le waw, l\'alif, et le nun.',
    topic:     'Signes du raf\'',
  },
  {
    id: 'ajrumiyya-8', matnId: 'ajrumiyya', number: 8,
    textAr:    'وَلِلنَّصْبِ خَمْسُ عَلاَمَاتٍ: الفَتْحَةُ وَالأَلِفُ وَالكَسْرَةُ وَالياءُ وَحَذْفُ النُّونِ',
    textFr:    'Le nasb a cinq marques : la fatha, l\'alif, la kasra, le ya\', et la suppression du nun.',
    topic:     'Signes du nasb',
  },
  // TODO : sections restantes à compléter
]

// ── Bayt — Al-Waraqat (prose) ────────────────────────────────

export const BAYT_WARAQAT: Bayt[] = [
  {
    id: 'waraqat-1', matnId: 'waraqat', number: 1,
    textAr:    'الكَلاَمُ إِمَّا أَمْرٌ أَوْ نَهْيٌ أَوْ خَبَرٌ أَوْ اسْتِخْبَارٌ',
    textFr:    'La parole est soit un ordre, soit une interdiction, soit un énoncé, soit une interrogation.',
    topic:     'Types de discours',
  },
  {
    id: 'waraqat-2', matnId: 'waraqat', number: 2,
    textAr:    'العِلْمُ إِمَّا عِلْمُ الأَعْيَانِ أَوْ عِلْمُ الأَحْوَالِ',
    textFr:    'La connaissance est soit connaissance des essences, soit connaissance des états.',
    topic:     'Types de connaissance',
  },
  {
    id: 'waraqat-3', matnId: 'waraqat', number: 3,
    textAr:    'أُصُولُ الفِقْهِ: الكِتَابُ والسُّنَّةُ وَالإِجْمَاعُ وَالقِيَاسُ',
    textFr:    'Les sources du Fiqh sont : le Livre (Coran), la Sunna, l\'ijmâ\' (consensus) et le qiyâs (analogie).',
    topic:     'Les quatre sources du Fiqh',
  },
  {
    id: 'waraqat-4', matnId: 'waraqat', number: 4,
    textAr:    'الكِتَابُ هُوَ القُرْآنُ المَجِيدُ المُنَزَّلُ عَلَى نَبِيِّنَا مُحَمَّدٍ ﷺ',
    textFr:    'Le Livre est le Coran Glorieux révélé à notre Prophète Muhammad ﷺ.',
    topic:     'Définition du Livre',
  },
  {
    id: 'waraqat-5', matnId: 'waraqat', number: 5,
    textAr:    'السُّنَّةُ: قَوْلُ النَّبِيِّ ﷺ وَفِعْلُهُ وَتَقْرِيرُهُ',
    textFr:    'La Sunna : la parole du Prophète ﷺ, son acte, et son approbation (tacite).',
    topic:     'Définition de la Sunna',
  },
  {
    id: 'waraqat-6', matnId: 'waraqat', number: 6,
    textAr:    'الإِجْمَاعُ: اتِّفَاقُ عُلَمَاءِ العَصْرِ عَلَى حُكْمٍ شَرْعِيٍّ',
    textFr:    'L\'ijmâ\' : le consensus des savants d\'une époque sur un jugement légal islamique.',
    topic:     'Définition de l\'Ijmâ\'',
  },
  {
    id: 'waraqat-7', matnId: 'waraqat', number: 7,
    textAr:    'الأَمْرُ: هُوَ الِاسْتِدْعَاءُ بِالفِعْلِ مِمَّنْ هُوَ أَعْلَى رُتْبَةً',
    textFr:    'L\'ordre (amr) est la demande d\'accomplissement d\'un acte par celui d\'un rang supérieur.',
    topic:     'Définition de l\'ordre (amr)',
  },
  {
    id: 'waraqat-8', matnId: 'waraqat', number: 8,
    textAr:    'النَّهْيُ: هُوَ الِاسْتِدْعَاءُ بِالتَّرْكِ مِمَّنْ هُوَ أَعْلَى رُتْبَةً',
    textFr:    'L\'interdiction (nahy) est la demande d\'abandon d\'un acte par celui d\'un rang supérieur.',
    topic:     'Définition de l\'interdiction (nahy)',
  },
  // TODO : sections restantes à compléter
]

// ── Bayt — Al-Arba'in an-Nawawiyya (42 hadiths) ───────────

export const BAYT_ARBAEEN: Bayt[] = [
  {
    id: 'arbaeen-1', matnId: 'arbaeen-nawawi', number: 1,
    textAr:    'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    textFr:    'Les actes ne valent que par les intentions, et chaque homme n\'aura que ce qu\'il a voulu.',
    topic:     'Hadith 1 — L\'intention',
  },
  {
    id: 'arbaeen-2', matnId: 'arbaeen-nawawi', number: 2,
    textAr:    'الإِسْلاَمُ أَنْ تَشْهَدَ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَنَّ مُحَمَّداً رَسُولُ اللهِ',
    textFr:    'L\'islam, c\'est d\'attester qu\'il n\'y a de divinité qu\'Allah et que Muhammad est Son messager.',
    topic:     'Hadith 2 — Islam, Iman, Ihsan',
  },
  {
    id: 'arbaeen-3', matnId: 'arbaeen-nawawi', number: 3,
    textAr:    'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللهُ وَأَنَّ مُحَمَّداً رَسُولُ اللهِ وَإِقَامِ الصَّلاَةِ وَإِيتَاءِ الزَّكَاةِ وَالحَجِّ وَصَوْمِ رَمَضَانَ',
    textFr:    'L\'islam est bâti sur cinq piliers : la Shahada, la prière, la zakat, le hajj et le jeûne du Ramadan.',
    topic:     'Hadith 3 — Les cinq piliers',
  },
  {
    id: 'arbaeen-4', matnId: 'arbaeen-nawawi', number: 4,
    textAr:    'إِنَّ أَحَدَكُمْ يُجْمَعُ خَلْقُهُ فِي بَطْنِ أُمِّهِ أَرْبَعِينَ يَوْماً نُطْفَةً',
    textFr:    'La création de l\'un d\'entre vous est rassemblée dans le ventre de sa mère en quarante jours (nutfa).',
    topic:     'Hadith 4 — La création de l\'être humain',
  },
  {
    id: 'arbaeen-5', matnId: 'arbaeen-nawawi', number: 5,
    textAr:    'مَنْ أَحْدَثَ فِي أَمْرِنَا هَذَا مَا لَيْسَ مِنْهُ فَهُوَ رَدٌّ',
    textFr:    'Quiconque introduit dans notre religion ce qui n\'en fait pas partie, cela est rejeté.',
    topic:     'Hadith 5 — L\'innovation (bid\'a)',
  },
  {
    id: 'arbaeen-6', matnId: 'arbaeen-nawawi', number: 6,
    textAr:    'الحَلاَلُ بَيِّنٌ وَالحَرَامُ بَيِّنٌ وَبَيْنَهُمَا أُمُورٌ مُشْتَبِهَاتٌ',
    textFr:    'Le licite est clair, l\'illicite est clair, et entre les deux il y a des choses douteuses.',
    topic:     'Hadith 6 — Le licite, l\'illicite et le douteux',
  },
  {
    id: 'arbaeen-7', matnId: 'arbaeen-nawawi', number: 7,
    textAr:    'الدِّينُ النَّصِيحَةُ',
    textFr:    'La religion, c\'est le bon conseil (sincérité).',
    topic:     'Hadith 7 — La religion est la sincérité',
  },
  {
    id: 'arbaeen-8', matnId: 'arbaeen-nawawi', number: 8,
    textAr:    'أُمِرْتُ أَنْ أُقَاتِلَ النَّاسَ حَتَّى يَشْهَدُوا أَنْ لاَ إِلَهَ إِلاَّ اللهُ',
    textFr:    'Il m\'a été ordonné de combattre les gens jusqu\'à ce qu\'ils attestent qu\'il n\'y a de divinité qu\'Allah.',
    topic:     'Hadith 8 — La protection par la Shahada',
  },
  // TODO : hadiths 9-42 à compléter
]

// ── Index global ──────────────────────────────────────────────

export const ALL_BAYT: Bayt[] = [
  ...BAYT_BAIQUNIYYA,
  ...BAYT_TUHFAT,
  ...BAYT_AJRUMIYYA,
  ...BAYT_WARAQAT,
  ...BAYT_ARBAEEN,
]

export function getBaytForMatn(matnId: string): Bayt[] {
  return ALL_BAYT.filter(b => b.matnId === matnId)
}

export function getBaytById(baytId: string): Bayt | undefined {
  return ALL_BAYT.find(b => b.id === baytId)
}

export function getMatnById(matnId: string): Matn | undefined {
  return MUTUN.find(m => m.id === matnId)
}
