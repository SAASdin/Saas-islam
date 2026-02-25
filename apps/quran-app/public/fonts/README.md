# Polices islamiques — NoorApp

## Police principale : KFGQPC Uthmanic Script HAFS

| Fichier | Variante | Taille | Source |
|---------|----------|--------|--------|
| `KFGQPC-Uthmanic-Script-HAFS.ttf` | Regular (400) | 136 KB | KFGQPC |
| `KFGQPC-Uthmanic-Script-HAFS-Bold.ttf` | Bold (700) | 129 KB | KFGQPC |

**Source officielle :** مجمع الملك فهد لطباعة المصحف الشريف  
**URL :** https://fonts.qurancomplex.gov.sa/  
**Variante :** UthmanTN v2.0 (Uthman Taha Naskh — édition Hafs 'an 'Asim)  
**Téléchargé le :** 2026-02-25  
**Licence :** Usage non-commercial autorisé pour affichage du Coran

### ⚠️ Règles absolues

- Ces fichiers NE DOIVENT PAS être modifiés sous quelque prétexte que ce soit
- NE PAS renommer (les chemins sont référencés dans `src/lib/fonts.ts`)
- NE PAS remplacer par une autre police sans validation des deux collaborateurs
- NE PAS committer une version altérée

### Configuration Next.js

La police est chargée via `next/font/local` dans `src/lib/fonts.ts` :
- CSS variable : `--font-kfgqpc`
- Classe HTML : appliquée sur `<html>` dans `layout.tsx`
- Priorité dans le stack : KFGQPC → Amiri → Noto Naskh → Scheherazade New → serif

### Polices de fallback (Google Fonts)

- **Amiri** : chargée via `next/font/google` — variable `--font-amiri`
- **Noto Naskh Arabic** : chargée via `next/font/google` — variable `--font-noto-arabic`
- **Scheherazade New** : chargée via `<link>` dans `layout.tsx` (fallback CSS)

### Polices legacy (woff2)

Les fichiers `Amiri-Regular.woff2` et `Amiri-Bold.woff2` sont des stubs vides —
la police Amiri est chargée via Google Fonts (`next/font/google`).
