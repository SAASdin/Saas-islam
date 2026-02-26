#!/bin/bash
# hadiths_00_run_all.sh — Import toutes les collections
set -e
DB="${DATABASE_URL:-postgresql://islampc@localhost:5432/saas_islam}"
SEEDS="$(dirname "$0")"

echo "🌙 Import hadiths..."

# Migration
psql "$DB" -f "$(dirname "$SEEDS")/migrations/006_hadith_books_chapters.sql" -v ON_ERROR_STOP=0

# Collections
psql "$DB" -f "$SEEDS/hadiths_01_collections.sql"

echo "📚 Sahih Al-Bukhari..."
psql "$DB" -f "$SEEDS/hadiths_02_bukhari.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Sahih Muslim..."
psql "$DB" -f "$SEEDS/hadiths_02_muslim.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Sunan an-Nasa'i..."
psql "$DB" -f "$SEEDS/hadiths_02_nasai.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Sunan Abi Dawud..."
psql "$DB" -f "$SEEDS/hadiths_02_abudawud.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Jami' at-Tirmidhi..."
psql "$DB" -f "$SEEDS/hadiths_02_tirmidhi.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Sunan Ibn Majah..."
psql "$DB" -f "$SEEDS/hadiths_02_ibnmajah.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 Muwatta Malik..."
psql "$DB" -f "$SEEDS/hadiths_02_malik.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 40 Hadiths de Nawawi..."
psql "$DB" -f "$SEEDS/hadiths_02_nawawi40.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo "📚 40 Hadiths Qudsi..."
psql "$DB" -f "$SEEDS/hadiths_02_qudsi40.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5

echo ""
echo "✅ Terminé !"
psql "$DB" -c "SELECT hc.collection_key, hc.name_french, COUNT(h.id) as hadiths_loaded FROM sacred.hadith_collections hc LEFT JOIN sacred.hadiths h ON h.collection_id = hc.id GROUP BY hc.id ORDER BY hadiths_loaded DESC;"
