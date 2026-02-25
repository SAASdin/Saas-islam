#!/usr/bin/env python3
"""
import_shamela.py
Import des fatwas depuis les fichiers Archive .mdb de Shamela
via mdb-export (mdbtools) → PostgreSQL

⚠️ ZONE QUASI-SACRÉE : champ `nass` (texte arabe) jamais modifié
"""

import csv
import hashlib
import io
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Optional

import psycopg2
import psycopg2.extras

# ── Configuration ─────────────────────────────────────────────
DB_URL = "postgresql://islampc@localhost:5432/saas_islam"
EXTRACTED_DIR = Path("/tmp/shamela-bok/extracted")
HASHES_FILE = Path("/Users/islampc/.openclaw/workspace/saas-islam/database/integrity/fatwa-hashes.json")
CHECKPOINT_FILE = Path("/tmp/shamela-import-checkpoint.json")

# ── Livres cibles ─────────────────────────────────────────────
TARGET_BOOKS = [
    {"bkid": 21537, "archive": 4, "madhab": "salafi",  "era": "contemporain",
     "scholar_ar": "عبد العزيز بن عبد الله بن باز", "scholar_fr": "Ibn Baz",
     "title_ar": "مجموع فتاوى ابن باز", "title_fr": "Majmu' Fatawa Ibn Baz", "vols": 30},

    {"bkid": 12293, "archive": 5, "madhab": "salafi",  "era": "contemporain",
     "scholar_ar": "محمد بن صالح العثيمين", "scholar_fr": "Ibn Uthaymin",
     "title_ar": "مجموع فتاوى ورسائل العثيمين", "title_fr": "Majmu' Fatawa Ibn Uthaymin", "vols": 26},

    {"bkid":  8381, "archive": 6, "madhab": "salafi",  "era": "contemporain",
     "scholar_ar": "اللجنة الدائمة للبحوث العلمية والإفتاء", "scholar_fr": "Lajnah Ad-Da'ima",
     "title_ar": "فتاوى اللجنة الدائمة - 1", "title_fr": "Fatawa Lajnah - Vol.1-11", "vols": 11},

    {"bkid": 21772, "archive": 6, "madhab": "salafi",  "era": "contemporain",
     "scholar_ar": "اللجنة الدائمة للبحوث العلمية والإفتاء", "scholar_fr": "Lajnah Ad-Da'ima",
     "title_ar": "فتاوى اللجنة الدائمة - 2", "title_fr": "Fatawa Lajnah - Vol.12-26", "vols": 15},

    {"bkid":  9690, "archive": 6, "madhab": "hanbali", "era": "classique",
     "scholar_ar": "أحمد بن عبد الحليم ابن تيمية", "scholar_fr": "Ibn Taymiyyah",
     "title_ar": "الفتاوى الكبرى لابن تيمية", "title_fr": "Al-Fatawa al-Kubra - Ibn Taymiyyah", "vols": 6},

    {"bkid": 21640, "archive": 6, "madhab": "hanafi",  "era": "classique",
     "scholar_ar": "لجنة علماء برئاسة نظام الدين البرهانبوري", "scholar_fr": "Savants hanafites (Hindiyya)",
     "title_ar": "الفتاوى الهندية (العالمكيرية)", "title_fr": "Al-Fatawa al-Hindiyya", "vols": 6},

    {"bkid": 11496, "archive": 7, "madhab": "hanbali", "era": "classique",
     "scholar_ar": "محمد بن أبي بكر ابن قيم الجوزية", "scholar_fr": "Ibn al-Qayyim al-Jawziyya",
     "title_ar": "إعلام الموقعين عن رب العالمين", "title_fr": "I'lam al-Muwaqqi'in", "vols": 4},

    {"bkid": 21628, "archive": 3, "madhab": "shafii",  "era": "classique",
     "scholar_ar": "أحمد بن محمد ابن حجر الهيثمي", "scholar_fr": "Ibn Hajar al-Haytami",
     "title_ar": "الفتاوى الفقهية الكبرى", "title_fr": "Al-Fatawa al-Fiqhiyya al-Kubra", "vols": 4},

    {"bkid": 21623, "archive": 3, "madhab": "shafii",  "era": "classique",
     "scholar_ar": "شمس الدين الرملي", "scholar_fr": "Shams al-Din al-Ramli",
     "title_ar": "فتاوى الرملي", "title_fr": "Fatawa al-Ramli", "vols": 4},

    {"bkid": 11498, "archive": 3, "madhab": "shafii",  "era": "classique",
     "scholar_ar": "تقي الدين السبكي", "scholar_fr": "Taqi al-Din al-Subki",
     "title_ar": "فتاوى السبكي", "title_fr": "Fatawa al-Subki", "vols": 2},
]

