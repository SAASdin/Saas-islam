# 📐 CONVENTIONS.md — Conventions de code Saas-islam

> À lire avant de toucher au code. Ces conventions s'appliquent à Moha, Bilal et leurs agents IA.

---

## 🌐 Langue

- **Commentaires de code** : français
- **Noms de variables/fonctions** : anglais (camelCase)
- **Noms de fichiers** : anglais (PascalCase pour composants, kebab-case pour routes)
- **Messages de commit** : français ou anglais — avec préfixe conventionnel
- **Textes arabes dans le code** : copiés tels quels, jamais transformés

---

## 📝 Format des commits

```
type: description courte en français ou anglais

[corps optionnel]
[breaking changes]
```

**Types :**
| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `refactor` | Refactoring sans changement de comportement |
| `style` | CSS/design uniquement |
| `docs` | Documentation uniquement |
| `test` | Ajout ou modification de tests |
| `chore` | Maintenance (deps, config) |
| `[merge]` | Commit de merge de PR |
| `[fix]` | Fix rapide post-merge |

**Exemples :**
```
feat: ajout lecteur audio multi-récitateurs
fix: bismillah manquant sur sourate Al-Anfal
docs: mise à jour TASK_BOARD
```

---

## 🏗️ Structure des composants Next.js

### Server vs Client Components
```tsx
// Server Component (par défaut) — pas de 'use client'
// ✅ fetch de données, rendu statique, SEO

// Client Component — 'use client' en haut du fichier
// ✅ useState, useEffect, event handlers, browser APIs
```

**Règle** : garder les Server Components aussi haut que possible dans l'arbre.
Les event handlers (`onClick`, `onChange`) → **toujours dans un Client Component séparé**.

### Nommage des fichiers
```
src/
├── app/
│   ├── page.tsx              # Route /
│   ├── surah/[id]/page.tsx   # Route /surah/123
│   └── layout.tsx
├── components/
│   ├── quran/                # Composants par domaine
│   │   ├── AyahDisplay.tsx   # PascalCase
│   │   └── SearchBar.tsx
│   └── prayer/
│       └── PrayerCountdown.tsx
└── lib/
    ├── quran-api.ts          # kebab-case pour les libs
    └── hadith-api.ts
```

---

## 🕌 Règles islamiques dans le code — OBLIGATOIRES

### Texte arabe
```tsx
// ✅ CORRECT
<p dir="rtl" lang="ar" className="quran-text">
  {ayah.textUthmani}  {/* ⚠️ SACRÉ — jamais modifier */}
</p>

// ❌ INTERDIT
<p>{ayah.textUthmani.trim()}</p>  // trim() sur texte sacré = INTERDIT
```

### Bismillah
```tsx
// ✅ CORRECT — règle At-Tawbah
{surah.hasBismillah && (
  <p dir="rtl" lang="ar" className="bismillah">
    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
  </p>
)}

// ❌ INTERDIT — afficher Bismillah sur la sourate 9
```

### Traductions automatiques
```tsx
// ✅ OBLIGATOIRE — badge sur toute traduction non-validée
{isAutoTranslation && (
  <span className="auto-translation-badge">
    ⚠️ Traduction automatique non vérifiée
  </span>
)}
```

### Commentaires zone sacrée
```tsx
// ⚠️ SACRÉ — copié tel quel depuis la BDD
// ⚠️ JAMAIS appliquer trim(), replace(), toLowerCase() sur ce texte
```

---

## 🎨 CSS / Tailwind

### Classes utilitaires custom (dans globals.css)
| Classe | Usage |
|---|---|
| `.quran-text` | Tout texte coranique arabe |
| `.bismillah` | Bismillah uniquement |
| `.ayah-number` | Badge numéro de verset |
| `.glass-card` | Card glassmorphism dark |
| `.islamic-pattern` | Motif géométrique de fond |
| `.auto-translation-badge` | Badge traduction auto |

### Thème
- Fond dark : `#0a0f1e` (var `--color-bg`)
- Vert islamique : `#15803d` (var `--color-islam-green`)
- Or islamique : `#d4af37` (var `--color-gold`)
- Texte : `#f1f5f9` (var `--color-text`)

---

## 🗄️ Base de données — Règles absolues

### Nommage
- Tables : `snake_case` (ex: `quran_surah`, `user_bookmarks`)
- Colonnes : `snake_case` (ex: `name_arabic`, `created_at`)
- Prisma models : `PascalCase` (ex: `QuranSurah`, `UserBookmark`)

### Zone sacrée — READ ONLY
```typescript
// ✅ SELECT uniquement sur les tables sacrées
const surah = await prisma.quranSurah.findUnique({ where: { id: 1 } })

// ❌ INTERDIT — jamais create/update/delete sur zone sacrée
await prisma.quranSurah.create(...)    // INTERDIT
await prisma.quranAyah.update(...)     // INTERDIT
await prisma.hadith.delete(...)        // INTERDIT
```

### Schemas PostgreSQL
- `sacred` : Coran, Hadiths, Mutun, Duas — READ ONLY
- `app` : Users, Bookmarks, Progress, Sessions — READ/WRITE
- `media` : Videos, Audio, Files — READ/WRITE

---

## 🔀 Workflow Git

```
main (protégée)
├── dev/moha/[feature]    # Branches de Moha
└── dev/bilal/[feature]   # Branches de Bilal
```

**Cycle de travail :**
1. `git checkout -b dev/[nom]/[feature]` depuis `main` à jour
2. Commits atomiques avec messages clairs
3. PR vers `main` avec description complète
4. Review croisée obligatoire (Moha review Bilal, Bilal review Moha)
5. Merge uniquement après approval

**Avant chaque PR — checklist :**
- [ ] `npx tsc --noEmit` → 0 erreur
- [ ] Textes arabes avec `dir="rtl" lang="ar"`
- [ ] Bismillah uniquement si `hasBismillah=true`
- [ ] Aucune transformation sur texte sacré
- [ ] Traductions auto badgées

---

## 📦 Dépendances

- **Ajouter une dépendance** → discuter avec l'autre développeur d'abord
- **Dépendances interdites** : bibliothèques qui transforment/normalisent le texte arabe sans contrôle
- **Préférer** les APIs externes (AlQuran.cloud, Aladhan) aux bundles locaux lourds

---

*Dernière mise à jour : 2026-02-25 — NoorBot*
