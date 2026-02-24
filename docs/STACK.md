# 🔧 STACK.md — Stack Technique

> Décisions techniques partagées. Toute modification majeure doit être discutée entre Moha et Bilal avant d'être appliquée.

---

## Frontend

| Technologie | Choix | Raison |
|---|---|---|
| Framework | **Next.js 14+** (App Router) | SSR natif, SEO, performance |
| Styling | **TailwindCSS** | Rapidité, cohérence, mobile-first |
| Polices | **Amiri** (Google Fonts) + KFGQPC local | RTL, texte coranique |
| RTL | `dir="rtl"` natif HTML | Support Coran, Hadiths |
| Mobile | React Native (prévu v2) | iOS + Android |

## Backend

| Technologie | Choix | Raison |
|---|---|---|
| Runtime | **Node.js** | Ecosystème JS unifié |
| Framework API | **Fastify** (ou NestJS si complexité) | Performance, légèreté |
| Base de données | **PostgreSQL** | Fiabilité, UTF-8 natif |
| Cache | **Redis** | Sessions, rate limiting, cache API |
| ORM | **Prisma** | Typage fort, migrations |
| Auth | **NextAuth.js** | Intégration Next.js native |

## IA & Automatisation

| Service | Outil | Usage |
|---|---|---|
| Transcription | **OpenAI Whisper** | Vidéos arabes → texte |
| Traduction | **DeepL API** + GPT-4 | Contexte islamique |
| Scraping YouTube | **yt-dlp** + YouTube Data API v3 | Playlists de savants |
| Récitation vocale | Whisper + phonétique arabe | Validation mémorisation |
| Modération | IA custom + humains | Contenu Social Halal |

## Infrastructure

| Service | Usage |
|---|---|
| **Vercel** | Hébergement frontend |
| **Railway / Fly.io** | Hébergement backend |
| **Cloudflare R2** | Stockage médias (vidéos, audio) |
| **Cloudflare CDN** | Distribution globale |
| **GitHub Actions** | CI/CD |

## APIs Islamiques

| API | Usage | Règle |
|---|---|---|
| `api.alquran.cloud` | Coran (texte, audio) | Données SACRÉES — lecture seule |
| `api.aladhan.com` | Horaires de prière | Afficher la méthode de calcul |
| `api.sunnah.com` | Hadiths | Données SACRÉES — lecture seule |
| `quran.com/api` | Coran alternatif | Données SACRÉES — lecture seule |

---

## Décisions architecturales

| Date | Décision | Par | Raison |
|---|---|---|---|
| 2026-02-24 | TailwindCSS choisi (vs CSS Modules) | Moha | Développement plus rapide |
| 2026-02-24 | PostgreSQL UTF-8 obligatoire | Moha | Texte arabe sans perte |
| 2026-02-24 | Polices islamiques en local (public/fonts/) | Moha | Pas de dépendance réseau pour affichage Coran |
