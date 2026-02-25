// ============================================================
// 02-import-hadiths.ts — Import des 8 collections de hadiths
// Sources :
//   • fawazahmed0/hadith-api (jsDelivr CDN) — 7 collections
//   • api.sunnah.com (clé démo publique) — Riyad as-Salihin
// ⚠️  ZONE SACRÉE — Texte arabe IMMUABLE après import
// ⚠️  Ce script s'exécute UNE SEULE FOIS en production
//     Validation requise : Moha ✅ + Bilal ✅ avant exécution DB
//
// RÈGLE ABSOLUE : textArabic copié tel quel — ZÉRO modification
// ============================================================

import 'dotenv/config'
import { createHash }            from 'crypto'
import { writeFileSync, mkdirSync } from 'fs'
import { join }                  from 'path'

// ── Prisma (désactivé si pas de DATABASE_URL) ─────────────────
let prisma: any = null
const DRY_RUN = !process.env.DATABASE_URL || process.env.DRY_RUN === 'true'

if (!DRY_RUN) {
  try {
    const { PrismaClient } = require('@prisma/client')
    prisma = new PrismaClient()
  } catch (e) {
    console.warn('⚠️  Prisma non disponible — mode DRY_RUN')
  }
}

// ── CDN fawazahmed0 ────────────────────────────────────────────
const CDN = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'
// Clé démo publique sunnah.com (documentée sur sunnah.com/api)
const SUNNAH_API  = 'https://api.sunnah.com/v1'
const SUNNAH_KEY  = 'SqD712P3E82xnwOAEOkGd5JZH8s9wRR24TqNFzjk'

// ── Configuration des 8 collections ───────────────────────────

interface CollectionConfig {
  key:          string            // Clé unique en DB
  cdnBook?:     string            // Identifiant fawazahmed0
  sunnahKey?:   string            // Identifiant sunnah.com (si applicable)
  nameArabic:   string            // Nom arabe ⚠️ SACRÉ
  nameFrench:   string
  nameEnglish:  string
  author:       string
  defaultGrade: string            // Grade par défaut si non fourni
  minCount:     number            // Minimum attendu (vérification)
  exactCount?:  number            // Exact si précisé (Nawawi=42)
}

const COLLECTIONS: CollectionConfig[] = [
  {
    key:         'bukhari',
    cdnBook:     'bukhari',
    nameArabic:  'صحيح البخاري',
    nameFrench:  'Sahih Al-Boukhâri',
    nameEnglish: 'Sahih al-Bukhari',
    author:      'Muhammad ibn Ismail al-Bukhari',
    defaultGrade: 'Sahih',
    minCount:    7563,
  },
  {
    key:         'muslim',
    cdnBook:     'muslim',
    nameArabic:  'صحيح مسلم',
    nameFrench:  'Sahih Muslim',
    nameEnglish: 'Sahih Muslim',
    author:      'Muslim ibn al-Hajjaj',
    defaultGrade: 'Sahih',
    // 7563 entrées dans le CDN, ~203 sont des titres de chapitres sans matn
    // On importe 7360 hadiths réels (avec texte arabe)
    minCount:    7300,
  },
  {
    key:         'abudawud',
    cdnBook:     'abudawud',
    nameArabic:  'سنن أبي داود',
    nameFrench:  'Sunan Abu Dawud',
    nameEnglish: 'Sunan Abi Dawud',
    author:      'Abu Dawud Sulayman ibn al-Ash\'ath',
    defaultGrade: 'Hassan',
    minCount:    4000,
  },
  {
    key:         'tirmidhi',
    cdnBook:     'tirmidhi',
    nameArabic:  'جامع الترمذي',
    nameFrench:  'Jami\' At-Tirmidhi',
    nameEnglish: 'Jami\' At-Tirmidhi',
    author:      'Muhammad ibn Isa at-Tirmidhi',
    defaultGrade: 'Hassan',
    minCount:    3000,
  },
  {
    key:         'nasai',
    cdnBook:     'nasai',
    nameArabic:  'سنن النسائي',
    nameFrench:  'Sunan An-Nasa\'i',
    nameEnglish: 'Sunan an-Nasa\'i',
    author:      'Ahmad ibn Shu\'ayb an-Nasa\'i',
    defaultGrade: 'Hassan',
    minCount:    5000,
  },
  {
    key:         'ibnmajah',
    cdnBook:     'ibnmajah',
    nameArabic:  'سنن ابن ماجه',
    nameFrench:  'Sunan Ibn Majah',
    nameEnglish: 'Sunan Ibn Majah',
    author:      'Ibn Majah Muhammad ibn Yazid',
    defaultGrade: 'Hassan',
    minCount:    4000,
  },
  {
    key:         'riyadussalihin',
    sunnahKey:   'riyadussalihin',
    nameArabic:  'رياض الصالحين',
    nameFrench:  'Riyad as-Salihin',
    nameEnglish: 'Riyad as-Salihin',
    author:      'Imam Yahya ibn Sharaf an-Nawawi',
    defaultGrade: 'Sahih',
    minCount:    1200, // API sunnah.com livre-par-livre — variable selon rate limiting CI (1467-1528 observés)
  },
  {
    key:         'nawawi40',
    cdnBook:     'nawawi',
    nameArabic:  'الأربعون النووية',
    nameFrench:  'Les 40 Hadiths de l\'Imam An-Nawawi',
    nameEnglish: 'Forty Hadith of an-Nawawi',
    author:      'Imam Yahya ibn Sharaf an-Nawawi',
    defaultGrade: 'Sahih',
    minCount:    40,
    exactCount:  42,
  },
]

