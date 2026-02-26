#!/usr/bin/env python3
"""Round 2 : import des livres manquants (Maliki + Ibn Taymiyyah complet + Ibn Abidin)"""
import sys
sys.path.insert(0, '/Users/islampc/.openclaw/workspace/saas-islam/services/fatwa-scraper')

# Réutiliser le même code mais avec EXTRA_BOOKS
from import_shamela import *

ROUND2_BOOKS = [
    {"bkid": 7289,  "archive": 7, "madhab": "hanbali", "era": "classique",
     "scholar_ar": "أحمد بن عبد الحليم ابن تيمية", "scholar_fr": "Ibn Taymiyyah",
     "title_ar": "مجموع الفتاوى", "title_fr": "Majmu' al-Fatawa (37 vol)", "vols": 37},

    {"bkid": 10284, "archive": 6, "madhab": "hanbali", "era": "classique",
     "scholar_ar": "أحمد بن عبد الحليم ابن تيمية", "scholar_fr": "Ibn Taymiyyah",
     "title_ar": "المستدرك على مجموع الفتاوى", "title_fr": "Al-Mustadrak ala Majmu' Fatawa", "vols": 3},

    {"bkid": 21613, "archive": 5, "madhab": "hanafi",  "era": "classique",
     "scholar_ar": "محمد أمين بن عمر ابن عابدين", "scholar_fr": "Ibn Abidin",
     "title_ar": "الدر المختار وحاشية ابن عابدين (رد المحتار)", "title_fr": "Radd al-Muhtar - Ibn Abidin", "vols": 6},

    {"bkid": 587,   "archive": 5, "madhab": "maliki",  "era": "classique",
     "scholar_ar": "سحنون بن سعيد التنوخي", "scholar_fr": "Sahnun (Al-Mudawwana)",
     "title_ar": "المدونة", "title_fr": "Al-Mudawwana (Imam Malik / Sahnun)", "vols": 4},

    {"bkid": 91,    "archive": 7, "madhab": "maliki",  "era": "classique",
     "scholar_ar": "محمد بن عبد الله الخرشي", "scholar_fr": "Al-Khurshi",
     "title_ar": "شرح مختصر خليل للخرشي", "title_fr": "Sharh Mukhtasar Khalil - Al-Khurshi", "vols": 8},

    {"bkid": 21604, "archive": 7, "madhab": "maliki",  "era": "classique",
     "scholar_ar": "أحمد بن محمد الدردير", "scholar_fr": "Al-Dardiri + Al-Dasuqi",
     "title_ar": "الشرح الكبير للدردير وحاشية الدسوقي", "title_fr": "Al-Sharh al-Kabir + Hashiya al-Dasuqi", "vols": 4},

    {"bkid": 569,   "archive": 7, "madhab": "maliki",  "era": "classique",
     "scholar_ar": "محمد بن محمد الحطاب", "scholar_fr": "Al-Hattab",
     "title_ar": "مواهب الجليل في شرح مختصر خليل", "title_fr": "Mawahib al-Jalil", "vols": 6},

    {"bkid": 21611, "archive": 7, "madhab": "maliki",  "era": "classique",
     "scholar_ar": "محمد بن يوسف العبدري المواق", "scholar_fr": "Al-Mawwaq",
     "title_ar": "التاج والإكليل لمختصر خليل", "title_fr": "Al-Taj wa al-Iklil", "vols": 8},
]

def main():
    print("🌙 NoorApp — Import Fatwas Round 2 (Maliki + Ibn Taymiyyah complet + Ibn Abidin)")
    print("⚠️  answerArabic IMMUABLE\n")

    conn = psycopg2.connect(DB_URL)
    checkpoint = json.loads(CHECKPOINT_FILE.read_text()) if CHECKPOINT_FILE.exists() else {}
    hashes = json.loads(HASHES_FILE.read_text()) if HASHES_FILE.exists() else {}

    report = {}
    total = 0

    for book in ROUND2_BOOKS:
        ck = str(book['bkid'])
        if checkpoint.get(ck) == 999999999:
            print(f"⏩ {book['title_ar']} — déjà importé")
            continue
        try:
            count = import_book(conn, book, hashes, checkpoint)
            report[book['title_ar']] = count
            total += count
        except Exception as e:
            print(f"❌ Erreur: {e}")
            conn.rollback()

    conn.close()

    print("\n" + "="*60)
    print("📊 RAPPORT ROUND 2")
    print("="*60)
    for t, c in report.items():
        print(f"  {t[:50]:50} : {c:>8,}")
    print(f"\n  TOTAL round 2 : {total:>8,}")

if __name__ == '__main__':
    main()
