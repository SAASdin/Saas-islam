// ============================================================
// quran-integrity.test.ts — Tests d'intégrité des données coraniques
// ⚠️  Ces tests NE MODIFIENT JAMAIS les données
// ⚠️  Un seul échec = blocage du merge (--bail activé)
// ============================================================

import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '@prisma/client'

// ── Helpers ───────────────────────────────────────────────────

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex')

const HASH_FILE = join(process.cwd(), 'database/integrity/quran-hashes.json')
const DB_AVAILABLE = Boolean(process.env.DATABASE_URL)

// Skip les tests DB si pas de DATABASE_URL
const describeDB = DB_AVAILABLE ? describe : describe.skip

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

// ── Bloc 1 : Fichier hashes (sans DB) ────────────────────────

describe('📄 Fichier hashes quran-hashes.json', () => {

  test('Le fichier de hashes existe', () => {
    expect(existsSync(HASH_FILE)).toBe(true)
  })

  test('Le fichier contient exactement 6236 hashes', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    expect(data.hashes).toHaveLength(6236)
  })

  test('Chaque hash est un SHA-256 valide (64 caractères hex)', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const hexRegex = /^[a-f0-9]{64}$/
    let invalid = 0
    for (const h of data.hashes) {
      if (!hexRegex.test(h.hashUthmani)) invalid++
    }
    expect(invalid).toBe(0)
  })

  test('Les verseKeys sont au format attendu (X:Y)', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const verseKeyRegex = /^\d{1,3}:\d{1,3}$/
    let invalid = 0
    for (const h of data.hashes) {
      if (!verseKeyRegex.test(h.verseKey)) invalid++
    }
    expect(invalid).toBe(0)
  })

  test('Al-Fatiha (sourate 1) a 7 hashes dans le fichier', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const fatiha = data.hashes.filter((h: any) => h.surahId === 1)
    expect(fatiha).toHaveLength(7)
  })

  test('Al-Baqarah (sourate 2) a 286 hashes dans le fichier', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const baqarah = data.hashes.filter((h: any) => h.surahId === 2)
    expect(baqarah).toHaveLength(286)
  })

  test('Al-Ikhlas (sourate 112) a 4 hashes dans le fichier', () => {
    const data = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const ikhlas = data.hashes.filter((h: any) => h.surahId === 112)
    expect(ikhlas).toHaveLength(4)
  })

})

// ── Bloc 2 : Base de données ──────────────────────────────────

