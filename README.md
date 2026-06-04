# 🌙 Saas-islam — Plateforme Islamique SaaS

Une plateforme multi-modules pour la communauté musulmane : Coran, Hadiths, Mémorisation, Vidéos et plus.

## Modules

| Module | Stack | Status |
|--------|-------|--------|
| Quran App | Next.js 16 | ✅ Actif |
| Hadith App | Next.js 16 | ✅ Actif |
| Memorization App | Next.js | ✅ Actif |
| YouTube Scraper | Node.js | ✅ Actif |
| Social Halal | Next.js | 🔄 À venir |
| Académie | Next.js | 🔄 À venir |

## Stack

- **Frontend** : Next.js 16 + TailwindCSS
- **Base de données** : PostgreSQL 16 + Prisma ORM
- **IA** : Anthropic Claude + OpenAI Whisper
- **Infra** : Vercel + Cloudflare R2

## Démarrage rapide

```bash
# 1. Variables d'environnement
cp .env.example .env
# Remplir DATABASE_URL et ANTHROPIC_API_KEY

# 2. Base de données
npm run db:migrate
npm run seed:all

# 3. Lancer une app
cd apps/quran-app && npm install && npm run dev
```

## ⚠️ Données islamiques

Les données du Coran et des Hadiths sont **sacrées et immuables**. Le schéma `sacred` de la base de données est en lecture seule. Voir `CLAUDE.md` pour les règles détaillées.

## Licence

Projet privé — usage communautaire islamique.
