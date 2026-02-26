#!/usr/bin/env python3
"""
import-hadiths.py
Import direct hadith JSON → PostgreSQL via psycopg2 (requêtes paramétrées)
Aucun risque de syntax error sur le texte arabe/anglais/français
"""

import json, os, sys, time
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

DB_URL  = os.environ.get('DATABASE_URL', 'postgresql://islampc@localhost:5432/saas_islam')
DATA    = Path(__file__).parent / 'hadith-data'
SCRIPTS = Path(__file__).parent

COLLECTIONS = [
    {'key':'bukhari',  'ar':'ara-bukhari',  'en':'eng-bukhari',  'fr':'fra-bukhari',
     'name_ar':'صحيح البخاري',  'name_en':'Sahih al-Bukhari',     'name_fr':'Sahih Al-Bukhari',
     'author':'Al-Bukhari', 'death':256},
    {'key':'muslim',   'ar':'ara-muslim',   'en':'eng-muslim',   'fr':'fra-muslim',
     'name_ar':'صحيح مسلم',     'name_en':'Sahih Muslim',          'name_fr':'Sahih Muslim',
     'author':'Muslim ibn al-Hajjaj', 'death':261},
    {'key':'nasai',    'ar':'ara-nasai',    'en':'eng-nasai',    'fr':'fra-nasai',
     'name_ar':'سنن النسائي',    'name_en':"Sunan an-Nasa'i",       'name_fr':"Sunan an-Nasa'i",
     'author':"An-Nasa'i", 'death':303},
    {'key':'abudawud', 'ar':'ara-abudawud', 'en':'eng-abudawud', 'fr':'fra-abudawud',
     'name_ar':'سنن أبي داود',  'name_en':'Sunan Abi Dawud',       'name_fr':'Sunan Abi Dawud',
     'author':'Abu Dawud', 'death':275},
    {'key':'tirmidhi', 'ar':'ara-tirmidhi', 'en':'eng-tirmidhi', 'fr':None,
     'name_ar':'جامع الترمذي',  'name_en':"Jami' at-Tirmidhi",     'name_fr':"Jami' at-Tirmidhi",
     'author':'At-Tirmidhi', 'death':279},
    {'key':'ibnmajah', 'ar':'ara-ibnmajah', 'en':'eng-ibnmajah', 'fr':'fra-ibnmajah',
     'name_ar':'سنن ابن ماجه',  'name_en':'Sunan Ibn Majah',        'name_fr':'Sunan Ibn Majah',
     'author':'Ibn Majah', 'death':273},
    {'key':'malik',    'ar':'ara-malik',    'en':'eng-malik',    'fr':'fra-malik',
     'name_ar':'موطأ مالك',     'name_en':'Muwatta Malik',          'name_fr':'Muwatta Malik',
     'author':'Malik ibn Anas', 'death':179},
    {'key':'nawawi40', 'ar':'ara-nawawi',   'en':'eng-nawawi',   'fr':'fra-nawawi',
     'name_ar':'الأربعون النووية', 'name_en':"An-Nawawi's Forty Hadith", 'name_fr':'40 Hadiths de Nawawi',
     'author':'An-Nawawi', 'death':676},
    {'key':'qudsi40',  'ar':'ara-qudsi',    'en':'eng-qudsi',    'fr':'fra-qudsi',
     'name_ar':'الأربعون القدسية', 'name_en':'Forty Hadith Qudsi', 'name_fr':'40 Hadiths Qudsi',
     'author':'Divers', 'death':None},
]

def load_edition(name):
    p = DATA / f'{name}.json'
    if not p.exists():
        return None
    with open(p) as f:
        d = json.load(f)
    return d