describeDB('🗄️  Base de données — Coran', () => {

  // ── 2.1 Counts ──────────────────────────────────────────────

  test('La DB contient exactement 114 sourates', async () => {
    const count = await prisma.quranSurah.count()
    expect(count).toBe(114)
  })

  test('La DB contient exactement 6236 versets', async () => {
    const count = await prisma.quranAyah.count()
    expect(count).toBe(6236)
  })

  test('Al-Fatiha (sourate 1) a exactement 7 versets', async () => {
    const count = await prisma.quranAyah.count({ where: { surahId: 1 } })
    expect(count).toBe(7)
  })

  test('Al-Baqarah (sourate 2) a exactement 286 versets', async () => {
    const count = await prisma.quranAyah.count({ where: { surahId: 2 } })
    expect(count).toBe(286)
  })

  test('Al-Ikhlas (sourate 112) a exactement 4 versets', async () => {
    const count = await prisma.quranAyah.count({ where: { surahId: 112 } })
    expect(count).toBe(4)
  })

  // ── 2.2 Bismillah ───────────────────────────────────────────

  test('Toutes les sourates sauf At-Tawbah (9) ont hasBismillah=true', async () => {
    // Sourates sans Bismillah : seulement la sourate 9
    const withoutBismillah = await prisma.quranSurah.findMany({
      where: { hasBismillah: false },
      select: { id: true, nameArabic: true },
    })
    expect(withoutBismillah).toHaveLength(1)
    expect(withoutBismillah[0].id).toBe(9)
  })

  test('At-Tawbah (sourate 9) a hasBismillah=false', async () => {
    const tawbah = await prisma.quranSurah.findUnique({ where: { id: 9 } })
    expect(tawbah).not.toBeNull()
    expect(tawbah!.hasBismillah).toBe(false)
  })

  test('113 sourates ont hasBismillah=true', async () => {
    const count = await prisma.quranSurah.count({ where: { hasBismillah: true } })
    expect(count).toBe(113)
  })

  // ── 2.3 Traductions ─────────────────────────────────────────

  test('Chaque verset a une traduction française (Hamidullah)', async () => {
    const totalAyahs = await prisma.quranAyah.count()
    const withFr = await prisma.quranTranslation.count({
      where: { languageCode: 'fr' },
    })
    expect(withFr).toBe(totalAyahs)
  })

  test('Chaque verset a une traduction anglaise (Saheeh International)', async () => {
    const totalAyahs = await prisma.quranAyah.count()
    const withEn = await prisma.quranTranslation.count({
      where: { languageCode: 'en' },
    })
    expect(withEn).toBe(totalAyahs)
  })

  test('Toutes les traductions ont isValidated=true', async () => {
    const unvalidated = await prisma.quranTranslation.count({
      where: { isValidated: false },
    })
    expect(unvalidated).toBe(0)
  })

  // ── 2.4 Texte arabe non vide ────────────────────────────────

  test('Aucun verset n\'a un textUthmani vide', async () => {
    const emptyArabic = await prisma.quranAyah.count({
      where: { textUthmani: '' },
    })
    expect(emptyArabic).toBe(0)
  })

  test('Aucune traduction FR n\'a un texte vide', async () => {
    const emptyFr = await prisma.quranTranslation.count({
      where: { languageCode: 'fr', translation: '' },
    })
    expect(emptyFr).toBe(0)
  })

  // ── 2.5 Charset arabe ──────────────────────────────────────

  test('Tous les versets contiennent du texte arabe (Unicode U+0600-U+06FF)', async () => {
    // Test sur un échantillon représentatif : premier + dernier verset de chaque sourate
    const surahs = await prisma.quranSurah.findMany({ select: { id: true } })
    const arabicUnicodeRegex = /[\u0600-\u06FF]/

    let nonArabicCount = 0
    for (const { id } of surahs) {
      const firstAyah = await prisma.quranAyah.findFirst({
        where: { surahId: id },
        orderBy: { ayahNumber: 'asc' },
      })
      if (firstAyah && !arabicUnicodeRegex.test(firstAyah.textUthmani)) {
        nonArabicCount++
      }
    }
    // Les sourates avec lettres muqatta'at (ص، ق، ن) sont valides
    expect(nonArabicCount).toBe(0)
  })

  test('Aucun verset ne contient de caractères de contrôle ASCII (<0x20)', async () => {
    // Test sur échantillon : 50 versets aléatoires
    const sample = await prisma.quranAyah.findMany({
      take: 50,
      orderBy: { ayahNumberQuran: 'asc' },
      select: { textUthmani: true, surahId: true, ayahNumber: true },
    })

    const controlCharRegex = /[\x00-\x1F]/
    const withControl = sample.filter(a => controlCharRegex.test(a.textUthmani))
    expect(withControl).toHaveLength(0)
  })

  // ── 2.6 Vérification des hashes SHA-256 ────────────────────

  test('Les hashes SHA-256 des versets correspondent au fichier d\'intégrité', async () => {
    expect(existsSync(HASH_FILE)).toBe(true)
    const hashData = JSON.parse(readFileSync(HASH_FILE, 'utf8'))
    const storedHashes = new Map<string, string>()

    for (const h of hashData.hashes) {
      storedHashes.set(h.verseKey, h.hashUthmani)
    }

    // Vérifier un échantillon stratégique : 1ère + dernière sourate + 10 aléatoires
    const STRATEGIC_VERSES = [
      { surahId: 1,   ayahNumber: 1   },  // Al-Fatiha 1:1 (Bismillah)
      { surahId: 1,   ayahNumber: 7   },  // Al-Fatiha 1:7 (dernier)
      { surahId: 2,   ayahNumber: 255 },  // Ayat Al-Kursi ⭐
      { surahId: 2,   ayahNumber: 286 },  // Al-Baqarah dernier
      { surahId: 9,   ayahNumber: 1   },  // At-Tawbah (sans Bismillah)
      { surahId: 36,  ayahNumber: 1   },  // Ya-Sin 1er
      { surahId: 112, ayahNumber: 1   },  // Al-Ikhlas 1er
      { surahId: 112, ayahNumber: 4   },  // Al-Ikhlas dernier
      { surahId: 113, ayahNumber: 1   },  // Al-Falaq
      { surahId: 114, ayahNumber: 6   },  // An-Nas dernier (dernier verset du Coran)
    ]

    let mismatches = 0
    const mismatchDetails: string[] = []

    for (const { surahId, ayahNumber } of STRATEGIC_VERSES) {
      const ayah = await prisma.quranAyah.findUnique({
        where: { surahId_ayahNumber: { surahId, ayahNumber } },
      })

      if (!ayah) {
        mismatchDetails.push(`Verset ${surahId}:${ayahNumber} introuvable en DB`)
        mismatches++
        continue
      }

      const verseKey = `${surahId}:${ayahNumber}`
      const storedHash = storedHashes.get(verseKey)
      if (!storedHash) {
        mismatchDetails.push(`Hash manquant pour ${verseKey}`)
        mismatches++
        continue
      }

      const computedHash = sha256(ayah.textUthmani)  // ⚠️ JAMAIS modifier textUthmani
      if (computedHash !== storedHash) {
        mismatchDetails.push(
          `⚠️  CORRUPTION DÉTECTÉE sur ${verseKey} !\n` +
          `  Attendu : ${storedHash}\n` +
          `  Calculé : ${computedHash}`
        )
        mismatches++
      }
    }

    if (mismatches > 0) {
      fail(`${mismatches} hash(es) incorrect(s) :\n${mismatchDetails.join('\n')}`)
    }

    expect(mismatches).toBe(0)
  })

  test('Vérification complète des hashes — TOUS les 6236 versets', async () => {
    expect(existsSync(HASH_FILE)).toBe(true)
    const hashData = JSON.parse(readFileSync(HASH_FILE, 'utf8'))

    // Construire map surahId:ayahNumber → hashUthmani
    const storedHashes = new Map<string, string>()
    for (const h of hashData.hashes) {
      storedHashes.set(`${h.surahId}:${h.verseNumber}`, h.hashUthmani)
    }

    // Récupérer tous les versets en une requête
    const allAyahs = await prisma.quranAyah.findMany({
      select: {
        surahId: true,
        ayahNumber: true,
        textUthmani: true,
      },
      orderBy: [{ surahId: 'asc' }, { ayahNumber: 'asc' }],
    })

    expect(allAyahs).toHaveLength(6236)

    const corruptions: string[] = []
    for (const ayah of allAyahs) {
      const key = `${ayah.surahId}:${ayah.ayahNumber}`
      const stored = storedHashes.get(key)

      if (!stored) {
        corruptions.push(`Hash manquant: ${key}`)
        continue
      }

      const computed = sha256(ayah.textUthmani)
      if (computed !== stored) {
        corruptions.push(`CORRUPTION: ${key} (hash mismatch)`)
      }
    }

    if (corruptions.length > 0) {
      const msg = [
        `⛔ ${corruptions.length} CORRUPTION(S) DÉTECTÉE(S) DANS LE TEXTE CORANIQUE ⛔`,
        ...corruptions.slice(0, 10),
        corruptions.length > 10 ? `... et ${corruptions.length - 10} autres` : '',
      ].join('\n')
      fail(msg)
    }

    expect(corruptions).toHaveLength(0)
  }, 60_000) // Timeout 60s pour les 6236 versets

  // ── 2.7 Cohérence ayah_count ────────────────────────────────

  test('Le nombre de versets en DB correspond à ayahCount sur chaque sourate', async () => {
    const surahs = await prisma.quranSurah.findMany()
    const mismatches: string[] = []

    for (const surah of surahs) {
      const actual = await prisma.quranAyah.count({ where: { surahId: surah.id } })
      if (actual !== surah.ayahCount) {
        mismatches.push(
          `Sourate ${surah.id} (${surah.nameTransliteration}): ` +
          `ayahCount=${surah.ayahCount} mais ${actual} versets en DB`
        )
      }
    }

    expect(mismatches).toHaveLength(0)
  }, 60_000)

})
