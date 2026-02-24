# 🗄️ Base de données — Saas-islam

## Ordre d'exécution

```bash
psql -U postgres -d saas_islam -f migrations/000_setup_database.sql
psql -U postgres -d saas_islam -f migrations/001_sacred_zone.sql
psql -U postgres -d saas_islam -f migrations/002_app_zone.sql
psql -U postgres -d saas_islam -f migrations/003_media_zone.sql
psql -U postgres -d saas_islam -f migrations/004_audit_integrity.sql
```

## Architecture des zones

| Zone | Schéma | Permissions app_user | Description |
|------|--------|---------------------|-------------|
| 🔒 Sacrée | `sacred` | SELECT uniquement | Coran, Hadiths, Duas, Mutun, Livres |
| 🔓 Applicative | `app` | SELECT + INSERT + UPDATE + DELETE | Utilisateurs, progression, social, académie |
| 🎬 Média | `media` | SELECT uniquement | Vidéos, audio, récitations |

## Tables de la zone sacrée

| Table | Description |
|-------|-------------|
| `sacred.quran_surahs` | 114 sourates |
| `sacred.quran_ayahs` | Versets (texte Uthmani Hafs) |
| `sacred.quran_translations` | Traductions validées |
| `sacred.quran_tafsirs` | Exégèses (Ibn Kathir, Saadi...) |
| `sacred.quran_word_by_word` | Traduction mot à mot |
| `sacred.quran_tajweed` | Règles de tajweed |
| `sacred.hadiths` | Textes complets |
| `sacred.hadith_collections` | Bukhari, Muslim, Tirmidhi... |
| `sacred.hadith_narrators` | Chaînes de narration |
| `sacred.duas` | Invocations |
| `sacred.allah_names` | 99 Noms d'Allah |
| `sacred.prophets` | Seerah des Prophètes |
| `sacred.mutun` | Textes de mémorisation |
| `sacred.mutun_lines` | Vers des Mutun |
| `sacred.reference_books` | Livres islamiques |

## ⚠️ Règles absolues

1. **JAMAIS** de migration UPDATE/DELETE/ALTER sur la zone sacrée
2. **JAMAIS** d'INSERT direct — uniquement via les scripts `seeds/` validés
3. Tout import → générer un hash SHA-256 dans `app.integrity_hashes`
4. Les triggers d'audit bloquent et loguent toute tentative d'écriture
5. Toute migration sur zone sacrée → validation des deux collaborateurs (Moha + Bilal)
