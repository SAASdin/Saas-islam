# 🌙 Seeds — Zone Sacrée

> ⚠️ **VALIDATION REQUISE** : ces scripts ne s'exécutent qu'une seule fois, après validation écrite de **Moha ET Bilal**.

---

## Contenu

| Fichier | Description |
|---|---|
| `01_seed_quran.ts` | 114 sourates + 6236 versets (Uthmani) + 3 traductions (FR/EN/AR) |
| `02_seed_hadiths.ts` | 8 collections de hadiths (~30,000 hadiths) |
| `verify_integrity.ts` | Vérification post-import (counts, règles islamiques) |
| `run_all.ts` | Orchestrateur — exécute tout dans l'ordre |
| `lib/logger.ts` | Utilitaires de logging |

## Sources des données

| Données | Source | Fiabilité |
|---|---|---|
| Texte coranique | api.alquran.cloud — Mushaf Uthmani (Hafs ʿan ʿĀṣim) | ✅ Validé |
| Traduction FR | fr.hamidullah — Muhammad Hamidullah | ✅ Validé par savants |
| Traduction EN | en.sahih — Saheeh International | ✅ Validé |
| Tafsir AR | ar.muyassar — Complexe du Roi Fahd (Médine) | ✅ Validé |
| Hadiths AR | cdn.jsdelivr.net/fawazahmed0/hadith-api | ✅ Texte arabe original |

## Pré-requis

```bash
# 1. Copier et remplir .env
cp .env.example .env
# Remplir DATABASE_URL avec votre connexion PostgreSQL

# 2. Installer les dépendances (si pas déjà fait)
npm install

# 3. Générer le client Prisma
npm run db:generate

# 4. Exécuter les migrations SQL
npm run db:migrate
```

## Exécution

```bash
# Import complet (recommandé)
npm run seed:all

# Ou étape par étape
npm run seed:quran    # ~10-15 min (rate limiting API)
npm run seed:hadiths  # ~5-10 min

# Vérifier l'intégrité
npm run seed:verify
```

## Ce que fait le seed Coran

1. **Fetch les 114 sourates** depuis `api.alquran.cloud/v1/surah`
2. **Fetch les versets** de chaque sourate (édition `quran-uthmani` + `quran-simple`)
3. **Fetch 3 traductions** pour chaque verset :
   - `fr.hamidullah` — Muhammad Hamidullah (français)
   - `en.sahih` — Saheeh International (anglais)
   - `ar.muyassar` — التفسير الميسر — Complexe du Roi Fahd (arabe)
4. **Upsert** en BDD (jamais d'update sur zone sacrée — insert initial uniquement)

## Règles absolues appliquées dans le code

- ✅ `upsert` avec `update: {}` — jamais de modification post-import
- ✅ `hasBismillah = false` uniquement pour la sourate 9 (At-Tawbah)
- ✅ Texte arabe copié tel quel depuis l'API — 0 transformation
- ✅ Rate limiting respecté (300ms entre sourates)
- ✅ Retry avec backoff exponentiel (3 tentatives max)
- ✅ Vérification post-import : 114 sourates, 6236 versets, 15 sajda

## Durée estimée

| Étape | Durée |
|---|---|
| 114 sourates | ~1 min |
| 6236 versets (Uthmani + Simple) | ~8-12 min |
| 3 traductions × 6236 versets | ~15-20 min |
| 8 collections hadiths | ~5-10 min |
| **Total** | **~30-45 min** |

## En cas d'erreur

Le script est **idempotent** — il peut être relancé sans risque. L'`upsert` ignore les entrées existantes.

```bash
# Relancer uniquement le Coran
npm run seed:quran

# Vérifier ce qui a été importé
npm run seed:verify
```

---

*Scripts créés par NoorBot — 2026-02-25*
*Validation requise : Moha ✅ Bilal ✅*