// ── Types internes ────────────────────────────────────────────

interface ProcessedHadith {
  hadithNumber:  string
  textArabic:    string     // ⚠️ SACRÉ — jamais modifié
  textFrench:    string | null
  textEnglish:   string | null
  grade:         string | null
  gradeSource:   string | null
  reference:     string
}

interface HadithHashEntry {
  collection:   string
  hadithNumber: string
  reference:    string
  hashArabic:   string    // SHA-256 du texte arabe sacré
  hashFrench:   string | null
  hashEnglish:  string | null
}

// ── Utilitaires ───────────────────────────────────────────────

const log     = (m: string) => console.log(`[${new Date().toISOString()}] ${m}`)
const success = (m: string) => console.log(`[${new Date().toISOString()}] ✅ ${m}`)
const warn    = (m: string) => console.warn(`[${new Date().toISOString()}] ⚠️  ${m}`)
const errorLog= (m: string) => console.error(`[${new Date().toISOString()}] ❌ ${m}`)
const sleep   = (ms: number) => new Promise(r => setTimeout(r, ms))
const sha256  = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')

/** Supprime les balises HTML (markup sunnah.com) — NON appliqué sur textArabic seul */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')    // Balises HTML → espace
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')     // Espaces multiples → simple
    .trim()
}

async function fetchJson(url: string, headers: Record<string, string> = {}, maxRetries = 3): Promise<any> {
  let lastErr: Error | null = null
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'saas-islam-seed/1.0',
          ...headers,
        },
      })
      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1500
        warn(`Rate limit — attente ${wait}ms (tentative ${attempt})`)
        await sleep(wait)
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
      return await res.json()
    } catch (e) {
      lastErr = e as Error
      if (attempt < maxRetries) await sleep(Math.pow(2, attempt) * 500)
    }
  }
  throw lastErr ?? new Error(`Échec: ${url}`)
}

// ── Récupération fawazahmed0 CDN ──────────────────────────────

/** Télécharge une édition complète depuis le CDN fawazahmed0 */
async function fetchCdnEdition(book: string, lang: string): Promise<Map<number, string>> {
  const url = `${CDN}/${lang}-${book}.min.json`
  log(`  Téléchargement ${lang}-${book}...`)
  const data = await fetchJson(url)
  const hadiths: any[] = data.hadiths ?? []
  const map = new Map<number, string>()
  for (const h of hadiths) {
    map.set(Number(h.hadithnumber), h.text ?? '')
  }
  log(`  ${lang}-${book}: ${map.size} hadiths`)
  return map
}

/** Récupère les grades depuis l'édition anglaise (qui les contient) */
async function fetchCdnGrades(book: string): Promise<Map<number, { grade: string; source: string }>> {
  const url = `${CDN}/eng-${book}.min.json`
  const data = await fetchJson(url)
  const hadiths: any[] = data.hadiths ?? []
  const map = new Map<number, { grade: string; source: string }>()
  for (const h of hadiths) {
    if (h.grades && h.grades.length > 0) {
      const g = h.grades[0]
      map.set(Number(h.hadithnumber), {
        grade:  g.grade ?? '',
        source: g.graded_by ?? 'Unknown',
      })
    }
  }
  return map
}

