#!/usr/bin/env python3
"""
import-missing-collections.py
Import des collections manquantes : dehlawi + traduction FR Tirmidhi
Règles absolues : psycopg2 paramétré, texte arabe JAMAIS modifié
"""

import json, os, sys, time
from pathlib import Path
import psycopg2
from psycopg2.extras import execute_values

DB_URL  = os.environ.get('DATABASE_URL', 'postgresql://islampc@localhost:5432/saas_islam')
DATA    = Path(__file__).parent / 'hadith-data'

MISSING_COLLECTIONS = [
    {
        'key': 'dehlawi',
        'ar': 'ara-dehlawi',
        'en': 'eng-dehlawi',
        'fr': 'fra-dehlawi',
        'name_ar': 'الأربعون في أحاديث سيد المرسلين',
        'name_en': 'Forty Hadith of Shah Waliullah Dehlawi',
        'name_fr': '40 Hadiths de Shah Waliullah Dehlawi',
        'author': 'Shah Waliullah Dehlawi',
        'death': 1176,  # AH
    },
]

def load_edition(name):
    p = DATA / f'{name}.json'
    if not p.exists():
        print(f"  ⚠️  Fichier manquant : {p}")
        return None
    with open(p) as f:
        return json.load(f)

def import_collection(cur, conn, col):
    key = col['key']
    print(f"\n📚 {col['name_fr']} ({key})")

    d_ar = load_edition(col['ar'])
    d_en = load_edition(col['en'])
    d_fr = load_edition(col.get('fr')) if col.get('fr') else None

    if not d_ar or not d_en:
        print(f"  ⚠️  Fichiers AR/EN manquants — skip")
        return 0

    hadiths_ar = {h['hadithnumber']: h for h in d_ar.get('hadiths', [])}
    hadiths_en = {h['hadithnumber']: h for h in d_en.get('hadiths', [])}
    hadiths_fr = {h['hadithnumber']: h for h in d_fr.get('hadiths', [])} if d_fr else {}
    sections_en = d_en.get('metadata', {}).get('sections', {})
    sections_ar = d_ar.get('metadata', {}).get('sections', {})

    # Upsert collection
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
          col.get('death'), len(hadiths_ar), key))
    col_id = cur.fetchone()[0]
    print(f"  → collection_id={col_id}")

    # Livres/sections
    book_id_map = {}
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
        """, book_rows)

        cur.execute("SELECT id, book_number FROM sacred.hadith_books WHERE collection_id=%s", (col_id,))
        for row in cur.fetchall():
            book_id_map[row[1]] = row[0]
        print(f"  → {len(book_id_map)} livres")

    # Hadiths par batch de 500
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

            ref    = h_en.get('reference', {})
            bn     = str(ref.get('book')) if ref.get('book') else None
            book_id = book_id_map.get(bn) if bn else None
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

    conn.commit()
    print(f"  ✅ {inserted} hadiths importés pour {key}")
    return inserted


def update_tirmidhi_french(cur, conn):
    """Essaie de télécharger la traduction FR de Tirmidhi et met à jour la BDD."""
    import urllib.request
    url = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/fra-tirmidhi.min.json"
    print(f"\n🌐 Téléchargement traduction FR Tirmidhi...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'NoorBot/1.0'})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f"  ⚠️  Téléchargement échoué : {e}")
        # Essai alternatif CDN
        url2 = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/fra-tirmidhi.min.json"
        print(f"  → Essai CDN : {url2}")
        try:
            req2 = urllib.request.Request(url2, headers={'User-Agent': 'NoorBot/1.0'})
            with urllib.request.urlopen(req2, timeout=30) as r2:
                data = json.loads(r2.read().decode('utf-8'))
        except Exception as e2:
            print(f"  ⚠️  CDN aussi échoué : {e2}")
            return 0

    hadiths_fr = {h['hadithnumber']: h for h in data.get('hadiths', [])}
    print(f"  → {len(hadiths_fr)} hadiths FR Tirmidhi trouvés")

    if not hadiths_fr:
        print("  ⚠️  Aucun hadith FR — skip")
        return 0

    # Récupérer collection_id de Tirmidhi
    cur.execute("SELECT id FROM sacred.hadith_collections WHERE collection_key='tirmidhi'")
    row = cur.fetchone()
    if not row:
        print("  ⚠️  Collection Tirmidhi introuvable en BDD")
        return 0
    tirmidhi_id = row[0]

    updated = 0
    for hn, h in hadiths_fr.items():
        text_fr = h.get('text')
        if not text_fr:
            continue
        cur.execute("""
            UPDATE sacred.hadiths
            SET text_french = %s
            WHERE collection_id = %s AND hadith_number = %s AND (text_french IS NULL OR text_french = '')
        """, (text_fr, tirmidhi_id, str(hn)))
        updated += cur.rowcount

    conn.commit()
    print(f"  ✅ {updated} hadiths Tirmidhi mis à jour avec traduction FR")
    return updated


def main():
    print('\n🌙 NoorBot — Import collections manquantes\n')
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    total = 0

    # 1. Collections manquantes
    for col in MISSING_COLLECTIONS:
        # Vérifier si déjà en BDD
        cur.execute("SELECT COUNT(*) FROM sacred.hadiths h JOIN sacred.hadith_collections hc ON h.collection_id=hc.id WHERE hc.collection_key=%s", (col['key'],))
        existing = cur.fetchone()[0]
        if existing > 0:
            print(f"\n✅ {col['key']} déjà en BDD ({existing} hadiths) — skip")
            continue
        n = import_collection(cur, conn, col)
        total += n

    # 2. Traduction FR Tirmidhi
    updated_fr = update_tirmidhi_french(cur, conn)

    # Résumé final
    cur.execute("""
        SELECT hc.collection_key, hc.name_french, COUNT(h.id) as n
        FROM sacred.hadith_collections hc
        LEFT JOIN sacred.hadiths h ON h.collection_id = hc.id
        GROUP BY hc.id
        ORDER BY n DESC
    """)
    rows = cur.fetchall()

    print('\n══════════════════════════════════════════')
    print(f'✅ Import terminé\n')
    print(f'{"Collection":<20} {"Nom":<40} {"Hadiths":>8}')
    print('─' * 72)
    grand_total = 0
    for row in rows:
        print(f'{row[0]:<20} {row[1]:<40} {row[2]:>8,}')
        grand_total += row[2]
    print('─' * 72)
    print(f'{"TOTAL":<61} {grand_total:>8,}')

    cur.close()
    conn.close()

if __name__ == '__main__':
    main()
