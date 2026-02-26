// ============================================================
// 02_seed_hadiths.ts — Import des collections de hadiths
// Source : cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
// ⚠️  ZONE SACRÉE — texte arabe immuable après import
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { log, success, warn, error, section, progress, sleep, fetchWithRetry } from './lib/logger'

const prisma = new PrismaClient()

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions'

// ── Collections à importer ───────────────────────────────────

const COLLECTIONS = [
  {
    slug: 'bukhari',
    cdnKey: 'ara-bukharibukhari',
    nameArabic: 'صحيح البخاري',
    nameFrench: 'Sahih al-Bukhari',
    nameEnglish: 'Sahih al-Bukhari',
    author: 'Muhammad ibn Ismail al-Bukhari',
    period: '194-256 AH',
    isAuthenticated: true,
    grade: 'sahih',
  },
  {
    slug: 'muslim',
    cdnKey: 'ara-muslimmuslim',
    nameArabic: 'صحيح مسلم',
    nameFrench: 'Sahih Muslim',
    nameEnglish: 'Sahih Muslim',
    author: 'Muslim ibn al-Hajjaj',
    period: '202-261 AH',
    isAuthenticated: true,
    grade: 'sahih',
  },
  {
    slug: 'abudawud',
    cdnKey: 'ara-abudawudabudawud',
    nameArabic: 'سنن أبي داود',
    nameFrench: 'Sunan Abu Dawud',
    nameEnglish: 'Sunan Abu Dawud',
    author: 'Abu Dawud al-Sijistani',
    period: '202-275 AH',
    isAuthenticated: false,
    grade: 'sunan',
  },
  {
    slug: 'tirmidhi',
    cdnKey: 'ara-tirmidhitirmidhi',
    nameArabic: 'جامع الترمذي',
    nameFrench: "Jami' al-Tirmidhi",
    nameEnglish: "Jami' al-Tirmidhi",
    author: 'Muhammad ibn Isa al-Tirmidhi',
    period: '209-279 AH',
    isAuthenticated: false,
    grade: 'sunan',
  },
  {
    slug: 'nasai',
    cdnKey: 'ara-nasainasai',
    nameArabic: "سنن النسائي",
    nameFrench: "Sunan an-Nasa'i",
    nameEnglish: "Sunan an-Nasa'i",
    author: "Ahmad ibn Shu'ayb al-Nasai",
    period: '215-303 AH',
    isAuthenticated: false,
    grade: 'sunan',
  },
  {
    slug: 'ibnmajah',
    cdnKey: 'ara-ibnmajahibnmajah',
    nameArabic: 'سنن ابن ماجه',
    nameFrench: 'Sunan Ibn Majah',
    nameEnglish: 'Sunan Ibn Majah',
    author: 'Muhammad ibn Yazid Ibn Majah',
    period: '209-273 AH',
    isAuthenticated: false,
    grade: 'sunan',
  },
  {
    slug: 'malik',
    cdnKey: 'ara-malikmuwatta',
    nameArabic: 'موطأ مالك',
    nameFrench: 'Muwatta Malik',
    nameEnglish: 'Muwatta Malik',
    author: 'Malik ibn Anas',
    period: '93-179 AH',
    isAuthenticated: false,
    grade: 'muwatta',
  },
  {
    slug: 'riyadussalihin',
    cdnKey: 'ara-nawawi40',
    nameArabic: 'رياض الصالحين',
    nameFrench: 'Riyadh al-Salihin',
    nameEnglish: 'Riyadh al-Salihin',
    author: 'Yahya ibn Sharaf al-Nawawi',
    period: '631-676 AH',
    isAuthenticated: false,
    grade: 'selection',
  },
]

// ── Types ────────────────────────────────────────────────────

interface CdnHadith {
  hadithnumber: number
  text: string   // ⚠️ Texte arabe — SACRÉ
}

interface CdnResponse {
  hadiths: CdnHadith[]
}

// ── Fonctions ────────────────────────────────────────────────

async function fetchCollectionFromCDN(cdnKey: string): Promise<CdnHadith[]> {
  const url = `${CDN_BASE}/${cdnKey}.json`
  log(`Fetch : ${url}`)

  const res = await fetchWithRetry(url, 3, 2000)
  const json: CdnResponse = await res.json()

  if (!json.hadiths || !Array.isArray(json.hadiths)) {
    throw new Error(`Format inattendu pour ${cdnKey}`)
  }

  return json.hadiths
}