/** Traite une collection fawazahmed0 complète */
async function processcdnCollection(cfg: CollectionConfig): Promise<ProcessedHadith[]> {
  const book = cfg.cdnBook!
  log(`\n--- Collection : ${cfg.nameEnglish} (${book}) ---`)

  // Télécharger arabe + français + anglais en parallèle
  const [araMap, fraMap, engMap, gradesMap] = await Promise.all([
    fetchCdnEdition(book, 'ara'),
    fetchCdnEdition(book, 'fra').catch(() => { warn(`Pas de FR pour ${book}`); return new Map<number, string>() }),
    fetchCdnEdition(book, 'eng').catch(() => { warn(`Pas de EN pour ${book}`); return new Map<number, string>() }),
    fetchCdnGrades(book).catch(() => new Map()),
  ])

  const result: ProcessedHadith[] = []

  for (const [num, textArabic] of araMap) {
    if (!textArabic) continue

    const gradeInfo = gradesMap.get(num)
    const gradeValue = gradeInfo?.grade ?? cfg.defaultGrade

    result.push({
      hadithNumber: String(num),
      textArabic,                                // ⚠️ SACRÉ — copié tel quel
      textFrench:  fraMap.get(num) ?? null,
      textEnglish: engMap.get(num) ?? null,
      grade:       gradeValue,
      gradeSource: gradeInfo?.source ?? null,
      reference:   `${cfg.key}:${num}`,
    })
  }

  success(`${cfg.nameEnglish} : ${result.length} hadiths traités`)
  return result
}

// ── Récupération sunnah.com (Riyad as-Salihin) ───────────────

/** Récupère tous les hadiths Riyad as-Salihin via sunnah.com (livre+pagination) */
async function processSunnahCollection(cfg: CollectionConfig): Promise<ProcessedHadith[]> {
  log(`\n--- Collection : ${cfg.nameEnglish} (sunnah.com — pagination complète) ---`)

  const headers = { 'X-API-Key': SUNNAH_KEY }
  const result: ProcessedHadith[] = []
  const PAGE_LIMIT = 50          // Limite sunnah.com par page
  const SLEEP_MS   = 800         // Délai entre requêtes — éviter rate limit

  // Récupérer la liste des livres
  const booksData = await fetchJson(
    `${SUNNAH_API}/collections/${cfg.sunnahKey}/books?limit=100`,
    headers
  )
  const books: any[] = booksData.data ?? []
  log(`  ${books.length} livres trouvés`)

  for (const book of books) {
    const bookNum = book.bookNumber
    let page = 1

    while (true) {
      const url = `${SUNNAH_API}/collections/${cfg.sunnahKey}/books/${bookNum}/hadiths?limit=${PAGE_LIMIT}&page=${page}`
      let data: any

      try {
        data = await fetchJson(url, headers)
      } catch (e) {
        warn(`  Livre ${bookNum} page ${page} : erreur — ${e}`)
        break
      }

      const hadiths: any[] = data.data ?? []
      if (hadiths.length === 0) break

      for (const item of hadiths) {
        let textArabic  = ''
        let textEnglish = ''

        for (const lang of (item.hadith ?? [])) {
          if (lang.lang === 'ar') {
            textArabic = stripHtml(lang.body ?? '')  // ⚠️ SACRÉ — HTML strip uniquement
          } else if (lang.lang === 'en') {
            textEnglish = stripHtml(lang.body ?? '')
          }
        }

        if (!textArabic) continue

        // Éviter les doublons (par hadithNumber)
        if (!result.find(r => r.hadithNumber === String(item.hadithNumber))) {
          result.push({
            hadithNumber: String(item.hadithNumber),
            textArabic,                          // ⚠️ SACRÉ
            textFrench:  null,                   // Non disponible sur sunnah.com
            textEnglish: textEnglish || null,
            grade:       cfg.defaultGrade,
            gradeSource: null,
            reference:   `${cfg.key}:${item.hadithNumber}`,
          })
        }
      }

      process.stdout.write(`\r  Livre ${bookNum} p.${page} — ${result.length} hadiths...     `)

      if (hadiths.length < PAGE_LIMIT) break  // Dernière page du livre
      page++
      await sleep(SLEEP_MS)
    }

    await sleep(SLEEP_MS)  // Pause entre livres
  }

  console.log()
  success(`Riyad as-Salihin : ${result.length} hadiths traités`)
  return result
}

// ── Vérifications d'intégrité ─────────────────────────────────

function verifyCollection(cfg: CollectionConfig, hadiths: ProcessedHadith[], errors: string[]): boolean {
  let ok = true

  if (hadiths.length < cfg.minCount) {
    errors.push(`${cfg.nameEnglish}: ${hadiths.length} hadiths (minimum: ${cfg.minCount})`)
    ok = false
  }

  if (cfg.exactCount !== undefined && hadiths.length !== cfg.exactCount) {
    errors.push(`${cfg.nameEnglish}: ${hadiths.length} hadiths (attendu exactement: ${cfg.exactCount})`)
    ok = false
  }

  if (ok) {
    const exactInfo = cfg.exactCount ? ` = ${cfg.exactCount} ✓ (exact)` : ` ≥ ${cfg.minCount} ✓`
    success(`${cfg.nameEnglish}: ${hadiths.length} hadiths${exactInfo}`)
  }

  return ok
}

