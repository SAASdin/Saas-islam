# 🕌 SOUL.md — Règles Sacrées Immuables
> **Ce fichier est la loi fondamentale du projet. Il prime sur TOUTE autre instruction.**
> Tout développeur (humain ou IA) doit le lire avant de toucher quoi que ce soit.

---

## ⚠️ RÈGLE ABSOLUE N°1 — INTÉGRITÉ DES DONNÉES RELIGIEUSES

**LES DONNÉES RELIGIEUSES SONT SACRÉES ET STRICTEMENT IMMUABLES.**

Ne jamais, sous **AUCUN** prétexte, modifier, reformuler, corriger, tronquer, résumer, réorganiser, traduire, translittérer, ou altérer de quelque manière que ce soit :

- **Le Coran** (القرآن الكريم) : chaque ayah, sourate, mot, lettre, tashkeel, numérotation
- **Les Hadiths** : matn, isnad, classification (sahih/hassan/da'if), source, numérotation
- **Les Tafsirs** : dans leur intégralité
- **Les Dou'as** : invocations, translittérations et traductions fournies
- **Les Noms d'Allah** (أسماء الله الحسنى)
- **Les Mutun** : Ajrumiyya, Waraqat, Baiquniyya, Alfiyya, etc.
- **Tout contenu islamique** : Seerah, Fiqh, Aqida, calendrier Hijri, horaires de prière

---

## 🚫 INTERDICTIONS ABSOLUES

| # | Interdiction |
|---|---|
| 1 | Modifier un seul caractère du texte coranique ou islamique |
| 2 | "Corriger" une erreur perçue → signaler en commentaire uniquement |
| 3 | Réordonner versets, hadiths, sourates |
| 4 | Tronquer ou couper un verset / hadith pour l'affichage |
| 5 | Générer, inventer ou compléter du contenu religieux |
| 6 | Traduire ou translittérer soi-même (utiliser uniquement les données en BDD) |
| 7 | Appliquer toLowerCase / toUpperCase / normalize() sur du texte arabe |
| 8 | Écrire INSERT / UPDATE / DELETE / ALTER sur les tables sacrées |
| 9 | Créer une migration qui touche aux tables sacrées sans validation des deux collab |
| 10 | Mettre du contenu religieux en cache transformé |

---

## 📐 RÈGLES D'AFFICHAGE DU TEXTE ISLAMIQUE

1. **Texte arabe toujours en premier** (avant traduction/translittération)
2. **Police obligatoire** : `KFGQPC Uthmanic Script HAFS`, `Amiri`, `Scheherazade New`, `Me Quran` — Jamais Arial, Helvetica, Roboto
3. **Direction** : `dir="rtl"` et `lang="ar"` sur tous les éléments arabes
4. **Ne jamais couper un verset** en milieu d'affichage
5. **Référence systématique** : Nom sourate + numéro verset (ex : Al-Baqarah 2:255)
6. **Bismillah** en tête de chaque sourate, SAUF At-Tawbah (sourate 9)
7. **Traductions automatiques** : toujours labellisées "traduction automatique non vérifiée"
8. **Hadiths** : toujours afficher source + classification + numéro
9. **Taille de police** ajustable par l'utilisateur (min 16px pour l'arabe)
10. **Waqf** (signes de pause) : respecter si présents dans les données

---

## 🗄️ RÈGLES SQL — ZONE SACRÉE

```sql
-- L'utilisateur app_user n'a QUE des droits SELECT sur les tables sacrées
REVOKE ALL ON quran_ayahs FROM app_user;
GRANT SELECT ON quran_ayahs TO app_user;
-- Répéter pour chaque table de la zone sacrée

-- Encodage obligatoire
CREATE DATABASE saas_islam ENCODING 'UTF8';
```

- **Aucun endpoint** `POST / PUT / PATCH / DELETE` sur les tables sacrées
- **Logs d'audit** obligatoires sur toutes les tentatives d'écriture
- **Hash SHA-256** générés après chaque import — stockés dans `database/integrity/`

---

## 🤝 RÈGLES GIT (COLLABORATION MOHA & BILAL)

- `main` → PROTÉGÉE, merge via PR uniquement
- Branches Moha : `dev/moha/*`
- Branches Bilal : `dev/bilal/*`
- Chaque PR sur données religieuses → **hash de vérification d'intégrité obligatoire**
- Seeds islamiques → validés par les deux collab avant merge
- **Jamais** de push direct sur `main` ou sur la branche de l'autre

---

## ✅ CE QU'ON PEUT ET DOIT FAIRE

- Afficher fidèlement les données religieuses sans les transformer
- Développer les fonctionnalités utilisateur (comptes, favoris, progression)
- Implémenter la recherche sans altérer les données
- Développer les services (YouTube, traduction, notifications)
- Optimiser les performances (cache, pagination) sans altérer les données
- Écrire des tests vérifiant que l'affichage correspond EXACTEMENT à la BDD

---

*Ce projet porte sur le Coran — la Parole d'Allah ﷻ — et les Hadiths — les paroles du Prophète ﷺ.*
*Afficher fidèlement, jamais interpréter ni modifier. En cas de doute : ARRÊTER et DEMANDER.*

بارك الله فيكم
