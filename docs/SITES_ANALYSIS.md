# 🔍 Analyse des sites de référence — Reproduction dans saas-islam

_Analysé le 2026-02-25 par NoorBot_

---

## 1. ramadan-2026.com — Landing page islamique

### Ce qu'il fait
- Showcase d'applications islamiques gratuites pour Ramadan 2026
- Présentation produit simple, branding KF Company
- Liens vers les apps (probablement App Store / Play Store)

### Comment le reproduire dans notre projet
→ **Page d'accueil principale** (`apps/platform-home/`) ou route `/` du site principal

**Features clés à reproduire :**
- Hero section avec Bismillah et titre en arabe
- Cards pour chaque module (Coran, Hadiths, Memorisation, Bibliothèque, etc.)
- Section téléchargement (App Store / Play Store links)
- Design sobre, couleurs islamiques (vert, or, blanc)
- Multilingue AR/FR/EN

---

## 2. quran.com — La référence absolue

### Ce qu'il fait
- Lecture du Coran dans toutes les éditions
- Audio : 50+ récitateurs, lecture continue
- Traductions : 50+ langues
- Traduction mot-par-mot (word-by-word)
- Tafsir : multiple tafsirs (Ibn Kathir, Tabari, etc.)
- Recherche avancée (texte arabe + traductions)
- Mode mémorisation (révélation progressive)
- Notes personnelles sur les versets
- Collections (bookmarks par thème)
- Carrières de lecture (lecture streaks)

### API publique disponible
```
https://api.quran.com/api/v4/
  - /chapters → 114 sourates
  - /verses/by_chapter/{chapter_id} → versets par sourate
  - /search?q=... → recherche
  - /translations → liste traductions
  - /tafsirs → liste tafsirs
  - /recitations → liste récitateurs
```

### Comment le reproduire dans notre projet
→ `apps/quran-app/` (déjà commencé)

**Features prioritaires :**
1. ✅ Liste 114 sourates
2. ✅ Lecteur sourate + versets
3. ✅ Traduction Hamidullah (FR)
4. 🔲 Barre de recherche (filtrage sourates)
5. 🔲 Lecteur audio (CDN islamicnetwork)
6. 🔲 Mot-par-mot (API quran.com /words)
7. 🔲 Tafsir (API quran.com /tafsirs)
8. 🔲 Multi-récitateurs
9. 🔲 Mode nuit / ajustement taille police
10. 🔲 Bookmark / mémorisation de sa position
11. 🔲 Page Juz (para)

---

## 3. sunnah.com — La référence Hadiths

### Ce qu'il fait
- Collections primaires : Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasai, Ibn Majah, Malik
- Collections secondaires : Riyadh Salihin, 40 Nawawi, etc.
- Texte arabe + traduction anglaise (par défaut)
- Recherche avancée :
  - Quotes exactes : `"pledge allegiance"`
  - Wildcards : `test*`
  - Fuzzy : `swore~`
  - Boolean : `(X OR Y) AND Z`
  - Term boosting : `pledge^4`
- Navigation par livre → chapitre → hadith
- Numérotation des hadiths (numéro global + numéro dans la collection)
- Partage de hadith (URL directe)
- Langues : EN, AR, Urdu, Bangla

### APIs disponibles
```
https://api.hadith.gading.dev/books → liste collections
https://api.hadith.gading.dev/books/{bookId} → chapitres
https://api.hadith.gading.dev/books/{bookId}/{hadithNumber} → un hadith

CDN hadiths JSON:
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari.json
```

### Comment le reproduire dans notre projet
→ `apps/quran-app/src/app/hadiths/` (à créer)

**Features prioritaires :**
1. 🔲 Page liste collections (avec stats)
2. 🔲 Page collection → liste chapitres
3. 🔲 Page hadith (texte AR + trad FR)
4. 🔲 Recherche dans les hadiths
5. 🔲 Navigation livre → chapitre → hadith
6. 🔲 Partage par URL

---

## 4. nuqayah.com — L'écosystème islamique numérique

