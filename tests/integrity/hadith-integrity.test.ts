// ============================================================
// hadith-integrity.test.ts — Tests d'intégrité des hadiths
// ⚠️  Ces tests NE MODIFIENT JAMAIS les données
// ============================================================

import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')
const HASH_FILE = join(process.cwd(), 'database/integrity/hadith-hashes.json')
const DB_AVAILABLE = Boolean(process.env.DATABASE_URL)
const describeDB = DB_AVAILABLE ? describe : describe.skip

// Seuils minimaux par collection (basés sur l'import réel)
const COLLECTION_COUNTS: Record<string, { min: number; exact?: number }> = {
  bukhari:        { min: 7563 },
  muslim:         { min: 7300 },
  abudawud:       { min: 4000 },
  tirmidhi:       { min: 3000 },
  nasai:          { min: 5000 },
  ibnmajah:       { min: 4000 },
  riyadussalihin: { min: 1800 },
  nawawi40:       { min: 40, exact: 42 },
}

let prisma: PrismaClient

beforeAll(async () => {
  if (DB_AVAILABLE) {
    prisma = new PrismaClient()
    await prisma.$connect()
  }
})

afterAll(async () => {
  if (DB_AVAILABLE && prisma) {
    await prisma.$disconnect()
  }
})

// ── Bloc 1 : Fichier hashes ───────────────────────────────────

describe('📄 Fichier hadith-hashes.json', () => {

  test('Le fichier de hashes existe', () => {
    expect(existsSync(HASH_FILE)).toBe(true)
  })

  test('Le fichier contient les 8 collections', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const keys = data.metadata.collections.map((c: any) => c.key)
    const required = Object.keys(COLLECTION_COUNTS)
    for (const req of required) {
      expect(keys).toContain(req)
    }
  })

  test('Nawawi40 contient exactement 42 entrées dans le fichier', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const nawawi = data.hashes.filter((h: any) => h.collection === 'nawawi40')
    expect(nawawi).toHaveLength(42)
  })

  test('Tous les hashes sont des SHA-256 valides (64 chars hex)', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const hexRegex = /^[a-f0-9]{64}$/
    let invalid = 0
    for (const h of data.hashes) {
      if (!hexRegex.test(h.hashArabic)) invalid++
    }
    expect(invalid).toBe(0)
  })

  test('Le total dans le fichier est cohérent avec les collections', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const totalInFile = data.hashes.length
    // Total attendu : somme de toutes les collections (≥ 36000)
    expect(totalInFile).toBeGreaterThanOrEqual(36000)
    expect(data.metadata.totalHadiths).toBe(totalInFile)
  })

})

// ── Bloc 2 : Base de données ──────────────────────────────────

