// ============================================================
// 01-import-quran.ts — Import complet du Coran depuis quran.com
// Source : api.qurancdn.com (quran.com officiel)
// ⚠️  ZONE SACRÉE — Texte arabe IMMUABLE après import
// ⚠️  Ce script s'exécute UNE SEULE FOIS en production
//     Validation requise : Moha ✅ + Bilal ✅ avant exécution DB
//
// RÈGLE ABSOLUE : Texte arabe copié tel quel — ZÉRO modification
// Aucun trim(), replace(), toLowerCase(), normalize() sur le texte arabe
// ============================================================

import 'dotenv/config'
import { createHash } from 'crypto'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ── Imports Prisma (optionnel — mode dry-run si pas de DB) ────
let prisma: any = null
const DRY_RUN = !process.env.DATABASE_URL || process.env.DRY_RUN === 'true'

if (!DRY_RUN) {
  try {
    const { PrismaClient } = require('@prisma/client')
    prisma = new PrismaClient()
  } catch (e) {
    console.warn('⚠️  Prisma non disponible — mode validation API uniquement')
  }
}

// ── Configuration API quran.com ───────────────────────────────
const QDC_BASE = 'https://api.qurancdn.com/api/qdc'
const TRANSLATION_FR  = 31   // Muhammad Hamidullah (français)
const TRANSLATION_EN  = 20   // Saheeh International (anglais)
const PER_PAGE        = 300  // Max > 286 (Al-Baqarah) → toujours 1 seule page par sourate

// Délai entre les requêtes API (ms) — respect du serveur
const RATE_LIMIT_MS = 400

// ── Types API qurancdn ────────────────────────────────────────

interface QdcChapter {
  id: number
  revelation_place: string       // 'makkah' | 'madinah'
  revelation_order: number
  bismillah_pre: boolean         // true = Bismillah affiché AVANT la sourate
  name_simple: string            // 'Al-Fatihah'
  name_complex: string           // 'Al-Fātiḥah'
  name_arabic: string            // ⚠️ SACRÉ — الفاتحة
  verses_count: number
  pages: [number, number]        // [première_page, dernière_page]
  translated_name: {
    language_name: string
    name: string                 // Nom traduit (français si language=fr)
  }
}

interface QdcTranslation {
  id: number
  resource_id: number
  text: string                   // ⚠️ Traduction — copié tel quel (peut contenir <sup>)
}

interface QdcVerse {
  id: number                     // ID global verse (1-6236)
  verse_number: number           // Numéro dans la sourate (1-N)
  verse_key: string              // '1:1', '2:286', etc.
  hizb_number: number
  rub_el_hizb_number: number
  ruku_number: number
  manzil_number: number
  sajdah_number: number | null   // null si pas de sajda
  text_uthmani: string           // ⚠️ SACRÉ — texte Uthmani complet
  text_imlaei: string            // ⚠️ SACRÉ — texte Imlaei (sans Hamza Wasl)
  page_number: number
  juz_number: number
  translations: QdcTranslation[]
}

interface QdcVersesResponse {
  verses: QdcVerse[]
  pagination: {
    per_page: number
    current_page: number
    next_page: number | null
    total_pages: number
    total_records: number
  }
}

// ── Structures de données locales ─────────────────────────────

interface VerseHashEntry {
  verseKey: string               // '1:1'
  surahId: number
  verseNumber: number
  globalId: number               // ID global (1-6236)
  hashUthmani: string            // SHA-256 du texte Uthmani
  hashTranslationFr: string      // SHA-256 de la traduction FR
  hashTranslationEn: string      // SHA-256 de la traduction EN
}

interface ImportReport {
  date: string
  source: string
  apiVersion: string
  totalSurahs: number
  totalAyahs: number
  translations: string[]
  sampleChecks: {
    alFatihah_verseCount: number
    alBaqarah_verseCount: number
    atTawbah_hasBismillah: boolean
  }
  integrityHash: string          // SHA-256 de tous les hashes concaténés
  dryRun: boolean
  status: 'SUCCESS' | 'FAILED'
  errors: string[]
  durationMs: number
}

// ── Utilitaires ───────────────────────────────────────────────

function log(msg: string): void {
  console.log(`[${new Date().toISOString()}] ${msg}`)
}

function success(msg: string): void {
  console.log(`[${new Date().toISOString()}] ✅ ${msg}`)
}

function warn(msg: string): void {
  console.warn(`[${new Date().toISOString()}] ⚠️  ${msg}`)
}

