// ============================================================
// verify_integrity.ts — Vérification de l'intégrité post-seed
// Vérifie les counts, les contraintes et les règles islamiques
// ⚠️  READ ONLY — ne modifie rien
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { log, success, warn, error, section } from './lib/logger'

const prisma = new PrismaClient()

// ── Règles islamiques à vérifier ─────────────────────────────

const EXPECTED = {
  surahCount: 114,
  ayahCount: 6236,
  atTawbahId: 9,           // At-Tawbah : pas de Bismillah
  meccanSurahs: 86,        // Nombre approximatif de sourates mecquoises
  medinanSurahs: 28,
  sajdaVersets: 15,        // 15 versets de prosternation dans le Coran
}

async function verifyQuran(): Promise<boolean> {
  section('Vérification — Coran')
  let allOk = true

  // 1. Nombre de sourates
  const surahCount = await prisma.quranSurah.count()
  if (surahCount === EXPECTED.surahCount) {
    success(`Sourates : ${surahCount}/114 ✓`)
  } else {
    error(`Sourates : ${surahCount}/114 — ATTENDU 114`)
    allOk = false
  }

  // 2. Nombre de versets
  const ayahCount = await prisma.quranAyah.count()
  if (ayahCount === EXPECTED.ayahCount) {
    success(`Versets : ${ayahCount}/6236 ✓`)
  } else {
    error(`Versets : ${ayahCount}/6236 — ATTENDU 6236`)
    allOk = false
  }

  // 3. Règle Bismillah — At-Tawbah (sourate 9) ne doit pas avoir Bismillah
  const atTawbah = await prisma.quranSurah.findUnique({ where: { id: 9 } })
  if (!atTawbah) {
    error('Sourate 9 (At-Tawbah) introuvable en base')
    allOk = false
  } else if (atTawbah.hasBismillah === false) {
    success('At-Tawbah (9) : hasBismillah = false ✓')
  } else {
    error('At-Tawbah (9) : hasBismillah = true — ERREUR CRITIQUE')
    allOk = false
  }

  // 4. Toutes les autres sourates ont Bismillah
  const wrongBismillah = await prisma.quranSurah.count({
    where: { hasBismillah: false, id: { not: 9 } }
  })
  if (wrongBismillah === 0) {
    success('Toutes les sourates (sauf 9) ont hasBismillah = true ✓')
  } else {
    error(`${wrongBismillah} sourate(s) sans Bismillah incorrectes`)
    allOk = false
  }

  // 5. Textes arabes non vides
  const emptyTexts = await prisma.quranAyah.count({
    where: { textUthmani: '' }
  })
  if (emptyTexts === 0) {
    success('Aucun verset avec texte arabe vide ✓')
  } else {
    error(`${emptyTexts} verset(s) avec textUthmani vide — CRITIQUE`)
    allOk = false
  }

  // 6. Versets de sajda
  const sajdaCount = await prisma.quranAyah.count({ where: { sajda: true } })
  if (sajdaCount === EXPECTED.sajdaVersets) {
    success(`Versets de sajda : ${sajdaCount}/15 ✓`)
  } else {
    warn(`Versets de sajda : ${sajdaCount} (attendu 15) — à vérifier`)
  }

  // 7. Cohérence sourates/versets
  const surahsWithWrongCount = await prisma.quranSurah.findMany({
    where: {},
    include: { _count: { select: { ayahs: true } } },
  })
  const mismatches = surahsWithWrongCount.filter(
    s => s._count.ayahs !== s.ayahCount
  )
  if (mismatches.length === 0) {
    success('Cohérence ayahCount ↔ versets en base ✓')
  } else {
    error(`${mismatches.length} sourate(s) avec ayahCount incohérent :`)
    mismatches.forEach(s =>
      error(`  Sourate ${s.id} (${s.nameTransliteration}): ayahCount=${s.ayahCount} mais ${s._count.ayahs} en base`)
    )
    allOk = false
  }

  return allOk
}

async function verifyTranslations(): Promise<boolean> {
  section('Vérification — Traductions')
  let allOk = true

  const translations = await prisma.quranTranslation.groupBy({
    by: ['translatorKey'],
    _count: { id: true },
  })

  if (translations.length === 0) {
    warn('Aucune traduction en base — seed:quran complet requis')
    return true // Pas bloquant
  }

  for (const t of translations) {
    const count = t._count.id
    if (count === EXPECTED.ayahCount) {
      success(`${t.translatorKey} : ${count}/6236 ✓`)
    } else {
      warn(`${t.translatorKey} : ${count}/6236 (import partiel ?)`)
    }
  }

  return allOk
}

async function verifyHadiths(): Promise<void> {
  section('Vérification — Hadiths')

  const collections = await prisma.hadithCollection.findMany({
    include: { _count: { select: { hadiths: true } } }
  } as any)

  if (!(collections as any[]).length) {
    warn('Aucune collection de hadiths — seed:hadiths requis')
    return
  }

  for (const c of collections as any[]) {
    success(`${c.nameFrench} : ${c._count.hadiths} hadiths`)
  }

  const emptyArabic = await prisma.hadith.count({ where: { textArabic: '' } })
  if (emptyArabic === 0) {
    success('Aucun hadith avec textArabic vide ✓')
  } else {
    error(`${emptyArabic} hadith(s) avec textArabic vide — CRITIQUE`)
  }
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  section('🔍 VÉRIFICATION INTÉGRITÉ — Saas-islam')

  try {
    await prisma.$connect()
    success('Connexion PostgreSQL établie')
  } catch (e) {
    error(`Impossible de se connecter : ${e}`)
    process.exit(1)
  }

  const quranOk = await verifyQuran()
  const translationsOk = await verifyTranslations()
  await verifyHadiths()

  section(quranOk && translationsOk ? '✅ INTÉGRITÉ OK' : '❌ PROBLÈMES DÉTECTÉS')

  if (!quranOk || !translationsOk) {
    error('Des erreurs critiques ont été détectées. Vérifier les logs ci-dessus.')
    process.exit(1)
  } else {
    success('Toutes les vérifications passées — Zone sacrée intègre 🌙')
  }

  await prisma.$disconnect()
}

main().catch(e => {
  error(String(e))
  process.exit(1)
})
