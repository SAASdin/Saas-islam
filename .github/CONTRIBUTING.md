# 🤝 CONTRIBUTING — Guide de contribution

## Règle n°1 : Lire SOUL.md en premier

Avant tout, lire `docs/SOUL.md`. Ces règles sont non-négociables.

## Workflow Git

1. **Créer une issue** pour toute nouvelle fonctionnalité
2. **Travailler sur sa branche** : `dev/moha/[feature]` ou `dev/bilal/[feature]`
3. **Pull Request** vers `main` avec review obligatoire de l'autre développeur
4. **Toute PR touchant les données religieuses** doit inclure le hash SHA-256 des données concernées

## Conventions de commit

```
[moha] feat: description courte et claire
[bilal] fix: correction du bug sur l'affichage RTL
[moha] chore: mise à jour TASK_BOARD
```

## Ce qu'on ne fait jamais

- Push direct sur `main`
- Modifier un fichier `memory/*-[autre].md`
- Toucher aux données de la zone sacrée sans validation
- Commiter des secrets ou clés API
