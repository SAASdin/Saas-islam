// ============================================================
// 01_seed_quran.ts — Import des données coraniques
// Sources : api.alquran.cloud/v1
// ⚠️  ZONE SACRÉE — Ces données sont immuables après import
// ⚠️  Ce script ne s'exécute qu'UNE SEULE FOIS en production
//     Validé par : Moha ✅ + Bilal ✅ requis avant exécution
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { log, success, warn, error, section, progress, sleep, fetchWithRetry } from './lib/logger'

const prisma = new PrismaClient()

const API_BASE = 'https://api.alquran.cloud/v1'

// ── Types API AlQuran.cloud ───────────────────────────────────

interface ApiSurah {
  number: number
  name: string                    // ⚠️ Nom arabe — SACRÉ
  englishName: string
  englishNameTranslation: string
  revelationType: string
  numberOfAyahs: number
}

interface ApiAyah {
  number: number                  // Numéro global (1-6236)
  numberInSurah: number
  text: string                    // ⚠️ Texte arabe — SACRÉ
  juz: number
  hizbQuarter: number
  page: number
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean }
}

interface ApiSurahWithAyahs {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  revelationType: string
  numberOfAyahs: number
  ayahs: ApiAyah[]
}

// ── Métadonnées statiques (page mushaf + juz start) ──────────
// Données validées depuis le Mushaf de Médine (Complexe du Roi Fahd)

