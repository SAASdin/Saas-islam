# CLAUDE.md — Passation vers Claude Code
> Fichier destiné à Claude Code pour une reprise autonome du projet.
> Mis à jour le 4 juin 2026.

---

## 🎯 But du projet & vision produit

**Saas-islam** est une plateforme islamique SaaS multi-modules développée en solo par Moha.
L'objectif est de proposer en un seul endroit : lecture du Coran, mémorisation des mutun,
consultation des hadiths, traduction de vidéos arabes et réseau social halal.
Le projet est une **sadaqa jariya** : la qualité du code et l'intégrité des données religieuses
sont non-négociables.

---

## 🏗️ Architecture & dossiers principaux

```
saas-islam/
├── apps/
│   ├── quran-app/          # Next.js 16 — Lecture Coran (port 3000 par défaut)
│   ├── hadith-app/         # Next.js 16 — Hadiths multi-collections
│   └── memorization-app/   # Next.js — Mémorisation mutun (SRS)
├── services/
│   ├── youtube-scraper/    # Node.js — Scraping + transcription vidéos savants
│   └── fatwa-scraper/      # Node.js — Collecte fatwas
├── database/
│   ├── migrations/         # SQL migrations (000→005+)
│   ├── seeds/              # Scripts d'import (Coran, Hadiths, Mutun)
│   ├── sacred/             # Schéma zone sacrée (READ-ONLY)
│   └── integrity/          # Hashes SHA-256 des données islamiques
├── prisma/                 # Schema Prisma + client ORM
├── src/                    # Code partagé (api/, app/, components/, lib/, types/)
├── shared/                 # Composants UI partagés entre apps
├── docs/                   # Documentation technique
└── tests/                  # Tests unitaires, e2e, intégrité
```

---

## 🚀 Lancer le projet en local

### Prérequis
- Node.js ≥ 22, npm ≥ 10
- PostgreSQL 16 (local, port 5432)
- Redis (optionnel pour le dev)

### Base de données
```bash
# Créer la DB
createdb saas_islam

# Migrations
npm run db:migrate

# Importer les données islamiques (Coran + Hadiths)
npm run seed:all
# ou séparément :
npm run seed:quran     # 6236 versets
npm run seed:hadiths   # ~38 000 hadiths, 11 collections
```

### Apps
```bash
# Quran App (port 3000)
cd apps/quran-app && npm install && npm run dev

# Hadith App (port 3001 recommandé)
cd apps/hadith-app && npm install && npm run dev -- -p 3001

# Memorization App (port 3002)
cd apps/memorization-app && npm install && npm run dev -- -p 3002
```

### Prisma
```bash
npm run db:generate    # Génère le client Prisma
npm run db:studio      # Interface graphique DB (port 5555)
```

---

## 🔑 Variables d'environnement

Copier `.env.example` → `.env` à la racine et dans chaque app concernée.
Variables minimales pour le dev :
```
DATABASE_URL="postgresql://<user>@localhost:5432/saas_islam"
ANTHROPIC_API_KEY=sk-ant-...      # Pour les features IA (résumé, traduction)
```
Voir `.env.example` pour la liste complète.

---

## 📊 État actuel (4 juin 2026)

### ✅ Ce qui marche
- **Quran App** — 18+ routes, lecteur audio (14 récitateurs), tafsir (29 livres), plans lecture, mushaf 604 pages
- **Hadith App** — 38 408 hadiths, 11 collections, chapitres importés (12 187)
- **Memorization App** — SRS (Anki-like), mutun avec 18 bayts vérifiés
- **Base de données** — PostgreSQL, zone sacrée READ-ONLY, hashes intégrité SHA-256
- **CI/CD** — 13/13 tests passants, ESLint 0 warnings (PR #12)
- **Police KFGQPC** — intégrée dans `public/fonts/`

### 🔄 En cours / à faire
- Tirmidhi FR — source alternative (fawazahmed ne l'a pas)
- Pages bibliothèque : `/categorie/[categoryId]` + `/livre/[bookId]`
- Toggle dark/light mode (Issue GitHub #6)
- Compléter textes mutun (PLACEHOLDER → textes réels depuis éditions imprimées)
- Vercel preview deployments
- `apps/masahif/` — styles de lecture multiples

---

## ⚠️ Problèmes connus & pièges

### Zone sacrée — RÈGLE ABSOLUE
Les tables `quran_*`, `hadiths*`, `mutun`, `duas`, `allah_names`, `prophets` sont **immuables**.
Le user `app_user` n'a que le droit SELECT sur le schema `sacred`.
**Ne jamais exécuter** UPDATE/DELETE/ALTER sur ces tables. Zéro exception.

### Next.js 15/16
- `params` est une `Promise<{...}>` → toujours `await params` dans les Server Components
- Turbopack activé par défaut (`next dev`)

### Audio Coran
- URL format : `https://everyayah.com/data/{key}/{surah3}{ayah3}.mp3`
- Clés récitateurs confirmées : `Alafasy_128kbps`, `Sudais_192kbps`, `Husary_128kbps`
- QuranCDN audio : `https://download.quranicaudio.com/qdc/{slug}/murattal/{chapter}.mp3`

### IDs traductions QuranCDN
- Hamidullah FR = **31** (pas 131)
- Saheeh International EN = **20** (pas 85)
- Haleem EN = 85, Usmani EN = 84

### Bismillah
- `bismillah_pre === true` → afficher la Basmala AVANT le verset 1
- Sourate 1 (Al-Fatiha) : `bismillah_pre = false` (verset 1 EST la Basmala)
- Sourate 9 (At-Tawbah) : `bismillah_pre = false` — **pas de Basmala, règle islamique**

### Polices arabes
- Police principale : `KFGQPC-Uthmanic-Script-HAFS` (dans `public/fonts/`)
- Fallback : `Amiri` → `Noto Naskh Arabic` → `serif`
- Toujours `dir="rtl"` + `lang="ar"` sur les éléments arabes

### GitHub auth
- Token PAT stocké dans `~/.openclaw/workspace/.github_token` (hors repo)
- Format header : `Authorization: token gho_...` (pas `Bearer`)

---

## 📐 Conventions de code

### Commits (Conventional Commits)
```
feat(module): description courte
fix(module): ce qui était cassé
docs: mise à jour documentation
chore: maintenance, tooling
refactor(module): sans changement de comportement
test: ajout/correction de tests
```
Branche : `dev/<feature>` → PR vers `main`

### Code
- Commentaires en **français** (ou anglais si le repo l'impose)
- TypeScript strict
- Composants React : Server Components par défaut, `"use client"` uniquement si nécessaire
- Nommage : `PascalCase` composants, `camelCase` fonctions/vars, `SCREAMING_SNAKE` constantes
- Pas de secrets dans le code — tout via variables d'environnement

### Texte arabe
- **Jamais** `trim()`, `replace()`, `toLowerCase()` sur du texte coranique ou des hadiths
- Toujours valider l'intégrité via les hashes dans `database/integrity/`

---

## 🔗 Ressources clés

- **QuranCDN** : `https://api.qurancdn.com/api/qdc/` (v4)
- **Tafsir API** : `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/{slug}/{surah}/{ayah}.json`
- **Hadith API** : `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/{lang}-{book}.min.json`
- **Audio** : `https://everyayah.com/data/` + `https://download.quranicaudio.com/qdc/`
- **Police KFGQPC** : `public/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf`

---

*Généré par NoorBot (OpenClaw) — 4 juin 2026*