### Ce qu'il fait (16 projets)
| Projet | Description | Équivalent dans notre projet |
|--------|-------------|------------------------------|
| الباحث القرآني | Tafsir, qira'at, i'rab, sciences coraniques | quran-app (enhanced) |
| المقرئ | Mémorisation Coran, 28 langues | memorization-app |
| التفسير التفاعلي | 8 tafsirs en audio | quran-app tafsir |
| الباحث الحديثي | Recherche hadiths avec isnads | hadiths module |
| **تراث (Turath)** | Alternative Shamela web (offline PWA) | library-app |
| تطبيق فائدة | Apprentissage sans contrainte de temps | academy-app |
| تكوين الراسخين | Curriculum sciences islamiques + mutun | memorization-app |
| القارئ | 118 récitateurs, 144 mushafs | quran-app audio |
| المصحف المحفظ | Mushaf interactif mémorisation (tap to reveal) | memorization-app |
| الباحث العلمي | Recherche dans la plus grande bibliothèque | library-app |
| Miftah | Apprendre lettres arabes | academy-app |
| منصة سؤال | QCM islamiques | academy-app |
| **مقرئ المتون** | Mémorisation des mutun | memorization-app |
| كلمة | Quiz vocabulaire coranique | quran-app |
| **حفظ** | SRS type Anki | memorization-app |
| المصحف | Mushaf numérique Madinah haute qualité | quran-app |
| راوي | Bibliothèque audio islamique | media-hub |

### La leçon nuqayah : modularité
Nuqayah est un hub qui pointe vers des micro-apps. Chaque app fait UNE chose très bien.
→ Notre architecture mono-repo multi-apps EST la bonne approche.

---

## 5. shamela.ws — المكتبة الشاملة

### Ce qu'il fait
- ~15,000 livres islamiques numérisés
- Catégories : Coran, Tafsir, Hadith, Fiqh, Aqida, Histoire, Biographies, etc.
- Navigation : Catégorie → Auteur → Livre → Page
- Recherche fulltext
- Téléchargement gratuit (format shamela propriétaire + PDF)
- Affichage de pages du livre avec numérotation correspondant à l'imprimé

### Comment le reproduire dans notre projet
→ `apps/library-app/` (nouveau) = version web légère inspirée de تراث (Turath)

**Features prioritaires :**
1. 🔲 Catalogue de livres (catégories)
2. 🔲 Page auteur
3. 🔲 Lecteur de livre (pagination)
4. 🔲 Recherche fulltext
5. 🔲 Mode offline (PWA)
6. 🔲 Liaison avec numérotation de l'imprimé

---

## 🗺️ Roadmap de reproduction

### Phase 1 — Renforcer le Coran (Q1 2026)
- [x] Structure de base
- [ ] Recherche + filtrage sourates
- [ ] Lecteur audio multi-récitateurs
- [ ] Tafsir (al-Muyassar + Ibn Kathir)
- [ ] Mot-par-mot

### Phase 2 — Hadiths (Q1-Q2 2026)
- [ ] Collections primaires (6 kutub al-sitta)
- [ ] Recherche hadiths
- [ ] Navigation livre/chapitre/hadith

### Phase 3 — Mémorisation (Q2 2026)
- [ ] Mutun (textes à mémoriser)
- [ ] SRS (répétition espacée, style Anki)
- [ ] Mushaf interactif tap-to-reveal

### Phase 4 — Bibliothèque (Q3 2026)
- [ ] Catalogue livres (style Shamela)
- [ ] Lecteur
- [ ] Recherche fulltext

### Phase 5 — Académie + Social (Q4 2026)
- [ ] QCM islamiques
- [ ] Cours structurés
- [ ] Social Halal (feed chronologique)

---

## 📌 APIs publiques exploitables (gratuites, fiables)

| API | Usage | URL |
|-----|-------|-----|
| AlQuran.cloud | Texte coranique + traductions | https://api.alquran.cloud/v1 |
| Quran.com API v4 | Mot-par-mot, tafsir, récitateurs | https://api.quran.com/api/v4 |
| IslamicNetwork CDN | Audio récitations | https://cdn.islamic.network/quran/audio/ |
| Hadith Gading | Collections hadiths | https://api.hadith.gading.dev |
| Fawaz Hadith CDN | JSON hadiths complets | https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1 |
| Aladhan | Horaires prières | https://api.aladhan.com/v1 |
| Hadith.guru | Hadiths FR | https://hadith.guru |

---

_Document généré automatiquement — NoorBot 2026-02-25_