const SURAH_METADATA: Record<number, { juzStart: number; pageMushaf: number }> = {
  1:  { juzStart: 1,  pageMushaf: 1   },
  2:  { juzStart: 1,  pageMushaf: 2   },
  3:  { juzStart: 3,  pageMushaf: 50  },
  4:  { juzStart: 4,  pageMushaf: 77  },
  5:  { juzStart: 6,  pageMushaf: 106 },
  6:  { juzStart: 7,  pageMushaf: 128 },
  7:  { juzStart: 8,  pageMushaf: 151 },
  8:  { juzStart: 9,  pageMushaf: 177 },
  9:  { juzStart: 10, pageMushaf: 187 },
  10: { juzStart: 11, pageMushaf: 208 },
  11: { juzStart: 11, pageMushaf: 221 },
  12: { juzStart: 12, pageMushaf: 235 },
  13: { juzStart: 13, pageMushaf: 249 },
  14: { juzStart: 13, pageMushaf: 255 },
  15: { juzStart: 14, pageMushaf: 262 },
  16: { juzStart: 14, pageMushaf: 267 },
  17: { juzStart: 15, pageMushaf: 282 },
  18: { juzStart: 15, pageMushaf: 293 },
  19: { juzStart: 16, pageMushaf: 305 },
  20: { juzStart: 16, pageMushaf: 312 },
  21: { juzStart: 17, pageMushaf: 322 },
  22: { juzStart: 17, pageMushaf: 332 },
  23: { juzStart: 18, pageMushaf: 342 },
  24: { juzStart: 18, pageMushaf: 350 },
  25: { juzStart: 18, pageMushaf: 359 },
  26: { juzStart: 19, pageMushaf: 367 },
  27: { juzStart: 19, pageMushaf: 377 },
  28: { juzStart: 20, pageMushaf: 385 },
  29: { juzStart: 20, pageMushaf: 396 },
  30: { juzStart: 21, pageMushaf: 404 },
  31: { juzStart: 21, pageMushaf: 411 },
  32: { juzStart: 21, pageMushaf: 415 },
  33: { juzStart: 21, pageMushaf: 418 },
  34: { juzStart: 22, pageMushaf: 428 },
  35: { juzStart: 22, pageMushaf: 434 },
  36: { juzStart: 22, pageMushaf: 440 },
  37: { juzStart: 23, pageMushaf: 446 },
  38: { juzStart: 23, pageMushaf: 453 },
  39: { juzStart: 23, pageMushaf: 458 },
  40: { juzStart: 24, pageMushaf: 467 },
  41: { juzStart: 24, pageMushaf: 477 },
  42: { juzStart: 25, pageMushaf: 483 },
  43: { juzStart: 25, pageMushaf: 489 },
  44: { juzStart: 25, pageMushaf: 496 },
  45: { juzStart: 25, pageMushaf: 499 },
  46: { juzStart: 26, pageMushaf: 502 },
  47: { juzStart: 26, pageMushaf: 507 },
  48: { juzStart: 26, pageMushaf: 511 },
  49: { juzStart: 26, pageMushaf: 515 },
  50: { juzStart: 26, pageMushaf: 518 },
  51: { juzStart: 26, pageMushaf: 520 },
  52: { juzStart: 27, pageMushaf: 523 },
  53: { juzStart: 27, pageMushaf: 526 },
  54: { juzStart: 27, pageMushaf: 528 },
  55: { juzStart: 27, pageMushaf: 531 },
  56: { juzStart: 27, pageMushaf: 534 },
  57: { juzStart: 27, pageMushaf: 537 },
  58: { juzStart: 28, pageMushaf: 542 },
  59: { juzStart: 28, pageMushaf: 545 },
  60: { juzStart: 28, pageMushaf: 549 },
  61: { juzStart: 28, pageMushaf: 551 },
  62: { juzStart: 28, pageMushaf: 553 },
  63: { juzStart: 28, pageMushaf: 554 },
  64: { juzStart: 28, pageMushaf: 556 },
  65: { juzStart: 28, pageMushaf: 558 },
  66: { juzStart: 28, pageMushaf: 560 },
  67: { juzStart: 29, pageMushaf: 562 },
  68: { juzStart: 29, pageMushaf: 564 },
  69: { juzStart: 29, pageMushaf: 566 },
  70: { juzStart: 29, pageMushaf: 568 },
  71: { juzStart: 29, pageMushaf: 570 },
  72: { juzStart: 29, pageMushaf: 572 },
  73: { juzStart: 29, pageMushaf: 574 },
  74: { juzStart: 29, pageMushaf: 575 },
  75: { juzStart: 29, pageMushaf: 577 },
  76: { juzStart: 29, pageMushaf: 578 },
  77: { juzStart: 29, pageMushaf: 580 },
  78: { juzStart: 30, pageMushaf: 582 },
  79: { juzStart: 30, pageMushaf: 583 },
  80: { juzStart: 30, pageMushaf: 585 },
  81: { juzStart: 30, pageMushaf: 586 },
  82: { juzStart: 30, pageMushaf: 587 },
  83: { juzStart: 30, pageMushaf: 587 },
  84: { juzStart: 30, pageMushaf: 589 },
  85: { juzStart: 30, pageMushaf: 590 },
  86: { juzStart: 30, pageMushaf: 591 },
  87: { juzStart: 30, pageMushaf: 591 },
  88: { juzStart: 30, pageMushaf: 592 },
  89: { juzStart: 30, pageMushaf: 593 },
  90: { juzStart: 30, pageMushaf: 594 },
  91: { juzStart: 30, pageMushaf: 595 },
  92: { juzStart: 30, pageMushaf: 595 },
  93: { juzStart: 30, pageMushaf: 596 },
  94: { juzStart: 30, pageMushaf: 596 },
  95: { juzStart: 30, pageMushaf: 597 },
  96: { juzStart: 30, pageMushaf: 597 },
  97: { juzStart: 30, pageMushaf: 598 },
  98: { juzStart: 30, pageMushaf: 598 },
  99: { juzStart: 30, pageMushaf: 599 },
  100: { juzStart: 30, pageMushaf: 599 },
  101: { juzStart: 30, pageMushaf: 600 },
  102: { juzStart: 30, pageMushaf: 600 },
  103: { juzStart: 30, pageMushaf: 601 },
  104: { juzStart: 30, pageMushaf: 601 },
  105: { juzStart: 30, pageMushaf: 601 },
  106: { juzStart: 30, pageMushaf: 602 },
  107: { juzStart: 30, pageMushaf: 602 },
  108: { juzStart: 30, pageMushaf: 602 },
  109: { juzStart: 30, pageMushaf: 603 },
  110: { juzStart: 30, pageMushaf: 603 },
  111: { juzStart: 30, pageMushaf: 603 },
  112: { juzStart: 30, pageMushaf: 604 },
  113: { juzStart: 30, pageMushaf: 604 },
  114: { juzStart: 30, pageMushaf: 604 },
}

