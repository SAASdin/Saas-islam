# 📋 Tableau des tâches — Saas-islam

> Mis à jour à chaque session. Les deux OpenClaw doivent le lire avant de commencer à travailler.

---

## 🔴 En cours

_Aucune tâche en cours pour le moment._

---

## 🟡 À faire (priorité haute)

| Tâche | Priorité | Notes |
|---|---|---|
| Script de seed Coran (AlQuran.cloud → BDD) | 🔴 Haute | Zone sacrée — import initial validé par les deux collab |
| Intégration traduction Complexe du Roi Fahd (Médine) | 🔴 Haute | En attente BDD |
| Intégrer AudioPlayer dans SurahPage | 🟠 Moyenne | Boutons play sur chaque AyahDisplay + player sticky |
| Lecteur audio continu (mode lecture) | 🟠 Moyenne | Enchaînement automatique des versets |
| Mode Mushaf (affichage par pages) | 🟠 Moyenne | Police KFGQPC Uthmanic Script HAFS |
| Tafsir intégré par verset | 🟠 Moyenne | Ibn Kathir / As-Saadi — via quran.com API |
| Traduction mot à mot (word-by-word) | 🟠 Moyenne | quran.com API /words |
| Système d'authentification | 🟠 Moyenne | NextAuth.js |
| Page bibliothèque — catégorie et livre | 🟡 Basse | `/bibliotheque/categorie/[id]` + `/bibliotheque/livre/[id]` |
| Page mémorisation (mutun) | 🟡 Basse | SRS type Anki |
| Navigation par Juz | 🟡 Basse | 30 juz du Coran |
| PWA (offline support) | 🟡 Basse | Service worker pour lecture offline |

---

## 🟢 Terminé

| Tâche | Par | Date | PR |
|---|---|---|---|
| Setup repo GitHub (structure, docs, gitignore) | Moha | 2026-02-24 | #1 ✅ |
| Schéma PostgreSQL complet (3 zones) + Prisma | Moha | 2026-02-24 | #2 ✅ |
| Next.js 14 — structure, polices, liste sourates, lecteur Coran | Moha | 2026-02-24 | #3 ✅ |
| **Analyse 5 sites référence** (quran.com, sunnah.com, nuqayah.com, shamela.ws, ramadan-2026.com) | NoorBot | 2026-02-25 | — |
| **Module Hadiths** — page liste + collection + hadith détail | NoorBot | 2026-02-25 | — |
| **Module Prière** — horaires + countdown temps réel (UOIF) | NoorBot | 2026-02-25 | — |
| **Module Bibliothèque** — landing + 8 catégories + 12 livres | NoorBot | 2026-02-25 | — |
| **SearchBar** — filtre temps réel des 114 sourates | NoorBot | 2026-02-25 | — |
| **AudioPlayer** — 4 récitateurs, CDN islamic.network | NoorBot | 2026-02-25 | — |
| **Page Recherche** — `/search?q=` fulltext via AlQuran API | NoorBot | 2026-02-25 | — |
| **Home page redesign** — Landing platform style ramadan-2026.com | NoorBot | 2026-02-25 | — |
| **lib/hadith-api.ts + prayer-api.ts + library-api.ts** | NoorBot | 2026-02-25 | — |
| **docs/SITES_ANALYSIS.md** — Analyse complète des 5 sites | NoorBot | 2026-02-25 | — |

---

## 📌 Règles du board

- Avant de commencer une tâche → vérifie que personne d'autre ne la fait
- Ajoute-toi dans "En cours" avant de commencer
- Déplace vers "Terminé" quand la PR est mergée