function errorLog(msg: string): void {
  console.error(`[${new Date().toISOString()}] ❌ ${msg}`)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Génère un SHA-256 hex d'une chaîne */
function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/** Fetch avec retry et backoff exponentiel */
async function fetchWithRetry(url: string, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'saas-islam-seed/1.0 (islamique-platform)' }
      })

      if (res.status === 429) {
        const wait = Math.pow(2, attempt) * 1000
        warn(`Rate limit (429) — attente ${wait}ms avant retry ${attempt}/${maxRetries}`)
        await sleep(wait)
        continue
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText} — ${url}`)
      }

      return await res.json()

    } catch (e) {
      lastError = e as Error
      if (attempt < maxRetries) {
        const wait = Math.pow(2, attempt) * 500
        warn(`Erreur réseau (tentative ${attempt}/${maxRetries}) — retry dans ${wait}ms`)
        await sleep(wait)
      }
    }
  }

  throw lastError ?? new Error(`Échec après ${maxRetries} tentatives: ${url}`)
}

// ── Fonctions de récupération API ────────────────────────────

/** Récupère les 114 sourates avec métadonnées en français */
async function fetchAllChapters(): Promise<QdcChapter[]> {
  log('Récupération des 114 sourates (chapters)...')
  const data = await fetchWithRetry(`${QDC_BASE}/chapters?language=fr`)

  if (!data.chapters || !Array.isArray(data.chapters)) {
    throw new Error(`Réponse invalide de /chapters: ${JSON.stringify(data)}`)
  }

  success(`${data.chapters.length} sourates récupérées`)
  return data.chapters
}

/** Récupère tous les versets d'une sourate (text_uthmani + text_imlaei + traductions FR+EN) */
async function fetchVersesForChapter(chapterId: number): Promise<QdcVerse[]> {
  const url = `${QDC_BASE}/verses/by_chapter/${chapterId}` +
    `?words=false` +
    `&translations=${TRANSLATION_FR},${TRANSLATION_EN}` +
    `&fields=text_uthmani,text_imlaei,verse_key,juz_number,hizb_number,rub_el_hizb_number,page_number,sajdah_number` +
    `&per_page=${PER_PAGE}`

  const data: QdcVersesResponse = await fetchWithRetry(url)

  if (!data.verses || !Array.isArray(data.verses)) {
    throw new Error(`Réponse invalide pour sourate ${chapterId}`)
  }

  // Vérification : si pagination en plusieurs pages (ne devrait pas arriver avec per_page=300)
  if (data.pagination.next_page !== null) {
    warn(`Sourate ${chapterId} a plus de ${PER_PAGE} versets — pagination non gérée !`)
  }

  return data.verses
}

// ── Vérifications d'intégrité ─────────────────────────────────

function runIntegrityChecks(
  chapters: QdcChapter[],
  allVerses: Map<number, QdcVerse[]>,
  errors: string[]
): boolean {
  let valid = true

  // ✅ Check 1 : 114 sourates exactement
  if (chapters.length !== 114) {
    errors.push(`ERREUR CRITIQUE : ${chapters.length} sourates récupérées (attendu: 114)`)
    valid = false
  } else {
    success('✓ 114 sourates confirmées')
  }

  // ✅ Check 2 : Compte total des versets = 6236
  let totalVerses = 0
  for (const [_, verses] of allVerses) {
    totalVerses += verses.length
  }
  if (totalVerses !== 6236) {
    errors.push(`ERREUR CRITIQUE : ${totalVerses} versets importés (attendu: 6236)`)
    valid = false
  } else {
    success(`✓ 6236 versets confirmés`)
  }

  // ✅ Check 3 : Al-Fatiha (sourate 1) = 7 versets
  const fatihaVerses = allVerses.get(1)
  if (!fatihaVerses || fatihaVerses.length !== 7) {
    errors.push(`ERREUR : Al-Fatiha = ${fatihaVerses?.length ?? 0} versets (attendu: 7)`)
    valid = false
  } else {
    success('✓ Al-Fatiha : 7 versets')
  }

  // ✅ Check 4 : Al-Baqarah (sourate 2) = 286 versets
  const baqarahVerses = allVerses.get(2)
  if (!baqarahVerses || baqarahVerses.length !== 286) {
    errors.push(`ERREUR : Al-Baqarah = ${baqarahVerses?.length ?? 0} versets (attendu: 286)`)
    valid = false
  } else {
    success('✓ Al-Baqarah : 286 versets')
  }

  // ✅ Check 5 : At-Tawbah (sourate 9) n'a PAS de Bismillah
  const tawbah = chapters.find(c => c.id === 9)
  if (tawbah?.bismillah_pre !== false) {
    errors.push('ERREUR : At-Tawbah (sourate 9) devrait avoir bismillah_pre = false')
    valid = false
  } else {
    success('✓ At-Tawbah (sourate 9) : pas de Bismillah confirmé')
  }

  // ✅ Check 6 : Chaque verset doit avoir les deux traductions
  let missingTranslations = 0
  for (const [surahId, verses] of allVerses) {
    for (const v of verses) {
      const hasFr = v.translations.some(t => t.resource_id === TRANSLATION_FR)
      const hasEn = v.translations.some(t => t.resource_id === TRANSLATION_EN)
      if (!hasFr || !hasEn) {
        missingTranslations++
        if (missingTranslations <= 5) {
          warn(`Traduction manquante pour ${v.verse_key}: FR=${hasFr}, EN=${hasEn}`)
        }
      }
    }
  }
  if (missingTranslations > 0) {
    errors.push(`${missingTranslations} versets avec traductions manquantes`)
    // Non bloquant (certains versets peuvent ne pas avoir toutes les traductions)
    warn(`${missingTranslations} versets avec traductions partielles — non bloquant`)
  } else {
    success('✓ Toutes les traductions FR+EN présentes')
  }

  return valid
}

// ── Génération des hashes d'intégrité ────────────────────────

function generateHashes(allVerses: Map<number, QdcVerse[]>): VerseHashEntry[] {
  log('Génération des hashes SHA-256 pour chaque verset...')
  const hashes: VerseHashEntry[] = []

  for (const [surahId, verses] of allVerses) {
    for (const v of verses) {
      const frTranslation = v.translations.find(t => t.resource_id === TRANSLATION_FR)
      const enTranslation = v.translations.find(t => t.resource_id === TRANSLATION_EN)

      hashes.push({
        verseKey:         v.verse_key,
        surahId,
        verseNumber:      v.verse_number,
        globalId:         v.id,
        hashUthmani:      sha256(v.text_uthmani),    // ⚠️ Hash du texte sacré
        hashTranslationFr: sha256(frTranslation?.text ?? ''),
        hashTranslationEn: sha256(enTranslation?.text ?? ''),
      })
    }
  }

  success(`${hashes.length} hashes générés`)
  return hashes
}

// ── Seed base de données ──────────────────────────────────────

async function seedDatabase(
  chapters: QdcChapter[],
  allVerses: Map<number, QdcVerse[]>
): Promise<void> {
  if (!prisma) {
    warn('Mode DRY_RUN — aucune écriture en base de données')
    return
  }

  log('=== SEED BASE DE DONNÉES ===')

  // Vérifier la connexion
  try {
    await prisma.$connect()
    success('Connexion PostgreSQL établie')
  } catch (e) {
    throw new Error(`Impossible de se connecter à la BDD: ${e}`)
  }

  // ── Seed sourates ──────────────────────────────────────────
  log('Import des 114 sourates...')
  for (const chapter of chapters) {
    const revelationType = chapter.revelation_place === 'makkah'
      ? 'mecquoise'   // ⚠️ Français avec accents — valeur contrainte en DB
      : 'médinoise'   // ⚠️ Français avec accents — valeur contrainte en DB

    // hasBismillah = true SAUF pour At-Tawbah (sourate 9)
    // Note : bismillah_pre=false pour Fatiha car la Bismillah EST le verset 1
    const hasBismillah = chapter.id !== 9

    await prisma.quranSurah.upsert({
      where: { id: chapter.id },
      update: {},  // ⚠️ ZONE SACRÉE — on ne modifie jamais
      create: {
        id:                  chapter.id,
        nameArabic:          chapter.name_arabic,   // ⚠️ SACRÉ — copié tel quel
        nameTransliteration: chapter.name_simple,
        nameFrench:          chapter.translated_name.name,  // API renvoie déjà en FR
        nameEnglish:         chapter.name_complex,
        revelationType,
        ayahCount:           chapter.verses_count,
        juzStart:            1,                     // Sera précisé via les versets
        pageMushaf:          chapter.pages[0],      // Première page de la sourate
        hasBismillah,
      },
    })
  }
  success('114 sourates importées')

  // ── Seed versets ───────────────────────────────────────────
  log('Import des 6236 versets...')
  let totalAyahs = 0

  for (const [surahId, verses] of allVerses) {
    // Batch par sourate dans une transaction
    await prisma.$transaction(
      verses.map((verse) => {
        return prisma.quranAyah.upsert({
          where: {
            surahId_ayahNumber: {
              surahId,
              ayahNumber: verse.verse_number,
            }
          },
          update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour
          create: {
            surahId,
            ayahNumber:      verse.verse_number,
            ayahNumberQuran: verse.id,           // ID global 1-6236
            textUthmani:     verse.text_uthmani, // ⚠️ SACRÉ — copié tel quel
            textSimple:      verse.text_imlaei,  // ⚠️ SACRÉ — copié tel quel
            juz:             verse.juz_number,
            hizb:            verse.hizb_number,
            rub:             verse.rub_el_hizb_number,
            pageMushaf:      verse.page_number,
            sajda:           verse.sajdah_number !== null,
            sajdaType:       null,               // TODO: enrichir si nécessaire
          },
        })
      })
    )

    totalAyahs += verses.length
    process.stdout.write(`\r  Sourate ${surahId}/114 — ${totalAyahs} versets importés`)
  }
  console.log()
  success(`${totalAyahs} versets importés en base`)

  // ── Seed traductions ────────────────────────────────────────
  log('Import des traductions (FR Hamidullah + EN Saheeh International)...')

  const translationsConfig = [
    { resourceId: TRANSLATION_FR, langCode: 'fr', name: 'Muhammad Hamidullah',   key: 'fr.hamidullah' },
    { resourceId: TRANSLATION_EN, langCode: 'en', name: 'Saheeh International',  key: 'en.saheeh-international' },
  ]

  for (const tConfig of translationsConfig) {
    log(`  Import traduction ${tConfig.langCode} (${tConfig.name})...`)
    let count = 0

    for (const [surahId, verses] of allVerses) {
      for (const verse of verses) {
        const tData = verse.translations.find(t => t.resource_id === tConfig.resourceId)
        if (!tData) continue

        // Récupérer l'ID du verset en base
        const dbAyah = await prisma.quranAyah.findUnique({
          where: {
            surahId_ayahNumber: { surahId, ayahNumber: verse.verse_number }
          },
          select: { id: true },
        })

        if (!dbAyah) {
          warn(`Verset ${verse.verse_key} introuvable en base — traduction ignorée`)
          continue
        }

        await prisma.quranTranslation.upsert({
          where: {
            ayahId_translatorKey: { ayahId: dbAyah.id, translatorKey: tConfig.key }
          },
          update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour
          create: {
            ayahId:         dbAyah.id,
            languageCode:   tConfig.langCode,
            translatorName: tConfig.name,
            translatorKey:  tConfig.key,
            translation:    tData.text,     // ⚠️ Copié tel quel depuis l'API
            isValidated:    true,
          },
        })

        count++
      }
    }

    success(`  ${count} traductions ${tConfig.langCode} (${tConfig.name}) importées`)
  }

  await prisma.$disconnect()
}

// ── Script principal ─────────────────────────────────────────

async function main(): Promise<void> {
  const startTime = Date.now()
  const errors: string[] = []

  console.log('')
  console.log('╔══════════════════════════════════════════════════════════╗')
  console.log('║      🌙 IMPORT CORAN COMPLET — saas-islam NoorApp        ║')
  console.log('║      Source : api.qurancdn.com (quran.com officiel)      ║')
  console.log('║      ZONE SACRÉE — texte arabe IMMUABLE après import     ║')
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (DRY_RUN) {
    warn('MODE DRY_RUN — Validation API + génération hashes uniquement (pas de DB)')
    warn('Pour activer l\'import DB, définir DATABASE_URL dans .env')
    console.log('')
  }

  // ── PHASE 1 : Récupération des chapitres ───────────────────
  log('=== PHASE 1 : MÉTADONNÉES SOURATES ===')
  const chapters = await fetchAllChapters()

  // ── PHASE 2 : Récupération de tous les versets ────────────
  log('=== PHASE 2 : IMPORT DES VERSETS ===')
  const allVerses = new Map<number, QdcVerse[]>()

  for (const chapter of chapters) {
    process.stdout.write(`\r  Sourate ${chapter.id}/114 (${chapter.name_simple})...      `)

    const verses = await fetchVersesForChapter(chapter.id)
    allVerses.set(chapter.id, verses)

    // Rate limiting — respecter le serveur quran.com
    await sleep(RATE_LIMIT_MS)
  }
  console.log()
  success('Tous les versets récupérés depuis l\'API')

  // ── PHASE 3 : Vérifications d'intégrité ───────────────────
  log('=== PHASE 3 : VÉRIFICATIONS D\'INTÉGRITÉ ===')
  const isValid = runIntegrityChecks(chapters, allVerses, errors)

  if (!isValid) {
    errorLog('VÉRIFICATIONS ÉCHOUÉES — IMPORT ANNULÉ')
    errors.forEach(e => errorLog(e))
    process.exit(1)
  }

  // ── PHASE 4 : Génération des hashes SHA-256 ────────────────
  log('=== PHASE 4 : GÉNÉRATION DES HASHES SHA-256 ===')
  const hashes = generateHashes(allVerses)

  // Calculer le hash global (hash de tous les hash_uthmani concaténés)
  const globalHashInput = hashes.map(h => h.hashUthmani).join('')
  const globalHash = sha256(globalHashInput)
  success(`Hash d'intégrité global : ${globalHash}`)

  // Sauvegarder les hashes
  const hashesPath = join(process.cwd(), 'database/integrity/quran-hashes.json')
  mkdirSync(join(process.cwd(), 'database/integrity'), { recursive: true })
  writeFileSync(hashesPath, JSON.stringify({
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'api.qurancdn.com',
      translationFr: 'Muhammad Hamidullah (ID: 31)',
      translationEn: 'Saheeh International (ID: 20)',
      totalVerses: hashes.length,
      globalIntegrityHash: globalHash,
    },
    hashes,
  }, null, 2), 'utf8')
  success(`Hashes sauvegardés : database/integrity/quran-hashes.json`)

  // ── PHASE 5 : Seed base de données ────────────────────────
  if (!DRY_RUN) {
    log('=== PHASE 5 : SEED BASE DE DONNÉES ===')
    try {
      await seedDatabase(chapters, allVerses)
    } catch (e) {
      errors.push(`Erreur DB : ${e}`)
      errorLog(`Erreur lors du seed DB : ${e}`)
    }
  }

  // ── PHASE 6 : Rapport d'import ─────────────────────────────
  const durationMs = Date.now() - startTime
  const tawbah = chapters.find(c => c.id === 9)

  const report: ImportReport = {
    date: new Date().toISOString(),
    source: 'api.qurancdn.com',
    apiVersion: 'qdc/v1',
    totalSurahs: chapters.length,
    totalAyahs: [...allVerses.values()].reduce((acc, v) => acc + v.length, 0),
    translations: [
      'fr-hamidullah (Muhammad Hamidullah, ID: 31)',
      'en-saheeh-international (Saheeh International, ID: 20)',
    ],
    sampleChecks: {
      alFatihah_verseCount:   allVerses.get(1)?.length ?? 0,
      alBaqarah_verseCount:   allVerses.get(2)?.length ?? 0,
      atTawbah_hasBismillah:  tawbah?.bismillah_pre ?? true,
    },
    integrityHash: globalHash,
    dryRun: DRY_RUN,
    status: errors.length === 0 ? 'SUCCESS' : 'FAILED',
    errors,
    durationMs,
  }

  mkdirSync(join(process.cwd(), 'database/seeds/reports'), { recursive: true })
  const reportPath = join(process.cwd(), 'database/seeds/reports/quran-import-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8')

  // ── Résumé final ───────────────────────────────────────────
  console.log('')
  console.log('╔══════════════════════════════════════════════════════════╗')
  if (report.status === 'SUCCESS') {
    console.log('║                  ✅ IMPORT TERMINÉ                       ║')
  } else {
    console.log('║                  ❌ IMPORT AVEC ERREURS                  ║')
  }
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log(`║  Sourates    : ${String(report.totalSurahs).padEnd(42)} ║`)
  console.log(`║  Versets     : ${String(report.totalAyahs).padEnd(42)} ║`)
  console.log(`║  Durée       : ${String(Math.round(durationMs / 1000) + 's').padEnd(42)} ║`)
  console.log(`║  Mode        : ${(DRY_RUN ? 'DRY_RUN (pas de DB)' : 'PRODUCTION (DB seedée)').padEnd(42)} ║`)
  console.log(`║  Hash global : ${globalHash.substring(0, 42)} ║`)
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log('║  Al-Fatiha   : 7 versets ✓                               ║')
  console.log('║  Al-Baqarah  : 286 versets ✓                             ║')
  console.log('║  At-Tawbah   : pas de Bismillah ✓                        ║')
  console.log('╠══════════════════════════════════════════════════════════╣')
  console.log(`║  Rapport : database/seeds/reports/quran-import-report.json  ║`)
  console.log(`║  Hashes  : database/integrity/quran-hashes.json              ║`)
  console.log('╚══════════════════════════════════════════════════════════╝')
  console.log('')

  if (errors.length > 0) {
    errorLog('Erreurs rencontrées :')
    errors.forEach(e => errorLog(`  - ${e}`))
    process.exit(1)
  }
}

main().catch(e => {
  console.error(`\n❌ ERREUR FATALE : ${e}`)
  process.exit(1)
})
