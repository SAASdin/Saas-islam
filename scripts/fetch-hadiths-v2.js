#!/usr/bin/env node
/**
 * fetch-hadiths-v2.js
 * Source : fawazahmed0/hadith-api (GitHub CDN - open source, sans limite)
 * Arabic + English + French pour toutes les collections disponibles
 * 
 * Usage: node scripts/fetch-hadiths-v2.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_DIR  = path.join(__dirname, 'hadith-data');
const SEEDS_DIR = path.join(__dirname, '..', 'database', 'seeds');
[DATA_DIR, SEEDS_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── MAPPING collections sunnah.com ↔ fawazahmed0 ────────
const COLLECTIONS = [
  {
    key: 'bukhari',
    name_ar: 'صحيح البخاري', name_en: 'Sahih al-Bukhari', name_fr: 'Sahih Al-Bukhari',
    author: 'Al-Bukhari', death_hijri: 256,
    editions: { ar: 'ara-bukhari', en: 'eng-bukhari', fr: 'fra-bukhari' },
  },
  {
    key: 'muslim',
    name_ar: 'صحيح مسلم', name_en: 'Sahih Muslim', name_fr: 'Sahih Muslim',
    author: 'Muslim ibn al-Hajjaj', death_hijri: 261,
    editions: { ar: 'ara-muslim', en: 'eng-muslim', fr: 'fra-muslim' },
  },
  {
    key: 'nasai',
    name_ar: 'سنن النسائي', name_en: "Sunan an-Nasa'i", name_fr: "Sunan an-Nasa'i",
    author: "An-Nasa'i", death_hijri: 303,
    editions: { ar: 'ara-nasai', en: 'eng-nasai', fr: 'fra-nasai' },
  },
  {
    key: 'abudawud',
    name_ar: 'سنن أبي داود', name_en: 'Sunan Abi Dawud', name_fr: 'Sunan Abi Dawud',
    author: 'Abu Dawud', death_hijri: 275,
    editions: { ar: 'ara-abudawud', en: 'eng-abudawud', fr: 'fra-abudawud' },
  },
  {
    key: 'tirmidhi',
    name_ar: 'جامع الترمذي', name_en: "Jami' at-Tirmidhi", name_fr: "Jami' at-Tirmidhi",
    author: 'At-Tirmidhi', death_hijri: 279,
    editions: { ar: 'ara-tirmidhi', en: 'eng-tirmidhi', fr: null },  // fra trop grand
  },
  {
    key: 'ibnmajah',
    name_ar: 'سنن ابن ماجه', name_en: 'Sunan Ibn Majah', name_fr: 'Sunan Ibn Majah',
    author: 'Ibn Majah', death_hijri: 273,
    editions: { ar: 'ara-ibnmajah', en: 'eng-ibnmajah', fr: 'fra-ibnmajah' },
  },
  {
    key: 'malik',
    name_ar: 'موطأ مالك', name_en: 'Muwatta Malik', name_fr: 'Muwatta Malik',
    author: 'Malik ibn Anas', death_hijri: 179,
    editions: { ar: 'ara-malik', en: 'eng-malik', fr: 'fra-malik' },
  },
  {
    key: 'nawawi40',
    name_ar: 'الأربعون النووية', name_en: "An-Nawawi's Forty Hadith", name_fr: '40 Hadiths de Nawawi',
    author: 'An-Nawawi', death_hijri: 676,
    editions: { ar: 'ara-nawawi', en: 'eng-nawawi', fr: 'fra-nawawi' },
  },
  {
    key: 'qudsi40',
    name_ar: 'الحديث القدسي', name_en: 'Forty Hadith Qudsi', name_fr: '40 Hadiths Qudsi',
    author: 'Divers', death_hijri: null,
    editions: { ar: 'ara-qudsi', en: 'eng-qudsi', fr: 'fra-qudsi' },
  },
];

const CDN_BASE = 'cdn.jsdelivr.net';
const GH_RAW   = 'raw.githubusercontent.com';

// ─── HELPERS ──────────────────────────────────────────────

function fetchRaw(hostname, urlPath, retries = 0) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path: urlPath, method: 'GET' }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode === 200) resolve(body);
        else if (res.statusCode === 301 || res.statusCode === 302) {
          // Redirect
          const loc = res.headers.location;
          if (loc && retries < 3) {
            const u = new URL(loc);
            fetchRaw(u.hostname, u.pathname + u.search, retries + 1).then(resolve).catch(reject);
          } else reject(new Error(`Redirect loop or limit: ${loc}`));
        } else if ((res.statusCode === 429 || res.statusCode >= 500) && retries < 4) {
          setTimeout(() => fetchRaw(hostname, urlPath, retries + 1).then(resolve).catch(reject), 3000 * (retries + 1));
        } else {
          reject(new Error(`HTTP ${res.statusCode} ${hostname}${urlPath}`));
        }
      });
    });
    req.on('error', err => {
      if (retries < 3) setTimeout(() => fetchRaw(hostname, urlPath, retries + 1).then(resolve).catch(reject), 2000);
      else reject(err);
    });
    req.end();
  });
}

async function fetchEdition(editionName) {
  const cacheFile = path.join(DATA_DIR, `${editionName}.json`);
  if (fs.existsSync(cacheFile)) {
    process.stdout.write(` (cache)`);
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  // Essai jsDelivr d'abord, puis GitHub Raw si trop grand
  let data;
  try {
    const buf = await fetchRaw(CDN_BASE, `/gh/fawazahmed0/hadith-api@1/editions/${editionName}.min.json`);
    const text = buf.toString('utf8');
    if (text.includes('Package size exceeded')) throw new Error('too-large');
    data = JSON.parse(text);
  } catch (e) {
    if (e.message === 'too-large' || e.message.includes('too-large')) {
      process.stdout.write(' (CDN too-large, GH raw...)');
      const buf = await fetchRaw(GH_RAW, `/fawazahmed0/hadith-api/1/editions/${editionName}.min.json`);
      data = JSON.parse(buf.toString('utf8'));
    } else throw e;
  }

  fs.writeFileSync(cacheFile, JSON.stringify(data));
  return data;
}

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  return `'${String(v).replace(/'/g, "''")}'`;
}

// ─── MAIN ─────────────────────────────────────────────────

async function main() {
  console.log('\n🌙 NoorBot — Fetch hadith-api (fawazahmed0)\n');
  console.log('══════════════════════════════════════════');

  // 1. SQL collections
  let collectionsSql = `-- hadiths_01_collections.sql\nINSERT INTO sacred.hadith_collections (name_arabic, name_french, name_english, author, death_year_hijri, total_hadiths, collection_key) VALUES\n`;
  const colRows = COLLECTIONS.map(c => `  (${esc(c.name_ar)}, ${esc(c.name_fr)}, ${esc(c.name_en)}, ${esc(c.author)}, ${esc(c.death_hijri)}, 0, ${esc(c.key)})`);
  collectionsSql += colRows.join(',\n') + '\nON CONFLICT (collection_key) DO UPDATE SET name_arabic=EXCLUDED.name_arabic, name_french=EXCLUDED.name_french, name_english=EXCLUDED.name_english;\n';
  fs.writeFileSync(path.join(SEEDS_DIR, 'hadiths_01_collections.sql'), collectionsSql);
  console.log('✅ hadiths_01_collections.sql');

  let totalAll = 0;

  // 2. Chaque collection
  for (let i = 0; i < COLLECTIONS.length; i++) {
    const col = COLLECTIONS[i];
    console.log(`\n[${i+1}/${COLLECTIONS.length}] 📚 ${col.name_fr} (${col.key})`);

    // Télécharger les 3 éditions
    let dataAr, dataEn, dataFr = null;

    process.stdout.write('  ↓ Arabic...');
    try { dataAr = await fetchEdition(col.editions.ar); console.log(` ${dataAr.hadiths.length} hadiths`); }
    catch(e) { console.log(` ❌ ${e.message}`); continue; }

    process.stdout.write('  ↓ English...');
    try { dataEn = await fetchEdition(col.editions.en); console.log(` ${dataEn.hadiths.length}`); }
    catch(e) { console.log(` ❌ ${e.message}`); continue; }

    if (col.editions.fr) {
      process.stdout.write('  ↓ French...');
      try { dataFr = await fetchEdition(col.editions.fr); console.log(` ${dataFr.hadiths.length}`); }
      catch(e) { console.log(` ⚠️ ${e.message} (sans FR)`); }
    }

    // Books depuis sections metadata
    const sectionsAr   = dataAr.metadata?.sections || {};
    const sectionsEn   = dataEn.metadata?.sections || {};
    const sectDetails  = dataEn.metadata?.section_details || {};

    // Map hadith number → texts
    const arMap = Object.fromEntries(dataAr.hadiths.map(h => [h.hadithnumber, h.text]));
    const enMap = Object.fromEntries(dataEn.hadiths.map(h => [h.hadithnumber, h.text]));
    const frMap = dataFr ? Object.fromEntries(dataFr.hadiths.map(h => [h.hadithnumber, h.text])) : {};
    const gradeMap = Object.fromEntries(dataEn.hadiths.map(h => [h.hadithnumber, h.grades || []]));
    const refMap   = Object.fromEntries(dataEn.hadiths.map(h => [h.hadithnumber, h.reference || {}]));

    // SQL
    const lines = [];
    lines.push(`-- ============================================================`);
    lines.push(`-- hadiths_02_${col.key}.sql — ${col.name_fr}`);
    lines.push(`-- Source: fawazahmed0/hadith-api — ZONE SACRÉE — IMMUABLE`);
    lines.push(`-- ============================================================`);
    lines.push(`DO $$ DECLARE col_id INT; BEGIN`);
    lines.push(`  SELECT id INTO col_id FROM sacred.hadith_collections WHERE collection_key = ${esc(col.key)};`);
    lines.push(`  IF col_id IS NULL THEN RAISE EXCEPTION 'Collection ${col.key} introuvable'; END IF;`);
    lines.push('');

    // Books
    const bookNums = Object.keys(sectionsEn).filter(k => k !== '0' && sectionsEn[k]);
    if (bookNums.length > 0) {
      lines.push(`  -- LIVRES`);
      lines.push(`  INSERT INTO sacred.hadith_books (collection_id, book_number, name_arabic, name_english)`);
      lines.push(`  VALUES`);
      const bRows = bookNums.map(bn =>
        `    (col_id, ${esc(bn)}, ${esc(sectionsAr[bn] || null)}, ${esc(sectionsEn[bn] || null)})`
      );
      lines.push(bRows.join(',\n'));
      lines.push(`  ON CONFLICT (collection_id, book_number) DO NOTHING;`);
      lines.push('');

      // Update total_hadiths par collection
      lines.push(`  UPDATE sacred.hadith_collections SET total_hadiths = ${dataAr.hadiths.length} WHERE id = col_id;`);
      lines.push('');
    }

    // Hadiths par batch de 200
    const hadithNums = dataAr.hadiths.map(h => h.hadithnumber);
    console.log(`  📝 Génération SQL: ${hadithNums.length} hadiths...`);
    
    const BATCH = 200;
    for (let b = 0; b < hadithNums.length; b += BATCH) {
      const batch = hadithNums.slice(b, b + BATCH);
      lines.push(`  -- Batch ${Math.floor(b/BATCH)+1}/${Math.ceil(hadithNums.length/BATCH)}`);
      lines.push(`  INSERT INTO sacred.hadiths`);
      lines.push(`    (collection_id, hadith_number, book_number, book_id,`);
      lines.push(`     text_arabic, text_english, text_french,`);
      lines.push(`     grade, grade_source, reference)`);
      lines.push(`  SELECT col_id, v.hn, v.bn, hb.id, v.ar, v.en, v.fr, v.grade, v.grade_src, v.ref`);
      lines.push(`  FROM (VALUES`);

      const hRows = batch.map(hn => {
        const ref   = refMap[hn] || {};
        const grades = gradeMap[hn] || [];
        const g     = grades[0] || {};
        const bn    = ref.book ? String(ref.book) : null;
        const refStr = `${col.name_en} ${hn}`;
        return `    (${esc(String(hn))}, ${esc(bn)}, ${esc(arMap[hn]||null)}, ${esc(enMap[hn]||null)}, ${esc(frMap[hn]||null)}, ${esc(g.grade||null)}, ${esc(g.gradedBy||null)}, ${esc(refStr)})`;
      });
      lines.push(hRows.join(',\n'));
      lines.push(`  ) AS v(hn, bn, ar, en, fr, grade, grade_src, ref)`);
      lines.push(`  LEFT JOIN sacred.hadith_books hb ON hb.collection_id = col_id AND hb.book_number = v.bn`);
      lines.push(`  ON CONFLICT (collection_id, hadith_number) DO NOTHING;`);
      lines.push('');

      if ((b + BATCH) % 2000 === 0) {
        process.stdout.write(`\r  → ${Math.min(b+BATCH, hadithNums.length)}/${hadithNums.length}    `);
      }
    }
    process.stdout.write('\n');

    lines.push(`END $$;`);

    const sqlPath = path.join(SEEDS_DIR, `hadiths_02_${col.key}.sql`);
    fs.writeFileSync(sqlPath, lines.join('\n'));
    console.log(`  ✅ ${path.basename(sqlPath)} (${hadithNums.length} hadiths)`);
    totalAll += hadithNums.length;
  }

  // 3. Script d'import global
  const runAll = generateRunAll();
  fs.writeFileSync(path.join(SEEDS_DIR, 'hadiths_00_run_all.sh'), runAll);
  fs.chmodSync(path.join(SEEDS_DIR, 'hadiths_00_run_all.sh'), '755');

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ DONE — ${totalAll} hadiths générés en SQL`);
  console.log(`\nImport: bash database/seeds/hadiths_00_run_all.sh`);
}

function generateRunAll() {
  const lines = [
    '#!/bin/bash',
    '# hadiths_00_run_all.sh — Import toutes les collections',
    'set -e',
    'DB="${DATABASE_URL:-postgresql://islampc@localhost:5432/saas_islam}"',
    'SEEDS="$(dirname "$0")"',
    '',
    'echo "🌙 Import hadiths..."',
    '',
    '# Migration',
    'psql "$DB" -f "$(dirname "$SEEDS")/migrations/006_hadith_books_chapters.sql" -v ON_ERROR_STOP=0',
    '',
    '# Collections',
    'psql "$DB" -f "$SEEDS/hadiths_01_collections.sql"',
    '',
  ];
  for (const col of COLLECTIONS) {
    lines.push(`echo "📚 ${col.name_fr}..."`);
    lines.push(`psql "$DB" -f "$SEEDS/hadiths_02_${col.key}.sql" 2>&1 | grep -E "INSERT|UPDATE|ERROR|EXCEPTION" | head -5`);
    lines.push('');
  }
  lines.push('echo ""');
  lines.push('echo "✅ Terminé !"');
  lines.push(`psql "$DB" -c "SELECT hc.collection_key, hc.name_french, COUNT(h.id) as hadiths_loaded FROM sacred.hadith_collections hc LEFT JOIN sacred.hadiths h ON h.collection_id = hc.id GROUP BY hc.id ORDER BY hadiths_loaded DESC;"`);
  return lines.join('\n') + '\n';
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