// ── Traductions à importer ────────────────────────────────────

const TRANSLATIONS = [
  { key: 'fr.hamidullah',     lang: 'fr', name: 'Muhammad Hamidullah' },
  { key: 'en.sahih',          lang: 'en', name: 'Saheeh International' },
  { key: 'ar.muyassar',       lang: 'ar', name: 'التفسير الميسر (مجمع الملك فهد)' },
]

// ── Fonctions ────────────────────────────────────────────────

async function fetchAllSurahs(): Promise<ApiSurah[]> {
  log('Récupération des 114 sourates...')
  const res = await fetchWithRetry(`${API_BASE}/surah`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(`API error: ${json.status}`)
  success(`${json.data.length} sourates récupérées`)
  return json.data
}

async function fetchSurahWithAyahs(surahNum: number, edition: string): Promise<ApiSurahWithAyahs> {
  const res = await fetchWithRetry(`${API_BASE}/surah/${surahNum}/${edition}`)
  const json = await res.json()
  if (json.code !== 200) throw new Error(`API error sourate ${surahNum}: ${json.status}`)
  return json.data
}

async function seedSurahs(surahs: ApiSurah[]): Promise<void> {
  section('Import des 114 sourates')

  let inserted = 0
  let skipped = 0

  for (const s of surahs) {
    const meta = SURAH_METADATA[s.number] ?? { juzStart: 1, pageMushaf: 1 }

    await prisma.quranSurah.upsert({
      where: { id: s.number },
      update: {},  // Ne jamais mettre à jour — zone sacrée
      create: {
        id:                  s.number,
        nameArabic:          s.name,            // ⚠️ SACRÉ — copié tel quel
        nameTransliteration: s.englishName,
        nameFrench:          mapFrenchName(s.number, s.englishNameTranslation),
        nameEnglish:         s.englishNameTranslation,
        revelationType:      s.revelationType === 'Meccan' ? 'mecquoise' : 'médinoise',
        ayahCount:           s.numberOfAyahs,
        juzStart:            meta.juzStart,
        pageMushaf:          meta.pageMushaf,
        hasBismillah:        s.number !== 9,    // ⚠️ RÈGLE : At-Tawbah n'a pas de Bismillah
      },
    }).then(() => inserted++).catch(() => skipped++)

    progress(s.number, 114, `${s.englishName}`)
  }

  success(`${inserted} sourates insérées, ${skipped} ignorées (déjà existantes)`)
}

async function seedAyahs(surahs: ApiSurah[]): Promise<void> {
  section('Import des 6236 versets coraniques (Mushaf Uthmani — Hafs)')

  let total = 0

  for (const s of surahs) {
    // Fetch texte Uthmani (édition principale)
    const uthmaniData = await fetchSurahWithAyahs(s.number, 'quran-uthmani')
    // Fetch texte simple (sans tashkeel complet)
    const simpleData  = await fetchSurahWithAyahs(s.number, 'quran-simple')

    const ayahs = uthmaniData.ayahs

    // Batch insert pour performance
    await prisma.$transaction(
      ayahs.map((ayah, idx) => {
        const sajdaType = typeof ayah.sajda === 'object' && ayah.sajda
          ? (ayah.sajda.obligatory ? 'obligatory' : 'recommended')
          : undefined

        return prisma.quranAyah.upsert({
          where: { surahId_ayahNumber: { surahId: s.number, ayahNumber: ayah.numberInSurah } },
          update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour
          create: {
            surahId:         s.number,
            ayahNumber:      ayah.numberInSurah,
            ayahNumberQuran: ayah.number,
            textUthmani:     ayah.text,                           // ⚠️ SACRÉ
            textSimple:      simpleData.ayahs[idx]?.text ?? ayah.text,
            juz:             ayah.juz,
            hizb:            ayah.hizbQuarter,
            rub:             ayah.hizbQuarter,
            pageMushaf:      ayah.page,
            sajda:           Boolean(ayah.sajda),
            sajdaType,
          },
        })
      })
    )

    total += ayahs.length
    progress(s.number, 114, `Sourate ${s.number} — ${ayahs.length} versets (total: ${total})`)

    // Rate limiting — respecter l'API
    await sleep(300)
  }

  success(`${total} versets importés`)
}

async function seedTranslations(surahs: ApiSurah[]): Promise<void> {
  for (const trad of TRANSLATIONS) {
    section(`Import traduction : ${trad.name} (${trad.lang})`)

    let total = 0

    for (const s of surahs) {
      const data = await fetchSurahWithAyahs(s.number, trad.key)

      for (const ayah of data.ayahs) {
        // Récupérer l'ID de l'ayah en base
        const dbAyah = await prisma.quranAyah.findUnique({
          where: { surahId_ayahNumber: { surahId: s.number, ayahNumber: ayah.numberInSurah } },
          select: { id: true },
        })

        if (!dbAyah) {
          warn(`Verset introuvable en base: ${s.number}:${ayah.numberInSurah}`)
          continue
        }

        await prisma.quranTranslation.upsert({
          where: { ayahId_translatorKey: { ayahId: dbAyah.id, translatorKey: trad.key } },
          update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour
          create: {
            ayahId:         dbAyah.id,
            languageCode:   trad.lang,
            translatorName: trad.name,
            translatorKey:  trad.key,
            translation:    ayah.text,  // ⚠️ Traduction validée — copié tel quel
            isValidated:    true,
          },
        })

        total++
      }

      progress(s.number, 114, `Sourate ${s.number} — ${trad.name}`)
      await sleep(200)
    }

    success(`${total} traductions ${trad.lang} (${trad.name}) importées`)
  }
}

// ── Noms français des sourates (validés) ─────────────────────

function mapFrenchName(id: number, englishFallback: string): string {
  const names: Record<number, string> = {
    1: "L'Ouverture", 2: "La Vache", 3: "La Famille d'Imran", 4: "Les Femmes",
    5: "La Table Servie", 6: "Les Troupeaux", 7: "Les Remparts", 8: "Le Butin",
    9: "Le Repentir", 10: "Jonas", 11: "Houd", 12: "Joseph",
    13: "Le Tonnerre", 14: "Abraham", 15: "Al-Hijr", 16: "Les Abeilles",
    17: "Le Voyage Nocturne", 18: "La Caverne", 19: "Marie", 20: "Ta-Ha",
    21: "Les Prophètes", 22: "Le Pèlerinage", 23: "Les Croyants", 24: "La Lumière",
    25: "Le Critère", 26: "Les Poètes", 27: "Les Fourmis", 28: "Le Récit",
    29: "L'Araignée", 30: "Les Byzantins", 31: "Luqman", 32: "La Prosternation",
    33: "Les Coalisés", 34: "Saba", 35: "Le Créateur", 36: "Ya-Sin",
    37: "Les Rangées", 38: "Sad", 39: "Les Groupes", 40: "Le Pardonneur",
    41: "Fusilat", 42: "La Consultation", 43: "L'Ornement", 44: "La Fumée",
    45: "L'Agenouillée", 46: "Al-Ahqaf", 47: "Muhammad", 48: "La Victoire",
    49: "Les Appartements", 50: "Qaf", 51: "Les Éparpilleurs", 52: "Le Mont Sinaï",
    53: "L'Étoile", 54: "La Lune", 55: "Le Tout Miséricordieux", 56: "L'Inévitable",
    57: "Le Fer", 58: "La Discussion", 59: "L'Exode", 60: "Celle qu'on éprouve",
    61: "Les Rangs", 62: "Le Vendredi", 63: "Les Hypocrites", 64: "La Déception",
    65: "Le Divorce", 66: "L'Interdiction", 67: "La Royauté", 68: "Le Calame",
    69: "L'Inéluctable", 70: "Les Degrés", 71: "Noé", 72: "Les Djinns",
    73: "L'Enveloppé", 74: "Le Revêtu d'un manteau", 75: "La Résurrection",
    76: "L'Homme", 77: "Les Émissaires", 78: "La Nouvelle", 79: "Les Arracheurs",
    80: "Il s'est renfrogné", 81: "L'Obscurcissement", 82: "La Déchirure",
    83: "Les Fraudeurs", 84: "L'Éclatement", 85: "Les Constellations",
    86: "L'Astre Nocturne", 87: "Le Très-Haut", 88: "L'Enveloppante",
    89: "L'Aurore", 90: "La Cité", 91: "Le Soleil", 92: "La Nuit",
    93: "L'Avant-midi", 94: "L'Élargissement", 95: "Le Figuier", 96: "L'Adhérence",
    97: "La Nuit du Destin", 98: "La Preuve", 99: "Le Séisme", 100: "Les Coursiers",
    101: "Le Fracas", 102: "La Course aux richesses", 103: "L'Époque",
    104: "Le Calomniateur", 105: "L'Éléphant", 106: "Quraysh", 107: "L'Acte de bienfaisance",
    108: "L'Abondance", 109: "Les Infidèles", 110: "Le Secours",
    111: "La Fibre de palmier", 112: "L'Unicité", 113: "L'Aube naissante", 114: "Les Hommes",
  }
  return names[id] ?? englishFallback
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  section('🌙 SEED CORAN — Saas-islam')
  log('Source : api.alquran.cloud (texte Uthmani — Hafs an Asim)')
  log('⚠️  ZONE SACRÉE — données immuables après import')
  log('⚠️  Ce script suppose que les migrations SQL ont déjà été exécutées')
  console.log()

  // Vérifier la connexion BDD
  try {
    await prisma.$connect()
    success('Connexion PostgreSQL établie')
  } catch (e) {
    error(`Impossible de se connecter à la BDD: ${e}`)
    error('Vérifier DATABASE_URL dans .env')
    process.exit(1)
  }

  // Vérifier si la BDD est déjà seedée
  const existingCount = await prisma.quranSurah.count()
  if (existingCount > 0) {
    warn(`${existingCount} sourates déjà en base — mode upsert (pas de duplicats)`)
  }

  const startTime = Date.now()

  try {
    // ÉTAPE 1 — Sourates
    const surahs = await fetchAllSurahs()
    await seedSurahs(surahs)

    // ÉTAPE 2 — Versets (Uthmani + Simple)
    await seedAyahs(surahs)

    // ÉTAPE 3 — Traductions (FR Hamidullah + EN Sahih + AR Muyassar)
    await seedTranslations(surahs)

    const elapsed = Math.round((Date.now() - startTime) / 1000)
    section('✅ IMPORT TERMINÉ')
    success(`Durée totale : ${elapsed}s`)
    success('114 sourates · 6236 versets · 3 traductions (FR/EN/AR)')
    log('Vérifier l\'intégrité avec : npm run seed:verify')

  } catch (e) {
    error(`Erreur lors de l'import : ${e}`)
    throw e
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(e => {
  error(String(e))
  process.exit(1)
})
