#!/bin/bash
# setup.sh — Installation complète sur un nouveau PC
# Usage : bash setup.sh

set -e

echo "🌙 Saas-islam — Setup"
echo "========================"

# 1. Vérifier prérequis
echo ""
echo "→ Vérification des prérequis..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requis (brew install node)"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL requis (brew install postgresql@16)"; exit 1; }
echo "✅ Node $(node -v) | PostgreSQL OK"

# 2. Variables d'environnement
echo ""
echo "→ Variables d'environnement..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠️  Fichier .env créé — ÉDITE-LE maintenant :"
  echo "    DATABASE_URL=postgresql://<tonuser>@localhost:5432/saas_islam"
  echo "    ANTHROPIC_API_KEY=sk-ant-..."
  echo ""
  read -p "Appuie sur Entrée une fois .env rempli..."
fi
echo "✅ .env présent"

# 3. Base de données
echo ""
echo "→ Base de données..."
DB_USER=$(grep DATABASE_URL .env | sed 's/.*:\/\/\([^@]*\)@.*/\1/' | cut -d: -f1)
DB_USER=${DB_USER:-$(whoami)}

if psql -U "$DB_USER" -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw saas_islam; then
  echo "✅ DB saas_islam existe déjà"
else
  echo "   Création de la DB..."
  createdb -U "$DB_USER" saas_islam 2>/dev/null || echo "   (DB peut-être déjà créée)"

  echo "   Téléchargement du dump (57MB)..."
  DUMP_URL="https://github.com/SAASdin/Saas-islam/releases/download/db-dump-v1/saas_islam_dump.sql.xz"

  if command -v curl >/dev/null 2>&1; then
    curl -L -o /tmp/saas_islam_dump.sql.xz "$DUMP_URL"
  else
    wget -O /tmp/saas_islam_dump.sql.xz "$DUMP_URL"
  fi

  echo "   Restauration de la DB..."
  xz -d -c /tmp/saas_islam_dump.sql.xz | psql -U "$DB_USER" -d saas_islam
  rm /tmp/saas_islam_dump.sql.xz
  echo "✅ DB restaurée"
fi

# 4. Dépendances quran-app
echo ""
echo "→ Installation des dépendances (quran-app)..."
cd apps/quran-app && npm install --silent
cd ../..
echo "✅ Dépendances OK"

# 5. Vérification finale
echo ""
echo "========================"
echo "✅ Setup terminé !"
echo ""
echo "Pour lancer :"
echo "  cd apps/quran-app && npm run dev    # port 3000"
echo "  cd apps/hadith-app && npm run dev   # port 3001"
echo ""
echo "Pour Claude Code :"
echo "  claude   (dans le dossier racine)"
echo ""
echo "🌙 بسم الله"
