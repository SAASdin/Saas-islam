// extract-shamela.ts
// Extrait et importe les fatwas depuis les fichiers .bok Shamela (SQLite)
// ⚠️ ZONE QUASI-SACRÉE : answerArabic JAMAIS modifié

import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const prisma = new PrismaClient();

const BOK_DIR = process.env.BOK_DIR ?? '/tmp/shamela-extracted';
const HASHES_PATH = path.resolve(process.cwd(), '../../database/integrity/fatwa-hashes.json');

// ── Schéma .bok (SQLite) ─────────────────────────────────────
// Chaque .bok contient une table `book` ou `data` avec les colonnes :
// id INTEGER, nass TEXT (texte arabe), page INTEGER, part INTEGER (volume)
// Certains .bok ont aussi : `title` TEXT, `sinfo` TEXT (info chapitre)

interface BokRow {
  id: number;
  nass: string;       // ⚠️ Texte arabe IMMUABLE
  page: number | null;
  part: number | null;
  sinfo?: string;     // Info chapitre/sujet
  hno?: string;       // Numéro de hadith/fatwa si disponible
}

// ── Livres cibles ────────────────────────────────────────────
const TARGET_BOOKS = [
  { shamelaId: '12416', madhab: 'salafi',  era: 'contemporain', scholar: 'ابن باز',        scholarFr: 'Ibn Baz',         titleAr: 'مجموع فتاوى ابن باز',                 vols: 30 },
  { shamelaId: '12643', madhab: 'salafi',  era: 'contemporain', scholar: 'ابن عثيمين',     scholarFr: 'Ibn Uthaymin',    titleAr: 'مجموع فتاوى ابن عثيمين',              vols: 26 },
  { shamelaId: '7676',  madhab: 'salafi',  era: 'contemporain', scholar: 'اللجنة الدائمة', scholarFr: 'Lajnah Ad-Da\'ima', titleAr: 'فتاوى اللجنة الدائمة',               vols: 26 },
  { shamelaId: '97',    madhab: 'hanbali', era: 'classique',    scholar: 'ابن تيمية',       scholarFr: 'Ibn Taymiyyah',   titleAr: 'مجموع الفتاوى',                       vols: 37 },
  { shamelaId: '1118',  madhab: 'hanbali', era: 'classique',    scholar: 'ابن القيم',       scholarFr: 'Ibn al-Qayyim',   titleAr: 'إعلام الموقعين عن رب العالمين',       vols:  4 },
  { shamelaId: '20797', madhab: 'hanafi',  era: 'classique',    scholar: 'علماء هنود',      scholarFr: 'Savants Hindiyya', titleAr: 'الفتاوى الهندية',                    vols:  6 },
  { shamelaId: '6686',  madhab: 'shafii',  era: 'classique',    scholar: 'ابن حجر الهيثمي', scholarFr: 'Ibn Hajar al-Haytami', titleAr: 'الفتاوى الفقهية الكبرى',        vols:  4 },
  { shamelaId: '1681',  madhab: 'maliki',  era: 'classique',    scholar: 'الونشريسي',       scholarFr: 'Al-Wansharisi',   titleAr: 'المعيار المعرب',                      vols: 13 },
];

// ── Classificateur de domaine ────────────────────────────────
const DOMAIN_MAP: Array<[RegExp, string]> = [
  [/طهارة|وضوء|غسل|تيمم|نجاسة|حيض|جنابة/, 'purification-taharah'],
  [/صلاة|صلوات|جمعة|أذان|إمامة|قبلة|سجود|ركوع/, 'priere-salat'],
  [/زكاة|صدقة|نصاب|عشر/, 'zakat'],
  [/صيام|صوم|رمضان|إفطار|سحور|اعتكاف/, 'jeune-siyam'],
  [/حج|عمرة|إحرام|طواف|سعي|حرم|مكة|منى|عرفة/, 'hajj-umrah'],
  [/نكاح|زواج|خطبة|مهر|ولاية|زوجة|زوج/, 'mariage-nikah'],
  [/طلاق|خلع|فسخ|عدة|رجعة|إيلاء|ظهار|لعان/, 'divorce-talaq'],
  [/مواريث|ميراث|وصية|تركة|فرائض|إرث|وارث/, 'heritage-mawaris'],
  [/بيوع|بيع|شراء|إجارة|وكالة|شركة|رهن|مضاربة/, 'commerce-muamalat'],
  [/ربا|مصارف|بنوك|تأمين|أسهم|صكوك|مرابحة/, 'finance-islamique'],
  [/أطعمة|ذبائح|صيد|خمر|مسكر|حلال|حرام/, 'alimentation-atimah'],
  [/لباس|زينة|حجاب|ذهب|فضة|حرير|عطر/, 'habillement-libs'],
  [/أخلاق|معاملة|جيران|صلة|رحم|والدين|بر/, 'relations-sociales'],
  [/عقيدة|توحيد|إيمان|شرك|بدعة|ولاء|براء/, 'aqida-croyance'],
  [/قرآن|تلاوة|تجويد|حفظ|تفسير|مصحف/, 'coran-lecture'],
  [/أذكار|دعاء|رقية|تسبيح|استغفار/, 'invocations-adkar'],
  [/طب|علاج|دواء|جراحة|تبرع|أعضاء|مريض/, 'medical-sante'],
  [/عمل|وظيفة|أجرة|موظف|راتب|مهنة/, 'travail-emploi'],
  [/إنترنت|هاتف|تلفزيون|صور|فيديو|تصوير|حاسوب/, 'technologie-moderne'],
  [/جهاد|دفاع|أمة|سلطان|حاكم/, 'jihad-defensif'],
];