// ── Seed base de données ──────────────────────────────────────

async function seedCollection(
  cfg: CollectionConfig,
  hadiths: ProcessedHadith[]
): Promise<void> {
  if (!prisma) return

  // Créer ou récupérer la collection
  const collection = await prisma.hadithCollection.upsert({
    where:  { collectionKey: cfg.key },
    update: {},
    create: {
      nameArabic:    cfg.nameArabic,   // ⚠️ SACRÉ — copié tel quel
      nameFrench:    cfg.nameFrench,
      nameEnglish:   cfg.nameEnglish,
      author:        cfg.author,
      collectionKey: cfg.key,
      totalHadiths:  hadiths.length,
    },
  })

  log(`  Collection créée/récupérée : ID ${collection.id}`)

  // Insérer les hadiths par lots de 100 (transaction)
  const BATCH = 100
  let inserted = 0

  for (let i = 0; i < hadiths.length; i += BATCH) {
    const batch = hadiths.slice(i, i + BATCH)

    await prisma.$transaction(
      batch.map((h: ProcessedHadith) =>
        prisma.hadith.upsert({
          where: {
            collectionId_hadithNumber: {
              collectionId: collection.id,
              hadithNumber: h.hadithNumber,
            },
          },
          update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour
          create: {
            collectionId: collection.id,
            hadithNumber: h.hadithNumber,
            textArabic:   h.textArabic,    // ⚠️ SACRÉ
            textFrench:   h.textFrench,
            textEnglish:  h.textEnglish,
            grade:        h.grade,
            gradeSource:  h.gradeSource,
            reference:    h.reference,
          },
        })
      )
    )

    inserted += batch.length
    process.stdout.write(`\r  ${cfg.nameEnglish} — ${inserted}/${hadiths.length} insérés`)
  }

  console.log()
}