def main():
    print('\n🌙 NoorBot — Import hadiths → PostgreSQL\n')
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # S'assurer que la colonne death_year_hijri existe
    cur.execute("ALTER TABLE sacred.hadith_collections ADD COLUMN IF NOT EXISTS death_year_hijri SMALLINT;")
    conn.commit()

    total_imported = 0

    for col in COLLECTIONS:
        key = col['key']
        print(f"\n📚 {col['name_fr']} ({key})")

        # Charger les éditions
        d_ar = load_edition(col['ar'])
        d_en = load_edition(col['en'])
        d_fr = load_edition(col['fr']) if col['fr'] else None

        if not d_ar or not d_en:
            print(f"  ⚠️  Fichiers manquants — skip (lance fetch-hadiths-v2.js d'abord)")
            continue

        hadiths_ar  = {h['hadithnumber']: h for h in d_ar.get('hadiths', [])}
        hadiths_en  = {h['hadithnumber']: h for h in d_en.get('hadiths', [])}
        hadiths_fr  = {h['hadithnumber']: h for h in d_fr.get('hadiths', [])} if d_fr else {}
        sections_en = d_en.get('metadata', {}).get('sections', {})
        sections_ar = d_ar.get('metadata', {}).get('sections', {})

        # 1. Upsert collection
        cur.execute("""
            INSERT INTO sacred.hadith_collections
                (name_arabic, name_french, name_english, author, death_year_hijri, total_hadiths, collection_key)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (collection_key) DO UPDATE SET
                name_arabic = EXCLUDED.name_arabic,
                name_french = EXCLUDED.name_french,
                name_english = EXCLUDED.name_english,
                author = EXCLUDED.author,
                death_year_hijri = EXCLUDED.death_year_hijri,
                total_hadiths = EXCLUDED.total_hadiths
            RETURNING id
        """, (col['name_ar'], col['name_fr'], col['name_en'], col['author'],
              col['death'], len(hadiths_ar), key))
        col_id = cur.fetchone()[0]
        print(f"  → collection_id={col_id}")

        # 2. Livres (sections)
        book_id_map = {}  # book_number -> id
        book_nums = [k for k in sections_en if k != '0' and sections_en[k]]
        if book_nums:
            book_rows = []
            for bn in book_nums:
                name_ar_b = sections_ar.get(bn) or None
                name_en_b = sections_en.get(bn) or None
                book_rows.append((col_id, bn, name_ar_b, name_en_b))

            execute_values(cur, """
                INSERT INTO sacred.hadith_books (collection_id, book_number, name_arabic, name_english)
                VALUES %s
                ON CONFLICT (collection_id, book_number) DO NOTHING
                RETURNING id, book_number
            """, book_rows, fetch=True)

            # Récupérer les IDs
            cur.execute("SELECT id, book_number FROM sacred.hadith_books WHERE collection_id=%s", (col_id,))
            for row in cur.fetchall():
                book_id_map[row[1]] = row[0]
            print(f"  → {len(book_id_map)} livres")

        # 3. Hadiths — batch de 500
        all_nums = sorted(hadiths_ar.keys())
        BATCH = 500
        inserted = 0

        for i in range(0, len(all_nums), BATCH):
            batch = all_nums[i:i+BATCH]
            rows = []
            for hn in batch:
                h_ar = hadiths_ar.get(hn, {})
                h_en = hadiths_en.get(hn, {})
                h_fr = hadiths_fr.get(hn, {})

                text_ar = h_ar.get('text') or ''
                text_en = h_en.get('text') or None
                text_fr = h_fr.get('text') or None

                grades    = h_en.get('grades', [])
                grade     = grades[0].get('grade') if grades else None
                grade_src = grades[0].get('gradedBy') if grades else None

                ref       = h_en.get('reference', {})
                bn        = str(ref.get('book')) if ref.get('book') else None
                book_id   = book_id_map.get(bn) if bn else None

                reference = f"{col['name_en']} {hn}"

                rows.append((
                    col_id, str(hn), bn, book_id,
                    text_ar, text_en, text_fr,
                    grade, grade_src, reference
                ))

            execute_values(cur, """
                INSERT INTO sacred.hadiths
                    (collection_id, hadith_number, book_number, book_id,
                     text_arabic, text_english, text_french,
                     grade, grade_source, reference)
                VALUES %s
                ON CONFLICT (collection_id, hadith_number) DO NOTHING
            """, rows)
            inserted += len(batch)
            print(f"\r  → {inserted}/{len(all_nums)} hadiths", end='', flush=True)

        conn.commit()
        print(f"\n  ✅ {inserted} hadiths importés")
        total_imported += inserted

    # Vérification finale
    cur.execute("""
        SELECT hc.collection_key, hc.name_french, COUNT(h.id) as n
        FROM sacred.hadith_collections hc
        LEFT JOIN sacred.hadiths h ON h.collection_id = hc.id
        GROUP BY hc.id
        ORDER BY n DESC
    """)
    rows = cur.fetchall()

    print('\n══════════════════════════════════════════')
    print(f'✅ Import terminé — {total_imported} hadiths au total\n')
    print(f'{"Collection":<15} {"Nom":<35} {"Hadiths":>8}')
    print('─' * 62)
    grand_total = 0
    for row in rows:
        print(f'{row[0]:<15} {row[1]:<35} {row[2]:>8,}')
        grand_total += row[2]
    print('─' * 62)
    print(f'{"TOTAL":<51} {grand_total:>8,}')

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
