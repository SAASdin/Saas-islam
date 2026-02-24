# 🕌 ISLAMIC_PLATFORM.md — Spécification du Projet

> Version : 2.0 — Collaboration Moha & Bilal

---

## Vue d'ensemble

Plateforme islamique SaaS multi-applications : Coran, Hadiths, Memorization, Social Halal, Academy, Media Hub.

## Applications prévues

| App | Description | Priorité |
|---|---|---|
| **Quran App** | Clone amélioré de Tarteel — lecture, Tafsir, récitation | 🔴 Haute |
| **Memorization App** | Clone de Huffaz al-Mutun — Mutun + SRS + validation vocale | 🔴 Haute |
| **Notification Engine** | Rappels prière + vidéos réelles + verset du jour | 🔴 Haute |
| **Translation App** | Traduction livres arabes PDF/EPUB | 🟠 Moyenne |
| **Social Halal** | TikTok 100% halal — feed islamique | 🟠 Moyenne |
| **Academy** | Cours islamiques en ligne, devoirs, certifications | 🟡 Phase 2 |
| **Media Hub** | Vidéos, récitations, conférences | 🟡 Phase 2 |

## Services techniques

| Service | Description |
|---|---|
| **YouTube Scraper** | yt-dlp + YouTube Data API v3 |
| **Video Translator** | Whisper + DeepL — arabe → FR/EN |
| **Social Automation** | Publication Instagram, TikTok |
| **Prayer Times** | Aladhan API |

## Architecture BDD complète

Voir `docs/SOUL.md` pour les règles d'accès.

```
📁 PostgreSQL
├── 🔒 ZONE SACRÉE (SELECT only)
│   ├── quran_ayahs, quran_surahs, quran_translations
│   ├── quran_tafsirs, quran_word_by_word, quran_tajweed_rules
│   ├── hadiths, hadith_collections, hadith_narrators, hadith_gradings
│   ├── duas, allah_names, prophets, islamic_calendar, scholars
│   └── mutun, mutun_categories, reference_books, book_chapters, book_content
│
├── 🔓 ZONE APPLICATIVE (Read/Write)
│   ├── users, user_bookmarks, user_favorites, user_notes
│   ├── user_progress, user_memorization, user_settings
│   ├── subscriptions, payments
│   ├── social_posts, social_comments, social_follows
│   └── academy_enrollments, academy_assignments, academy_evaluations
│
└── 🎬 ZONE MÉDIA (Admin only)
    ├── videos, audio_recitations, reciters
    ├── youtube_playlists, youtube_videos
    └── translated_videos
```

## Règles d'affichage

1. Arabe en premier — `dir="rtl"` — `lang="ar"`
2. Polices : KFGQPC / Amiri / Scheherazade New
3. Ne jamais couper un verset
4. Bismillah sur chaque sourate sauf At-Tawbah (9)
5. Traductions automatiques = toujours labellisées

## Spécifications Quran App

- Police : KFGQPC Uthmanic Script HAFS
- Traduction + Tafsir (Ibn Kathir, Saadi) par verset
- Récitation audio avec suivi mot par mot
- Amélioration vs Tarteel : Tafsir vidéo, rappels intelligents, mode mémorisation

## Spécifications Memorization App

Mutun cibles :
- Nahw : Al-Ajrumiyya, Alfiyya Ibn Malik
- Fiqh : Matn Abi Shuja, Al-Muqaddima Al-Hadramiyya
- Aqida : Al-Wasitiyya, Jawharatut Tawhid
- Mustalah Hadith : Al-Baiquniyya
- Usul al-Fiqh : Al-Waraqat

Fonctionnalités : SRS (Anki-like), récitation vocale + validation IA, streaks, badges islamiques

## UX / Design

- Couleurs : vert islamique, or, blanc, crème — mode sombre
- Pas d'images figuratives dans les sections religieuses
- Mobile first
- Accessibilité : taille ajustable, contraste élevé, RTL natif
- Lecteur audio intégré pour récitations