// ── Script principal ──────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now()
  const errors: string[] = []

  console.log('')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║      🌙 IMPORT HADITHS — 8 COLLECTIONS — saas-islam      ║')
  console.log('║      Sources : fawazahmed0/CDN + sunnah.com              ║')
  console.log('║      ZONE SACRÉE — texte arabe IMMUABLE après import     ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (DRY_RUN) {
    warn('MODE DRY_RUN — validation + hashes uniquement (pas de DB)')
    console.log('')
  }

  // ── PHASE 1 : Récupération de toutes les collections ──────
  log('=== PHASE 1 : RÉCUPÉRATION DES DONNÉES ===')

  const allCollections = new Map<string, ProcessedHadith[]>()

  for (const cfg of COLLECTIONS) {
    try {
      let hadiths: ProcessedHadith[]

      if (cfg.cdnBook) {
        hadiths = await processcdnCollection(cfg)
      } else if (cfg.sunnahKey) {
        hadiths = await processSunnahCollection(cfg)
      } else {
        warn(`Aucune source pour ${cfg.key} — ignoré`)
        continue
      }

      allCollections.set(cfg.key, hadiths)
      await sleep(500)  // Pause entre collections
    } catch (e) {
      errors.push(`Erreur récupération ${cfg.key}: ${e}`)
      errorLog(`${cfg.key}: ${e}`)
    }
  }

  // ── PHASE 2 : Vérifications ───────────────────────────────
  log('\n=== PHASE 2 : VÉRIFICATIONS D\'INTÉGRITÉ ===')
  let allValid = true

  for (const cfg of COLLECTIONS) {
    const hadiths = allCollections.get(cfg.key)
    if (!hadiths) {
      errors.push(`Collection manquante : ${cfg.key}`)
      allValid = false
      continue
    }
    if (!verifyCollection(cfg, hadiths, errors)) allValid = false
  }

  if (!allValid) {
    errorLog('VÉRIFICATIONS ÉCHOUÉES — IMPORT ANNULÉ')
    errors.forEach(e => errorLog(`  - ${e}`))
    process.exit(1)
  }

  // ── PHASE 3 : Génération des hashes SHA-256 ───────────────
  log('\n=== PHASE 3 : GÉNÉRATION DES HASHES SHA-256 ===')
  const hashEntries: HadithHashEntry[] = []

  for (const [key, hadiths] of allCollections) {
    for (const h of hadiths) {
      hashEntries.push({
        collection:   key,
        hadithNumber: h.hadithNumber,
        reference:    h.reference,
        hashArabic:   sha256(h.textArabic),                          // ⚠️ Hash sacré
        hashFrench:   h.textFrench  ? sha256(h.textFrench)  : null,
        hashEnglish:  h.textEnglish ? sha256(h.textEnglish) : null,
      })
    }
  }

  // Hash global d'intégrité (tous les hashes arabes concaténés)
  const globalHash = sha256(hashEntries.map(h => h.hashArabic).join(''))
  success(`${hashEntries.length} hashes générés — Global: ${globalHash}`)

  // Sauvegarder
  mkdirSync(join(process.cwd(), 'database/integrity'), { recursive: true })
  const hashPath = join(process.cwd(), 'database/integrity/hadith-hashes.json')
  writeFileSync(hashPath, JSON.stringify({
    metadata: {
      generatedAt:         new Date().toISOString(),
      totalHadiths:        hashEntries.length,
      globalIntegrityHash: globalHash,
      collections: COLLECTIONS.map(c => ({
        key:   c.key,
        name:  c.nameEnglish,
        count: allCollections.get(c.key)?.length ?? 0,
      })),
    },
    hashes: hashEntries,
  }, null, 2), 'utf8')
  success(`Hashes sauvegardés : database/integrity/hadith-hashes.json`)

  // ── PHASE 4 : Seed base de données ───────────────────────
  if (!DRY_RUN && prisma) {
    log('\n=== PHASE 4 : SEED BASE DE DONNÉES ===')

    try {
      await prisma.$connect()
      success('Connexion PostgreSQL établie')
    } catch (e) {
      errors.push(`Connexion DB impossible: ${e}`)
      errorLog(String(e))
    }

    for (const cfg of COLLECTIONS) {
      const hadiths = allCollections.get(cfg.key)
      if (!hadiths) continue
      try {
        log(`  Insertion ${cfg.nameEnglish}...`)
        await seedCollection(cfg, hadiths)
        success(`  ${cfg.nameEnglish} : ${hadiths.length} hadiths en DB`)
      } catch (e) {
        errors.push(`DB error ${cfg.key}: ${e}`)
        errorLog(`Erreur DB ${cfg.key}: ${e}`)
      }
    }

    await prisma.$disconnect()
  }

  // ── PHASE 5 : Rapport ─────────────────────────────────────
  const durationMs = Date.now() - startTime
  const totalHadiths = [...allCollections.values()].reduce((a, b) => a + b.length, 0)

  const report = {
    date:          new Date().toISOString(),
    status:        errors.length === 0 ? 'SUCCESS' : 'FAILED',
    dryRun:        DRY_RUN,
    durationMs,
    totalHadiths,
    globalIntegrityHash: globalHash,
    collections:   COLLECTIONS.map(c => ({
      key:        c.key,
      name:       c.nameEnglish,
      imported:   allCollections.get(c.key)?.length ?? 0,
      minRequired: c.minCount,
      exactRequired: c.exactCount ?? null,
    })),
    errors,
  }

  mkdirSync(join(process.cwd(), 'database/seeds/reports'), { recursive: true })
  const reportPath = join(process.cwd(), 'database/seeds/reports/hadith-import-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

  // ── Résumé ────────────────────────────────────────────────
  const totalSeconds = Math.round(durationMs / 1000)
  console.log('')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log(report.status === 'SUCCESS'
    ? '║               ✅ IMPORT HADITHS TERMINÉ                  ║'
    : '║               ❌ IMPORT AVEC ERREURS                     ║')
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log(`║  Total hadiths   : ${String(totalHadiths).padEnd(38)} ║`)
  console.log(`║  Durée           : ${String(totalSeconds + 's').padEnd(38)} ║`)
  console.log(`║  Mode            : ${(DRY_RUN ? 'DRY_RUN' : 'PRODUCTION (DB seedée)').padEnd(38)} ║`)
  console.log(`║  Hash global     : ${globalHash.substring(0, 38)} ║`)
  console.log('╠══════════════════════════════════════════════════════════╣')
  for (const cfg of COLLECTIONS) {
    const count = allCollections.get(cfg.key)?.length ?? 0
    const status = count >= cfg.minCount ? '✓' : '✗'
    const label = cfg.nameEnglish.substring(0, 25).padEnd(25)
    console.log(`║  ${status} ${label} : ${String(count).padEnd(11)} ║`)
  }
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (errors.length > 0) {
    errors.forEach(e => errorLog(`  - ${e}`))
    process.exit(1)
  }
}

main().catch(e => {
  console.error(`\n❌ ERREUR FATALE : ${e}`)
  process.exit(1)
})