# ── Classificateur de domaine ─────────────────────────────────
import re
DOMAIN_MAP = [
    (re.compile(r'طهارة|وضوء|غسل|تيمم|نجاسة|حيض|جنابة'), 'purification-taharah'),
    (re.compile(r'صلاة|صلوات|جمعة|أذان|إمامة|قبلة|سجود|ركوع'), 'priere-salat'),
    (re.compile(r'زكاة|صدقة|نصاب|عشر'), 'zakat'),
    (re.compile(r'صيام|صوم|رمضان|إفطار|سحور|اعتكاف'), 'jeune-siyam'),
    (re.compile(r'حج|عمرة|إحرام|طواف|سعي|حرم|مكة|منى|عرفة'), 'hajj-umrah'),
    (re.compile(r'نكاح|زواج|خطبة|مهر|ولاية|زوجة|زوج'), 'mariage-nikah'),
    (re.compile(r'طلاق|خلع|فسخ|عدة|رجعة|إيلاء|ظهار|لعان'), 'divorce-talaq'),
    (re.compile(r'مواريث|ميراث|وصية|تركة|فرائض|إرث|وارث'), 'heritage-mawaris'),
    (re.compile(r'بيوع|بيع|شراء|إجارة|وكالة|شركة|رهن|مضاربة'), 'commerce-muamalat'),
    (re.compile(r'ربا|مصارف|بنوك|تأمين|أسهم|صكوك|مرابحة'), 'finance-islamique'),
    (re.compile(r'أطعمة|ذبائح|صيد|خمر|مسكر|حلال|حرام'), 'alimentation-atimah'),
    (re.compile(r'لباس|زينة|حجاب|ذهب|فضة|حرير|عطر'), 'habillement-libs'),
    (re.compile(r'أخلاق|معاملة|جيران|صلة|رحم|والدين|بر'), 'relations-sociales'),
    (re.compile(r'عقيدة|توحيد|إيمان|شرك|بدعة|ولاء|براء'), 'aqida-croyance'),
    (re.compile(r'قرآن|تلاوة|تجويد|حفظ|تفسير|مصحف'), 'coran-lecture'),
    (re.compile(r'أذكار|دعاء|رقية|تسبيح|استغفار'), 'invocations-adkar'),
    (re.compile(r'طب|علاج|دواء|جراحة|تبرع|أعضاء|مريض'), 'medical-sante'),
    (re.compile(r'عمل|وظيفة|أجرة|موظف|راتب|مهنة'), 'travail-emploi'),
    (re.compile(r'إنترنت|هاتف|تلفزيون|صور|فيديو|تصوير|حاسوب'), 'technologie-moderne'),
    (re.compile(r'جهاد|دفاع|أمة|سلطان|حاكم'), 'jihad-defensif'),
]

def classify_domain(text: str) -> str:
    for pattern, domain in DOMAIN_MAP:
        if pattern.search(text):
            return domain
    return 'divers'

