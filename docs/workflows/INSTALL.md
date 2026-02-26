# Installation des GitHub Actions

## Pourquoi ce dossier existe

Le token GitHub actuel n'a que le scope `repo`.
GitHub exige le scope **`workflow`** pour pousser des fichiers dans `.github/workflows/`.

Les fichiers de workflows sont donc stockés ici temporairement.

## Installation (2 minutes)

### Étape 1 — Mettre à jour le token GitHub

1. Va sur https://github.com/settings/tokens
2. Clique sur ton token actuel
3. Coche la case **`workflow`**
4. Clique "Update token" et copie le nouveau token
5. Mets à jour le fichier local :
   ```bash
   # Édite le fichier et remplace le token
   nano /Users/islampc/.openclaw/workspace/.github_token
   ```

### Étape 2 — Déplacer les workflows et pousser

```bash
cd /path/to/saas-islam

# Copier les workflows dans .github/workflows/
cp docs/workflows/ci.yml .github/workflows/ci.yml
cp docs/workflows/pr-check-sacred.yml .github/workflows/pr-check-sacred.yml
cp docs/workflows/integrity-tests.yml .github/workflows/integrity-tests.yml

# Commit + push (scope workflow requis)
git add .github/workflows/
git commit -m "ci: activer GitHub Actions workflows"
git push origin dev/moha/ci-cd-setup
```

## Ce que font ces workflows

| Fichier | Rôle |
|---------|------|
| `ci.yml` | Pipeline principal : lint → test:integrity (BLOQUANT) → test:unit → build |
| `pr-check-sacred.yml` | Détecte les PR touchant la zone sacrée → commentaire + label |
| `integrity-tests.yml` | Tests d'intégrité complets avec PostgreSQL CI |
