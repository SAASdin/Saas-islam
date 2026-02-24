# ⚠️ ZONE SACRÉE — NE RIEN MODIFIER ICI

Ce dossier contient les données religieuses islamiques importées depuis des sources authentifiées.

## Règles absolues

- **Aucun fichier dans ce dossier ne doit être modifié manuellement**
- **Aucune migration ALTER/UPDATE/DELETE sur ces tables**
- L'utilisateur `app_user` n'a que le droit **SELECT** sur ces tables
- Tout import passe uniquement par les seeds validés par les deux collaborateurs (Moha + Bilal)
- Chaque import génère un hash SHA-256 stocké dans `database/integrity/`

## Contenu

- `quran/` → Données coraniques (Mushaf Hafs 'an 'Asim)
- `hadiths/` → Collections (Bukhari, Muslim, Abu Dawud, Tirmidhi, Nasa'i, Ibn Majah)
- `duas/` → Invocations catégorisées
- `allah_names/` → 99 noms d'Allah avec explications

## Sources approuvées

Voir `docs/DATA_SOURCES.md`

---

بارك الله فيكم — Que ce travail soit au service de la Ummah