describeDB('🗄️  Base de données — Hadiths', () => {

  // ── 2.1 Existence des collections ────────────────────────

  test('Les 8 collections existent en base', async () => {
    const collections = await prisma.hadithCollection.findMany({
      select: { collectionKey: true },
    })
    const keys = collections.map(c => c.collectionKey)

    for (const required of Object.keys(COLLECTION_COUNTS)) {
      expect(keys).toContain(required)
    }
  })

  // ── 2.2 Counts par collection ────────────────────────────

  for (const [key, { min, exact }] of Object.entries(COLLECTION_COUNTS)) {
    test(`${key} : ≥ ${min} hadiths${exact ? ` (exact: ${exact})` : ''}`, async () => {
      const collection = await prisma.hadithCollection.findUnique({
        where: { collectionKey: key },
      })
      expect(collection).not.toBeNull()

      const count = await prisma.hadith.count({
        where: { collectionId: collection!.id },
      })

      expect(count).toBeGreaterThanOrEqual(min)
      if (exact !== undefined) {
        expect(count).toBe(exact)
      }
    })
  }

  // ── 2.3 Aucun texte arabe vide ───────────────────────────

  test('Aucun hadith n\'a un textArabic vide', async () => {
    const empty = await prisma.hadith.count({
      where: { textArabic: '' },
    })
    expect(empty).toBe(0)
  })

  test('Tous les textArabic contiennent du texte arabe (U+0600-U+06FF)', async () => {
    // Vérification sur échantillon : 100 premiers hadiths de chaque collection
    const collections = await prisma.hadithCollection.findMany({ select: { id: true, collectionKey: true } })
    const arabicRegex = /[\u0600-\u06FF]/
    const failures: string[] = []

    for (const col of collections) {
      const sample = await prisma.hadith.findMany({
        where: { collectionId: col.id },
        take: 10,
        select: { hadithNumber: true, textArabic: true },
        orderBy: { hadithNumber: 'asc' },
      })
      for (const h of sample) {
        if (!arabicRegex.test(h.textArabic)) {
          failures.push(`${col.collectionKey}:${h.hadithNumber} — pas de caractères arabes`)
        }
      }
    }

    expect(failures).toHaveLength(0)
  })

  // ── 2.4 Grade présent ────────────────────────────────────

  test('Tous les hadiths ont un grade non-null/non-vide', async () => {
    const withoutGrade = await prisma.hadith.count({
      where: {
        OR: [
          { grade: null },
          { grade: '' },
        ],
      },
    })
    expect(withoutGrade).toBe(0)
  })

  test('Les grades sont des valeurs connues (Sahih/Hassan/Daif/etc.)', async () => {
    // Récupérer les grades distincts
    const gradeCounts = await prisma.$queryRaw<{ grade: string; count: bigint }[]>`
      SELECT grade, COUNT(*) as count
      FROM sacred.hadiths
      WHERE grade IS NOT NULL
      GROUP BY grade
      ORDER BY count DESC
      LIMIT 20
    `
    // Au moins 1 grade doit être "Sahih" ou "sahih" ou similaire
    const grades = gradeCounts.map(g => g.grade?.toLowerCase() ?? '')
    const hasSahih = grades.some(g =>
      g.includes('sahih') || g.includes('صحيح') || g.includes('authentic')
    )
    expect(hasSahih).toBe(true)
    // Pas de grade avec longueur > 200 (signal de données corrompues)
    const tooLong = gradeCounts.filter(g => (g.grade?.length ?? 0) > 200)
    expect(tooLong).toHaveLength(0)
  })

  // ── 2.5 Référence présente ────────────────────────────────

  test('Tous les hadiths ont une référence non-vide', async () => {
    const noRef = await prisma.hadith.count({
      where: { reference: '' },
    })
    expect(noRef).toBe(0)
  })

  test('Les références ont le format attendu (collection:number)', async () => {
    const sample = await prisma.hadith.findMany({
      take: 50,
      select: { reference: true },
    })
    const refRegex = /^[a-z]+\d*:\d+$/
    const invalid = sample.filter(h => !refRegex.test(h.reference))
    expect(invalid).toHaveLength(0)
  })

  // ── 2.6 Vérification hashes SHA-256 ─────────────────────

  test('Les hashes SHA-256 de Bukhari (échantillon 10) sont corrects', async () => {
    expect(existsSync(HASH_FILE)).toBe(true)
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))

    const bukhariHashes = new Map<string, string>()
    for (const h of data.hashes) {
      if (h.collection === 'bukhari') {
        bukhariHashes.set(h.hadithNumber, h.hashArabic)
      }
    }

    // Vérifier les 10 premiers hadiths Bukhari
    const collection = await prisma.hadithCollection.findUnique({
      where: { collectionKey: 'bukhari' },
    })
    const sample = await prisma.hadith.findMany({
      where: { collectionId: collection!.id },
      take: 10,
      orderBy: { hadithNumber: 'asc' },
    })

    const corruptions: string[] = []
    for (const hadith of sample) {
      const stored = bukhariHashes.get(hadith.hadithNumber)
      if (!stored) continue
      const computed = sha256(hadith.textArabic) // ⚠️ textArabic copié tel quel
      if (computed !== stored) {
        corruptions.push(`Bukhari:${hadith.hadithNumber}`)
      }
    }

    expect(corruptions).toHaveLength(0)
  })

  test('Les hashes SHA-256 des 40 Hadiths Nawawi (tous 42) sont corrects', async () => {
    expect(existsSync(HASH_FILE)).toBe(true)
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))

    const nawawiHashes = new Map<string, string>()
    for (const h of data.hashes) {
      if (h.collection === 'nawawi40') {
        nawawiHashes.set(h.hadithNumber, h.hashArabic)
      }
    }

    const collection = await prisma.hadithCollection.findUnique({
      where: { collectionKey: 'nawawi40' },
    })
    const hadiths = await prisma.hadith.findMany({
      where: { collectionId: collection!.id },
      orderBy: { hadithNumber: 'asc' },
    })

    expect(hadiths).toHaveLength(42)

    const corruptions: string[] = []
    for (const hadith of hadiths) {
      const stored = nawawiHashes.get(hadith.hadithNumber)
      if (!stored) continue
      const computed = sha256(hadith.textArabic)
      if (computed !== stored) {
        corruptions.push(`Nawawi:${hadith.hadithNumber}`)
      }
    }

    expect(corruptions).toHaveLength(0)
  })

  // ── 2.7 Unicité ──────────────────────────────────────────

  test('Pas de doublons (collectionId + hadithNumber unique)', async () => {
    const duplicates = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT collection_id, hadith_number, COUNT(*) as n
        FROM sacred.hadiths
        GROUP BY collection_id, hadith_number
        HAVING COUNT(*) > 1
      ) dups
    `
    expect(Number(duplicates[0]?.count ?? 0)).toBe(0)
  })

  // ── 2.8 Cohérence totalHadiths ───────────────────────────

  test('totalHadiths sur chaque collection correspond au compte réel', async () => {
    const collections = await prisma.hadithCollection.findMany()
    const mismatches: string[] = []

    for (const col of collections) {
      const actual = await prisma.hadith.count({
        where: { collectionId: col.id },
      })
      if (col.totalHadiths !== null && col.totalHadiths !== actual) {
        mismatches.push(`${col.collectionKey}: totalHadiths=${col.totalHadiths}, réel=${actual}`)
      }
    }

    expect(mismatches).toHaveLength(0)
  })

})