async function seedCollection(collection: typeof COLLECTIONS[0]): Promise<void> {
  section(`Import : ${collection.nameFrench}`)

  // 1. Créer/récupérer la collection en BDD
  const dbCollection = await prisma.hadithCollection.upsert({
    where: { collectionKey: collection.slug } as any,
    update: {},
    create: {
      nameArabic:  collection.nameArabic,   // ⚠️ Nom arabe — SACRÉ
      nameFrench:  collection.nameFrench,
      nameEnglish: collection.nameEnglish,
      author:      collection.author,
      period:      collection.period,
      slug:        collection.slug,
    } as any,
  })

  log(`Collection ID: ${dbCollection.id}`)

  // 2. Fetch les hadiths depuis le CDN
  let hadiths: CdnHadith[]
  try {
    hadiths = await fetchCollectionFromCDN(collection.cdnKey)
  } catch (e) {
    warn(`CDN indisponible pour ${collection.slug} — tentative API alternative...`)
    // Fallback : api.hadith.gading.dev
    hadiths = await fetchFromGadingApi(collection.slug)
  }

  if (!hadiths.length) {
    warn(`Aucun hadith récupéré pour ${collection.slug}`)
    return
  }

  log(`${hadiths.length} hadiths à importer...`)

  // 3. Batch insert (chunks de 100 pour éviter les timeouts)
  const CHUNK_SIZE = 100
  let total = 0

  for (let i = 0; i < hadiths.length; i += CHUNK_SIZE) {
    const chunk = hadiths.slice(i, i + CHUNK_SIZE)

    await prisma.$transaction(
      chunk.map(h => prisma.hadith.upsert({
        where: {
          collectionId_hadithNumber: {
            collectionId: dbCollection.id,
            hadithNumber: String(h.hadithnumber),
          }
        },
        update: {},  // ⚠️ ZONE SACRÉE — jamais mettre à jour le texte
        create: {
          collectionId: dbCollection.id,
          hadithNumber: String(h.hadithnumber),
          textArabic:   h.text,   // ⚠️ SACRÉ — copié tel quel, jamais modifié
          reference:    `${collection.nameFrench}, n° ${h.hadithnumber}`,
          grade:        collection.grade,
        },
      }))
    )

    total += chunk.length
    progress(
      Math.min(i + CHUNK_SIZE, hadiths.length),
      hadiths.length,
      `${collection.nameFrench} — ${total}/${hadiths.length}`
    )

    await sleep(100)
  }

  success(`${total} hadiths de ${collection.nameFrench} importés`)
}

async function fetchFromGadingApi(bookId: string): Promise<CdnHadith[]> {
  const results: CdnHadith[] = []
  let page = 1
  const limit = 100

  while (true) {
    try {
      const res = await fetchWithRetry(
        `https://api.hadith.gading.dev/books/${bookId}?range=${(page-1)*limit+1}-${page*limit}`
      )
      const json = await res.json()

      if (!json.data?.hadiths?.length) break

      for (const h of json.data.hadiths) {
        results.push({ hadithnumber: h.number, text: h.arab })
      }

      if (json.data.hadiths.length < limit) break
      page++
      await sleep(500)
    } catch {
      break
    }
  }

  return results
}

// ── Main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  section('🌙 SEED HADITHS — Saas-islam')
  log('Source : CDN fawazahmed0/hadith-api (texte arabe)')
  log('⚠️  ZONE SACRÉE — texte arabe immuable après import')
  console.log()

  try {
    await prisma.$connect()
    success('Connexion PostgreSQL établie')
  } catch (e) {
    error(`Impossible de se connecter à la BDD: ${e}`)
    process.exit(1)
  }

  const startTime = Date.now()

  for (const collection of COLLECTIONS) {
    try {
      await seedCollection(collection)
    } catch (e) {
      error(`Erreur pour ${collection.slug}: ${e}`)
      warn('Passage à la collection suivante...')
    }
    await sleep(1000) // Pause entre les collections
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  section('✅ IMPORT HADITHS TERMINÉ')
  success(`Durée totale : ${elapsed}s`)
  success(`${COLLECTIONS.length} collections importées`)

  await prisma.$disconnect()
}

main().catch(e => {
  error(String(e))
  process.exit(1)
})
