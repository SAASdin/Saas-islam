# Polices islamiques — KFGQPC

## Police officielle Mushaf de Médine

La police **KFGQPC Uthmanic Script HAFS** est la police officielle du Mushaf de Médine,
utilisée dans les applications islamiques de référence (Tarteel, QuranExplorer, Quran.com).

### Téléchargement

La police n'est pas distribuable librement dans le repo Git.
Télécharge-la depuis la source officielle :

- **Source officielle** : https://fonts.qurancomplex.gov.sa/
- **Fichiers attendus** :
  - `KFGQPC-Uthmanic-Script-HAFS.ttf` (Regular 400)
  - `KFGQPC-Uthmanic-Script-HAFS-Bold.ttf` (Bold 700) — optionnel

### Installation

1. Place les fichiers `.ttf` dans ce dossier (`public/fonts/`)
2. Décommente la configuration dans `src/lib/fonts.ts`
3. Ajoute la variable CSS dans `src/app/globals.css` :

```css
@font-face {
  font-family: 'KFGQPC Uthmanic Script HAFS';
  src: url('/fonts/KFGQPC-Uthmanic-Script-HAFS.ttf') format('truetype');
  font-weight: 400;
  font-display: swap;
}
```

### Fallback actuel

Sans KFGQPC, la stack de polices utilise (dans l'ordre) :
1. **Amiri** (Google Fonts via `next/font/google`) ← actuelle
2. **Noto Naskh Arabic** (Google Fonts)
3. **Scheherazade New** (Google Fonts CDN)
4. serif (fallback système)

### ⚠️ Important

- Ne jamais utiliser Arial, Helvetica, ou une police sans-serif pour le texte coranique
- Taille minimum : 16px (1rem)
- `dir="rtl"` + `lang="ar"` obligatoires sur tous les éléments arabes
