# Pull Request — Saas-islam

## Description

<!-- Résumé clair de ce qui a été fait -->

## Type de changement

- [ ] Nouvelle fonctionnalité
- [ ] Correction de bug
- [ ] Refactoring
- [ ] Documentation
- [ ] Infrastructure / configuration

## ⚠️ Checklist obligatoire avant merge

### Données religieuses
- [ ] Je n'ai modifié AUCUN contenu religieux (Coran, Hadiths, Mutun, Duas...)
- [ ] Je n'ai écrit AUCUN `INSERT / UPDATE / DELETE / ALTER` sur les tables sacrées
- [ ] Si des données religieuses ont été importées → hash SHA-256 inclus dans `database/integrity/`
- [ ] Je n'ai appliqué AUCUNE transformation (trim, normalize, lowercase) sur du texte arabe

### Code
- [ ] Aucun secret / clé API dans le code commité
- [ ] Le fichier `.env.example` est à jour si de nouvelles variables sont nécessaires
- [ ] Les fichiers suivent la structure définie dans `docs/ISLAMIC_PLATFORM.md`
- [ ] Je n'ai pas touché aux branches / fichiers de l'autre développeur

### Tests
- [ ] Les tests d'intégrité passent (`tests/integrity/`)
- [ ] Aucune régression sur les fonctionnalités existantes

## Tests effectués

<!-- Décris comment tu as testé les changements -->

## Captures d'écran (si applicable)

<!-- Screenshots de l'UI si changements visuels -->

## Notes pour le reviewer

<!-- Tout ce qui mérite attention lors de la review -->
