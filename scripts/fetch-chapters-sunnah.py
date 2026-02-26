#!/usr/bin/env python3
"""
fetch-chapters-sunnah.py
Récupère les chapitres depuis sunnah.com API et les insère en BDD
Rate limit: 400ms entre requêtes, retry sur 429
"""

import json, os, sys, time
import urllib.request, urllib.error
import psycopg2
from psycopg2.extras import execute_values

DB_URL   = os.environ.get('DATABASE_URL', 'postgresql://islampc@localhost:5432/saas_islam')
API_KEY  = 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'
BASE_URL = 'https://api.sunnah.com/v1'
DELAY    = 0.4  # 400ms entre requêtes

# Mapping collection_key DB → sunnah.com name
# (uniquement les collections qui ont hasChapters=yes)
COLLECTION_MAP = {
    'bukhari':        'bukhari',
    'muslim':         'muslim',
    'nasai':          'nasai',
    'abudawud':       'abudawud',
    'tirmidhi':       'tirmidhi',
    'ibnmajah':       'ibnmajah',
    'malik':          'malik',
    'riyadussalihin': 'riyadussalihin',
}

request_count = 0

def api_get(path):
    """GET sunnah.com avec retry sur 429."""
    global request_count
    url = f"{BASE_URL}{path}"
    for attempt in range(5):
        try:
            time.sleep(DELAY)
            req = urllib.request.Request(url, headers={
                'X-API-Key': API_KEY,
                'User-Agent': 'NoorBot/1.0'
            })
            with urllib.request.urlopen(req, timeout=30) as r:
                request_count += 1
                return json.loads(r.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                wait = 2 ** attempt
                print(f"\n  ⏳ Rate limit 429 — retry dans {wait}s", end='', flush=True)
                time.sleep(wait)
                continue
            elif e.code == 404:
                return None
            else:
                print(f"\n  ⚠️  HTTP {e.code} sur {url}")
                return None
        except Exception as e:
            print(f"\n  ⚠️  Erreur : {e}")
            return None
    return None


def get_books(sunnah_col, limit=200):
    """Récupère tous les livres d'une collection."""
    data = api_get(f"/collections/{sunnah_col}/books?limit={limit}")
    if not data:
        return []
    return data.get('data', [])


def get_chapters(sunnah_col, book_number, limit=200):
    """Récupère tous les chapitres d'un livre."""
    data = api_get(f"/collections/{sunnah_col}/books/{book_number}/chapters?limit={limit}")
    if not data:
        return []
    return data.get('data', [])


def main():
    print('\n🌙 NoorBot — Fetch chapitres sunnah.com\n')
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # Récupérer les collections en BDD
    cur.execute("SELECT id, collection_key FROM sacred.hadith_collections")
    db_collections = {row[1]: row[0] for row in cur.fetchall()}

    total_chapters = 0

    for db_key, sunnah_key in COLLECTION_MAP.items():
        if db_key not in db_collections:
            print(f"\n⚠️  {db_key} non trouvé en BDD — skip")
            continue

        col_id = db_collections[db_key]
        print(f"\n📚 {db_key} (id={col_id}) → sunnah.com/{sunnah_key}")

        # Récupérer les livres depuis sunnah.com
        sunnah_books = get_books(sunnah_key)
        if not sunnah_books:
            print(f"  ⚠️  Aucun livre récupéré depuis sunnah.com — skip")
            continue

        print(f"  → {len(sunnah_books)} livres trouvés dans sunnah.com")

        # Récupérer le mapping book_number → book_id en BDD
        cur.execute("""
            SELECT id, book_number FROM sacred.hadith_books WHERE collection_id=%s
        """, (col_id,))
        db_book_map = {row[1]: row[0] for row in cur.fetchall()}

        # Pour riyadussalihin (0 livres en BDD), insérer les livres depuis sunnah.com
        if not db_book_map:
            print(f"  → Création des livres pour {db_key} depuis sunnah.com...")
            book_rows = []
            for b in sunnah_books:
                bn = str(b['bookNumber'])
                name_ar = next((x['name'] for x in b['book'] if x['lang']=='ar'), None)
                name_en = next((x['name'] for x in b['book'] if x['lang']=='en'), None)
                book_rows.append((col_id, bn, name_ar, name_en))

            if book_rows:
                execute_values(cur, """
                    INSERT INTO sacred.hadith_books (collection_id, book_number, name_arabic, name_english)
                    VALUES %s
                    ON CONFLICT (collection_id, book_number) DO NOTHING
                """, book_rows)
                conn.commit()

                cur.execute("""
                    SELECT id, book_number FROM sacred.hadith_books WHERE collection_id=%s
                """, (col_id,))
                db_book_map = {row[1]: row[0] for row in cur.fetchall()}
                print(f"  → {len(db_book_map)} livres créés")

        # Pour chaque livre, fetch les chapitres
        col_chapters = 0
        for b in sunnah_books:
            bn = str(b['bookNumber'])
            book_id = db_book_map.get(bn)

            chapters = get_chapters(sunnah_key, bn)
            if not chapters:
                continue

            chapter_rows = []
            for ch in chapters:
                chapter_id_str = str(ch.get('chapterId', ''))
                if not chapter_id_str:
                    continue

                ch_list = ch.get('chapter', [])
                name_ar = next((x['chapterTitle'] for x in ch_list if x['lang']=='ar'), None)
                name_en = next((x['chapterTitle'] for x in ch_list if x['lang']=='en'), None)
                intro   = next((x.get('intro') for x in ch_list if x['lang']=='en'), None)
                ending  = next((x.get('ending') for x in ch_list if x['lang']=='en'), None)

                chapter_rows.append((col_id, book_id, chapter_id_str, name_ar, name_en, intro, ending))

            if chapter_rows:
                execute_values(cur, """
                    INSERT INTO sacred.hadith_chapters
                        (collection_id, book_id, chapter_number, name_arabic, name_english, intro, ending)
                    VALUES %s
                    ON CONFLICT (collection_id, chapter_number) DO UPDATE SET
                        name_arabic = EXCLUDED.name_arabic,
                        name_english = EXCLUDED.name_english,
                        intro = EXCLUDED.intro,
                        ending = EXCLUDED.ending
                """, chapter_rows)
                col_chapters += len(chapter_rows)

            print(f"\r  → Livre {bn}: {len(chapters)} chapitres | total={col_chapters}", end='', flush=True)

        conn.commit()
        print(f"\n  ✅ {col_chapters} chapitres importés pour {db_key}")
        total_chapters += col_chapters

    # Résumé
    cur.execute("""
        SELECT hc.collection_key, COUNT(ch.id) as chapters
        FROM sacred.hadith_collections hc
        LEFT JOIN sacred.hadith_chapters ch ON ch.collection_id=hc.id
        GROUP BY hc.id
        ORDER BY chapters DESC
    """)
    rows = cur.fetchall()

    print(f'\n══════════════════════════════════════════')
    print(f'✅ {total_chapters} chapitres importés au total | {request_count} requêtes API\n')
    print(f'{"Collection":<25} {"Chapitres":>10}')
    print('─' * 40)
    for row in rows:
        if row[1] > 0:
            print(f'{row[0]:<25} {row[1]:>10,}')
    print('─' * 40)

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
