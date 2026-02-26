#!/usr/bin/env python3
"""
import_hanbali_classic.py
Import des références Hanbali classiques établies (Buhuti + Ibn Qudama)
Distinctes d'Ibn Taymiyyah (ijtihad) — références du madhab établi

البهوتي : كشاف القناع + شرح منتهى الإرادات + الروض المربع
ابن قدامة : المغني + الكافي في فقه الإمام أحمد

⚠️ answerArabic IMMUABLE
"""
import sys
sys.path.insert(0, '/Users/islampc/.openclaw/workspace/saas-islam/services/fatwa-scraper')
from import_shamela import *

HANBALI_CLASSIC_BOOKS = [
    # ── البهوتي — منصور بن يونس البهوتي (ت 1051هـ) ──────────
    # الكتاب المرجعي الأول للمذهب الحنبلي المتأخر
    {
        "bkid": 21642, "archive": 9, "madhab": "hanbali", "era": "classique",
        "scholar_ar": "منصور بن يونس البهوتي",
        "scholar_fr": "Mansur ibn Yunus al-Buhuti (m. 1051 AH)",
        "title_ar": "كشاف القناع عن متن الإقناع",
        "title_fr": "Kashaf al-Qina' - Al-Buhuti (référence principale madhab Hanbali)",
        "vols": 6,
    },
    {
        "bkid": 21693, "archive": 9, "madhab": "hanbali", "era": "classique",
        "scholar_ar": "منصور بن يونس البهوتي",
        "scholar_fr": "Mansur ibn Yunus al-Buhuti (m. 1051 AH)",
        "title_ar": "شرح منتهى الإرادات (دقائق أولي النهى لشرح المنتهى)",
        "title_fr": "Sharh Muntaha al-Iradat - Al-Buhuti",
        "vols": 3,
    },
    {
        "bkid": 1679, "archive": 9, "madhab": "hanbali", "era": "classique",
        "scholar_ar": "منصور بن يونس البهوتي",
        "scholar_fr": "Mansur ibn Yunus al-Buhuti (m. 1051 AH)",
        "title_ar": "الروض المربع شرح زاد المستقنع",
        "title_fr": "Al-Rawd al-Murbi' - Al-Buhuti (très étudié dans les madrasas)",
        "vols": 1,
    },

    # ── ابن قدامة — موفق الدين ابن قدامة المقدسي (ت 620هـ) ────
    # أكبر موسوعة فقهية حنبلية
    {
        "bkid": 8463, "archive": 8, "madhab": "hanbali", "era": "classique",
        "scholar_ar": "عبد الله بن أحمد بن قدامة المقدسي",
        "scholar_fr": "Muwaffaq al-Din Ibn Qudama al-Maqdisi (m. 620 AH)",
        "title_ar": "المغني لابن قدامة",
        "title_fr": "Al-Mughni - Ibn Qudama (encyclopédie Hanbali, 15 vol.)",
        "vols": 15,
    },
    {
        "bkid": 21731, "archive": 8, "madhab": "hanbali", "era": "classique",
        "scholar_ar": "عبد الله بن أحمد بن قدامة المقدسي",
        "scholar_fr": "Muwaffaq al-Din Ibn Qudama al-Maqdisi (m. 620 AH)",
        "title_ar": "الكافي في فقه الإمام أحمد",
        "title_fr": "Al-Kafi fi Fiqh al-Imam Ahmad - Ibn Qudama",
        "vols": 4,
    },
]

def main():
    print("🌙 NoorApp — Import Références Hanbali Classiques")
    print("   البهوتي (كشاف القناع + شرح المنتهى + الروض المربع)")
    print("   ابن قدامة (المغني + الكافي)")
    print("⚠️  answerArabic IMMUABLE\n")

    conn = psycopg2.connect(DB_URL)
    checkpoint = json.loads(CHECKPOINT_FILE.read_text()) if CHECKPOINT_FILE.exists() else {}
    hashes = json.loads(HASHES_FILE.read_text()) if HASHES_FILE.exists() else {}

    report = {}
    total = 0

    for book in HANBALI_CLASSIC_BOOKS:
        ck = str(book['bkid'])
        if checkpoint.get(ck) == 999999999:
            print(f"⏩ {book['title_ar']} — déjà importé")
            continue
        try:
            count = import_book(conn, book, hashes, checkpoint)
            report[book['title_ar']] = count
            total += count
        except Exception as e:
            print(f"❌ Erreur sur {book['title_ar']}: {e}")
            import traceback; traceback.print_exc()
            conn.rollback()

    conn.close()

    print("\n" + "="*65)
    print("📊 RAPPORT — Références Hanbali Classiques")
    print("="*65)
    for t, c in report.items():
        print(f"  {t[:55]:55} : {c:>6,}")
    print(f"\n  TOTAL ajouté       : {total:>6,}")

    # Total DB
    import subprocess
    result = subprocess.run(
        ['/opt/homebrew/Cellar/postgresql@16/16.12/bin/psql',
         '-U', 'islampc', '-d', 'saas_islam', '-t', '-c',
         "SELECT madhab, COUNT(*) FROM app.fatwas GROUP BY madhab ORDER BY COUNT(*) DESC"],
        capture_output=True, text=True
    )
    print("\n📊 Total DB par madhab :")
    print(result.stdout)

if __name__ == '__main__':
    main()