def sha256(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

# ── mdb-export helper ─────────────────────────────────────────
def read_mdb_table(mdb_path: Path, table: str) -> list[dict]:
    """Lit une table MDB via mdb-export, retourne une liste de dicts."""
    result = subprocess.run(
        ['mdb-export', str(mdb_path), table],
        capture_output=True, text=True, encoding='utf-8', errors='replace'
    )
    if result.returncode != 0:
        return []
    reader = csv.DictReader(io.StringIO(result.stdout))
    return list(reader)

# ── Créer les tables si nécessaires ──────────────────────────
CREATE_SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS app.fatwa_scholars (
    id SERIAL PRIMARY KEY,
    name_arabic TEXT NOT NULL,
    name_fr TEXT,
    name_en TEXT,
    madhab TEXT NOT NULL,
    era TEXT NOT NULL,
    death_year TEXT,
    is_deceased BOOLEAN DEFAULT FALSE,
    UNIQUE(name_arabic, madhab)
);

CREATE TABLE IF NOT EXISTS app.fatwa_books (
    id SERIAL PRIMARY KEY,
    title_arabic TEXT NOT NULL,
    title_fr TEXT,
    scholar_id INT REFERENCES app.fatwa_scholars(id),
    madhab TEXT NOT NULL,
    shamela_id TEXT UNIQUE,
    shamela_local_id INT,
    volume_count INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS app.fatwas (
    id SERIAL PRIMARY KEY,
    shamela_ref TEXT UNIQUE,
    book_id INT NOT NULL REFERENCES app.fatwa_books(id),
    scholar_id INT REFERENCES app.fatwa_scholars(id),
    volume INT,
    page_number INT,
    question_arabic TEXT,
    answer_arabic TEXT NOT NULL,
    question_fr TEXT,
    answer_fr TEXT,
    question_en TEXT,
    answer_en TEXT,
    is_auto_translated_fr BOOLEAN DEFAULT FALSE,
    is_auto_translated_en BOOLEAN DEFAULT FALSE,
    is_verified_fr BOOLEAN DEFAULT FALSE,
    is_verified_en BOOLEAN DEFAULT FALSE,
    madhab TEXT NOT NULL,
    domain TEXT NOT NULL DEFAULT 'divers',
    sub_domain TEXT,
    tags TEXT[] DEFAULT '{}',
    chapter_hint TEXT,
    period TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fatwas_madhab_idx ON app.fatwas(madhab);
CREATE INDEX IF NOT EXISTS fatwas_domain_idx ON app.fatwas(domain);
CREATE INDEX IF NOT EXISTS fatwas_madhab_domain_idx ON app.fatwas(madhab, domain);
"""

# ── Import principal ──────────────────────────────────────────
def import_book(conn, book: dict, hashes: dict, checkpoint: dict) -> int:
    print(f"\n📚 {book['title_ar']}")
    print(f"   Archive: {book['archive']}.mdb | bkid: {book['bkid']}")

    mdb_path = EXTRACTED_DIR / f"{book['archive']}.mdb"
    if not mdb_path.exists():
        print(f"   ❌ Archive {book['archive']}.mdb introuvable")
        return 0

    book_table  = f"b{book['bkid']}"
    title_table = f"t{book['bkid']}"

    # Vérifier que la table existe
    tables_result = subprocess.run(
        ['mdb-tables', str(mdb_path)], capture_output=True, text=True
    )
    available = tables_result.stdout.split()
    if book_table not in available:
        print(f"   ❌ Table {book_table} absente dans Archive {book['archive']}.mdb")
        return 0

    # Lire les titres de chapitres (pour classification)
    chapter_map: dict[int, str] = {}
    if title_table in available:
        title_rows = read_mdb_table(mdb_path, title_table)
        for row in title_rows:
            try:
                chapter_map[int(row['id'])] = row.get('tit', '')
            except (ValueError, KeyError):
                pass
    print(f"   Chapitres chargés: {len(chapter_map)}")

    # Lire le contenu
    rows = read_mdb_table(mdb_path, book_table)
    print(f"   Entrées totales: {len(rows)}")

    if not rows:
        return 0

    cur = conn.cursor()

    # Upsert savant
    cur.execute("""
        INSERT INTO app.fatwa_scholars (name_arabic, name_fr, madhab, era, is_deceased)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (name_arabic, madhab) DO UPDATE SET name_fr = EXCLUDED.name_fr
        RETURNING id
    """, (book['scholar_ar'], book['scholar_fr'], book['madhab'], book['era'], book['era'] == 'classique'))
    scholar_id = cur.fetchone()[0]

    # Upsert livre
    local_id_str = str(book['bkid'])
    cur.execute("""
        INSERT INTO app.fatwa_books (title_arabic, title_fr, scholar_id, madhab, shamela_id, shamela_local_id, volume_count)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (shamela_id) DO UPDATE SET title_arabic = EXCLUDED.title_arabic
        RETURNING id
    """, (book['title_ar'], book['title_fr'], scholar_id, book['madhab'],
          local_id_str, book['bkid'], book['vols']))
    book_id = cur.fetchone()[0]
    conn.commit()

    # Import des lignes
    imported = skipped = 0
    batch = []
    BATCH_SIZE = 500

    checkpoint_key = str(book['bkid'])
    start_id = checkpoint.get(checkpoint_key, 0)

    for row in rows:
        nass = row.get('nass', '').strip()
        if not nass or len(nass) < 20 or nass == 'صفحة فارغة':
            continue

        try:
            row_id   = int(row.get('id', 0))
            part_val = int(row.get('part', 0)) if row.get('part') else None
            page_val = int(row.get('page', 0)) if row.get('page') else None
        except ValueError:
            continue

        if row_id <= start_id:
            skipped += 1
            continue

        ref = f"sham-{book['bkid']}-{row_id}"
        h = sha256(nass)
        if hashes.get(ref) == h:
            skipped += 1
            continue

        # Domaine depuis le titre du chapitre le plus proche
        chapter = chapter_map.get(row_id, '')
        domain = classify_domain(chapter + ' ' + nass[:300])

        batch.append((
            ref, book_id, scholar_id, part_val, page_val,
            nass,  # ⚠️ answerArabic IMMUABLE
            book['madhab'], domain, chapter[:200] if chapter else None,
            ref, h
        ))

        if len(batch) >= BATCH_SIZE:
            psycopg2.extras.execute_values(cur, """
                INSERT INTO app.fatwas
                  (shamela_ref, book_id, scholar_id, volume, page_number,
                   answer_arabic, madhab, domain, chapter_hint, tags, is_auto_translated_fr)
                VALUES %s
                ON CONFLICT (shamela_ref) DO NOTHING
            """, [(b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8],'{}',False) for b in batch])
            conn.commit()
            for b in batch:
                hashes[b[9]] = b[10]
            imported += len(batch)
            batch.clear()
            checkpoint[checkpoint_key] = row_id
            # Sauvegarde checkpoint + hashes
            CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2))
            print(f"\r   → {imported:,} importées, {skipped:,} ignorées...", end='', flush=True)

    # Dernier batch
    if batch:
        psycopg2.extras.execute_values(cur, """
            INSERT INTO app.fatwas
              (shamela_ref, book_id, scholar_id, volume, page_number,
               answer_arabic, madhab, domain, chapter_hint, tags, is_auto_translated_fr)
            VALUES %s
            ON CONFLICT (shamela_ref) DO NOTHING
        """, [(b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7],b[8],'{}',False) for b in batch])
        conn.commit()
        for b in batch:
            hashes[b[9]] = b[10]
        imported += len(batch)

    # Sauvegardes finales
    HASHES_FILE.parent.mkdir(parents=True, exist_ok=True)
    HASHES_FILE.write_text(json.dumps(hashes, indent=2))
    checkpoint[checkpoint_key] = 999999999
    CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2))

    cur.close()
    print(f"\n   ✅ {imported:,} fatwas importées | {skipped:,} ignorées/déjà présentes")
    return imported

# ── Main ──────────────────────────────────────────────────────
def main():
    print("🌙 NoorApp — Import Fatwas Shamela (MDB → PostgreSQL)")
    print("⚠️  Texte arabe (nass/answer_arabic) IMMUABLE — jamais modifié\n")

    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    cur = conn.cursor()

    # Créer le schéma / tables si inexistantes
    print("📐 Création des tables si nécessaire...")
    cur.execute(CREATE_SCHEMA_SQL)
    conn.commit()
    cur.close()
    print("   ✅ Schéma prêt\n")

    # Charger checkpoint et hashes
    checkpoint: dict = json.loads(CHECKPOINT_FILE.read_text()) if CHECKPOINT_FILE.exists() else {}
    hashes: dict = json.loads(HASHES_FILE.read_text()) if HASHES_FILE.exists() else {}

    report = {}
    total = 0

    for book in TARGET_BOOKS:
        ck = str(book['bkid'])
        if checkpoint.get(ck) == 999999999:
            print(f"\n⏩ {book['title_ar']} — déjà importé (checkpoint)")
            continue
        try:
            count = import_book(conn, book, hashes, checkpoint)
            report[book['title_ar']] = count
            total += count
        except Exception as e:
            print(f"\n❌ Erreur sur {book['title_ar']}: {e}")
            conn.rollback()

    conn.close()

    print("\n\n" + "="*60)
    print("📊 RAPPORT FINAL — Import Fatwas Shamela")
    print("="*60)
    for title, count in report.items():
        print(f"  {title[:50]:50} : {count:>8,}")
    print(f"\n  {'TOTAL':50} : {total:>8,}")
    print("="*60)
    print("\n⚠️  Rappel : toutes les fatwas sont is_auto_translated_fr=FALSE")
    print("   La traduction FR sera faite via pipeline DeepL séparé")

if __name__ == '__main__':
    main()