function classifyDomain(text: string): string {
  for (const [re, domain] of DOMAIN_MAP) {
    if (re.test(text)) return domain;
  }
  return 'divers';
}

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

// ── Détecter la structure du .bok ────────────────────────────
function detectBokSchema(db: Database.Database): { table: string; textCol: string; pageCol: string | null; partCol: string | null; sinfoCol: string | null } {
  // Lister les tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
  const tableNames = tables.map(t => t.name);
  console.log('    Tables:', tableNames.join(', '));

  // Trouver la table principale (book ou data ou b)
  const mainTable = tableNames.find(t => ['book', 'data', 'b', 'main'].includes(t.toLowerCase())) ?? tableNames[0];

  // Lister les colonnes
  const cols = db.prepare(`PRAGMA table_info(${mainTable})`).all() as { name: string }[];
  const colNames = cols.map(c => c.name.toLowerCase());
  console.log('    Colonnes:', colNames.join(', '));

  // Détecter colonnes
  const textCol = colNames.find(c => ['nass', 'text', 'content', 'body', 'matn'].includes(c)) ?? 'nass';
  const pageCol = colNames.find(c => c === 'page' || c === 'pg') ?? null;
  const partCol = colNames.find(c => ['part', 'vol', 'volume', 'juz'].includes(c)) ?? null;
  const sinfoCol = colNames.find(c => ['sinfo', 'title', 'heading', 'chapter', 'subject', 'sub'].includes(c)) ?? null;

  return { table: mainTable, textCol, pageCol, partCol, sinfoCol };
}

