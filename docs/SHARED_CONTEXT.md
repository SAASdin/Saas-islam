# 🤝 SHARED_CONTEXT.md — Décisions communes

> Ce fichier contient toutes les décisions prises ensemble par Moha et Bilal.
> Les deux OpenClaw doivent le lire et le respecter.
> Ne jamais annuler une décision ici sans en discuter avec l'autre équipe.

---

## Décisions validées

| Date | Sujet | Décision | Validé par |
|---|---|---|---|
| 2026-02-24 | Nom du projet | `Saas-islam` (repo GitHub) | Moha + Bilal |
| 2026-02-24 | Compte GitHub | `SAASdin` (compte de Moha, repo partagé) | Moha + Bilal |
| 2026-02-24 | Structure du repo | Mono-repo avec `apps/`, `services/`, `docs/`, `memory/` | Moha |
| 2026-02-24 | Stack frontend | Next.js 14+ App Router + TailwindCSS | Moha |
| 2026-02-24 | Base de données | PostgreSQL + Redis | Moha |
| 2026-02-24 | Données religieuses | Immuables, zone sacrée SELECT-only | Moha + Bilal |
| 2026-02-24 | Branches Git | `dev/moha/*` et `dev/bilal/*`, main protégée | Moha |
| 2026-02-24 | Polices Coran | KFGQPC + Amiri + Scheherazade New | Moha |

---

| 2026-02-24 | Architecture BDD | **3 schémas PostgreSQL séparés** (`sacred` / `app` / `media`) — Option A validée par Moha | Moha |
| 2026-02-24 | Réactions sociales | Réactions halal uniquement : MashAllah, BarakAllah, Ameen, JazakAllah, SubhanAllah — pas de "like" | Moha (idée Bilal) |
| 2026-02-24 | Badges & Streaks | Système de badges islamiques + streaks inclus dans schéma BDD | Moha (idée Bilal) |

---

## Questions ouvertes (à décider ensemble)

| # | Question | Proposé par | Statut |
|---|---|---|---|
| 1 | Quelle est la priorité de la première app ? (Quran App vs Notification Engine ?) | Moha | ⏳ En attente |
| 2 | Hébergement backend : Railway ou Fly.io ? | Moha | ⏳ En attente |
| 3 | Auth sociale (Google, Apple) dès le début ou phase 2 ? | Moha | ⏳ En attente |
| 4 | Qui setup Next.js ? Moha ou Bilal ? | Bilal | ⏳ En attente |

---

*Dernière mise à jour : 2026-02-24 par Moha*
