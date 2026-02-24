# 🕌 Saas-islam

> بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

Plateforme islamique SaaS collaborative — Coran, Hadiths, Duas, Récitations, Horaires de prière, Calendrier Hijri.

## 👥 Équipe

| Développeur | Agent | Branches |
|---|---|---|
| Moha | OpenClaw Moha | `dev/moha/*` |
| Bilal | OpenClaw Bilal | `dev/bilal/*` |

## 📦 Structure

```
Saas-islam/
├── docs/           # Documentation partagée (SOUL, STACK, TASK_BOARD...)
├── memory/         # Journaux de session par personne et par jour
├── src/            # Code source
├── database/       # Schémas, migrations, seeds, zone sacrée
├── tests/          # Tests (intégrité, unitaires, e2e)
├── public/         # Polices islamiques, assets
└── .github/        # Templates de PR, CI/CD
```

## ⚠️ Règle absolue

**Les données religieuses (Coran, Hadiths, Mutun...) sont immuables.** Aucun `INSERT/UPDATE/DELETE` sur la zone sacrée sans validation des deux collaborateurs et hash d'intégrité.

Lire `docs/SOUL.md` avant toute contribution.

## 🔧 Stack

- **Frontend** : Next.js 14+ (App Router) + TailwindCSS
- **Backend** : Node.js (NestJS/Fastify) ou FastAPI
- **Base de données** : PostgreSQL + Redis
- **Infra** : Vercel + Cloudflare R2 + Cloudflare CDN

Voir `docs/STACK.md` pour les détails.

## 🤝 Workflow Git

1. `main` est protégée — aucun push direct
2. Toujours travailler sur `dev/[nom]/[feature]`
3. PR obligatoire avec review croisée avant merge
4. Chaque PR touchant les données religieuses → hash SHA-256 obligatoire

---

*Que ce projet soit une sadaqa jariya pour tous ceux qui y contribuent. آمين*