// ── Parser un fichier .bok ────────────────────────────────────
async function parseBokFile(bokPath: string, bookConfig: typeof TARGET_BOOKS[0]): Promise<number> {
  console.log(`\n📚 Parsing: ${bookConfig.titleAr}`);
  console.log(`   Fichier: ${bokPath}`);

  if (!fs.existsSync(bokPath)) {
    console.log('   ❌ Fichier non trouvé');
    return 0;
  }

  const db = new Database(bokPath, { readonly: true });
  const schema = detectBokSchema(db);

  // Compter les entrées
  const count = (db.prepare(`SELECT COUNT(*) as cnt FROM ${schema.table}`).get() as { cnt: number }).cnt;
  console.log(`   Entrées totales: ${count}`);

  // Upsert savant
  const scholar = await prisma.fatwaScholar.upsert({
    where: { nameArabic_madhab: { nameArabic: bookConfig.scholar, madhab: bookConfig.madhab } },
    create: {
      nameArabic: bookConfig.scholar,
      nameFr: bookConfig.scholarFr,
      madhab: bookConfig.madhab,
      era: bookConfig.era,
      isDeceased: bookConfig.era === 'classique',
    },
    update: {},
  }).catch(async () => {
    const existing = await prisma.fatwaScholar.findFirst({ where: { nameArabic: bookConfig.scholar } });
    if (existing) return existing;
    return prisma.fatwaScholar.create({
      data: { nameArabic: bookConfig.scholar, nameFr: bookConfig.scholarFr, madhab: bookConfig.madhab, era: bookConfig.era, isDeceased: bookConfig.era === 'classique' }
    });
  });

  // Upsert livre
  const book = await prisma.fatwaBook.upsert({
    where: { shamelaId: bookConfig.shamelaId },
    create: {
      titleArabic: bookConfig.titleAr,
      scholarId: scholar.id,
      madhab: bookConfig.madhab,
      shamelaId: bookConfig.shamelaId,
      volumeCount: bookConfig.vols,
    },
    update: {},
  });

  // Charger les hashes existants
  let hashes: Record<string, string> = {};
  if (fs.existsSync(HASHES_PATH)) {
    hashes = JSON.parse(fs.readFileSync(HASHES_PATH, 'utf8'));
  }

  // Lire par batch de 500
  const BATCH = 500;
  let imported = 0;
  let skipped = 0;
  let offset = 0;

  const selectQuery = `
    SELECT id,
           ${schema.textCol} as nass,
           ${schema.pageCol ? schema.pageCol + ' as page' : 'NULL as page'},
           ${schema.partCol ? schema.partCol + ' as part' : 'NULL as part'},
           ${schema.sinfoCol ? schema.sinfoCol + ' as sinfo' : 'NULL as sinfo'}
    FROM ${schema.table}
    WHERE ${schema.textCol} IS NOT NULL AND length(${schema.textCol}) > 30
    LIMIT ? OFFSET ?
  `;

  while (true) {
    const rows = db.prepare(selectQuery).all(BATCH, offset) as BokRow[];
    if (rows.length === 0) break;

    const toInsert = [];
    for (const row of rows) {
      const text = row.nass?.trim();
      if (!text || text.length < 30) continue;

      const ref = `shamela-${bookConfig.shamelaId}-${row.id}`;
      const hash = sha256(text);

      if (hashes[ref] === hash) {
        skipped++;
        continue;
      }

      const domain = classifyDomain((row.sinfo ?? '') + ' ' + text.substring(0, 200));

      toInsert.push({
        shamelaRef: ref,
        bookId: book.id,
        scholarId: scholar.id,
        volume: row.part ?? undefined,
        pageNumber: row.page ?? undefined,
        answerArabic: text, // ⚠️ IMMUABLE
        chapterHint: row.sinfo?.trim() ?? undefined,
        madhab: bookConfig.madhab,
        domain,
        hash,
        ref,
      });
    }

    // Insert batch en DB
    for (const item of toInsert) {
      try {
        await prisma.fatwa.upsert({
          where: { shamelaRef: item.ref },
          create: {
            shamelaRef: item.shamelaRef,
            bookId: item.bookId,
            scholarId: item.scholarId,
            volume: item.volume,
            pageNumber: item.pageNumber,
            answerArabic: item.answerArabic,
            madhab: item.madhab,
            domain: item.domain,
            tags: [],
            isAutoTranslatedFr: false,
          },
          update: {},
        });
        hashes[item.ref] = item.hash;
        imported++;
      } catch (_e) {
        // Ignorer les doublons
      }
    }

    // Sauvegarder les hashes périodiquement
    if (imported % 1000 === 0 && imported > 0) {
      fs.mkdirSync(path.dirname(HASHES_PATH), { recursive: true });
      fs.writeFileSync(HASHES_PATH, JSON.stringify(hashes, null, 2));
      process.stdout.write(`\r   → ${imported} importées, ${skipped} ignorées...`);
    }

    offset += BATCH;
  }

  // Sauvegarde finale des hashes
  fs.mkdirSync(path.dirname(HASHES_PATH), { recursive: true });
  fs.writeFileSync(HASHES_PATH, JSON.stringify(hashes, null, 2));

  db.close();
  console.log(`\n   ✅ ${imported} fatwas importées | ${skipped} déjà présentes`);
  return imported;
}

// ── Point d'entrée ────────────────────────────────────────────
async function main() {
  console.log('🌙 NoorApp — Import Fatwas depuis fichiers .bok Shamela');
  console.log(`📁 Répertoire .bok: ${BOK_DIR}\n`);

  const report: Record<string, number> = {};
  let total = 0;

  for (const bookConfig of TARGET_BOOKS) {
    // Essayer différents noms de fichiers possibles
    const candidates = [
      path.join(BOK_DIR, `${bookConfig.shamelaId}.bok`),
      path.join(BOK_DIR, `books/${bookConfig.shamelaId}.bok`),
      path.join(BOK_DIR, `Books/${bookConfig.shamelaId}.bok`),
      path.join(BOK_DIR, `الكتب/${bookConfig.shamelaId}.bok`),
    ];

    const bokPath = candidates.find(p => fs.existsSync(p));
    if (!bokPath) {
      console.log(`\n⚠️  ${bookConfig.titleAr}: fichier .bok non trouvé`);
      console.log('   Chemins essayés:', candidates.join(', '));
      continue;
    }

    try {
      const count = await parseBokFile(bokPath, bookConfig);
      report[bookConfig.titleAr] = count;
      total += count;
    } catch (err) {
      console.error(`❌ Erreur sur ${bookConfig.titleAr}:`, err);
    }
  }

  console.log('\n\n📊 RAPPORT FINAL:');
  for (const [title, count] of Object.entries(report)) {
    console.log(`  ${title}: ${count.toLocaleString()} fatwas`);
  }
  console.log(`\n  TOTAL: ${total.toLocaleString()} fatwas importées`);
  await prisma.$disconnect();
}

main().catch(async err => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
