// ============================================================
// hadiths/page.tsx — Accueil Hadiths — Clone sunnah.com
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//     Font arabe : var(--font-amiri)
// ============================================================

import Link from 'next/link'
import {
  getRandomHadith,
  getCollectionMeta,
  getHadithByLang,
  stripHadithTags,
  getGradeBadgeStyle,
  SUNNAH_COLLECTIONS,
} from '@/lib/sunnah-api'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hadiths — Collections — NoorApp',
  description:
    'Consultez les 18 grandes collections de hadiths : Bukhari, Muslim, Nasa\'i, Abu Dawud, Tirmidhi, Ibn Majah et plus.',
}

const PRIMARY_COLORS = [
  '#22c55e', // bukhari → vert
  '#60a5fa', // muslim → bleu
  '#fbbf24', // nasai → ambre
  '#fb923c', // abudawud → orange
  '#a78bfa', // tirmidhi → violet
  '#f472b6', // ibnmajah → rose
]

export default async function HadithsPage() {
  const randomHadith = await getRandomHadith()

  const primaryCollections = SUNNAH_COLLECTIONS.filter((c) => c.isPrimary)
  const secondaryCollections = SUNNAH_COLLECTIONS.filter((c) => !c.isPrimary)

  const totalHadiths = SUNNAH_COLLECTIONS.reduce((s, c) => s + c.totalHadith, 0)

  // Extraire les données du hadith aléatoire
  let hadithArBody = ''
  let hadithEnBody = ''
  let hadithGrade = ''
  let hadithCollectionId = ''
  let hadithNumber = ''
  let hadithCollectionMeta = null

  if (randomHadith) {
    hadithCollectionId = randomHadith.collection
    hadithNumber = randomHadith.hadithNumber
    hadithCollectionMeta = getCollectionMeta(hadithCollectionId)

    const arHadith = getHadithByLang(randomHadith, 'ar')
    const enHadith = getHadithByLang(randomHadith, 'en')

    if (arHadith) {
      hadithArBody = stripHadithTags(arHadith.body)
      hadithGrade = arHadith.grades?.[0]?.grade ?? ''
    }
    if (enHadith) {
      hadithEnBody = stripHadithTags(enHadith.body)
      if (!hadithGrade) hadithGrade = enHadith.grades?.[0]?.grade ?? ''
    }
  }

  const gradeStyle = getGradeBadgeStyle(hadithGrade)

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>


      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-14 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #0a0f1e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(212,175,55,0.04) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(34,197,94,0.03) 0%, transparent 40%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Titre arabe — ⚠️ SACRÉ */}
          <p
            dir="rtl"
            lang="ar"
            className="text-3xl md:text-4xl mb-3"
            style={{
              fontFamily: 'var(--font-amiri)',
              color: '#d4af37',
              lineHeight: '2',
              textShadow: '0 0 30px rgba(212,175,55,0.3)',
            }}
          >
            {/* ⚠️ Texte sacré — jamais modifier */}
            الأحاديث النبوية الشريفة
          </p>

          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Hadiths du Prophète ﷺ
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            18 collections · {totalHadiths.toLocaleString('fr-FR')} hadiths
          </p>

          {/* Boutons d'action */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
            <Link
              href="/hadiths/random"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.08) 100%)',
                border: '1px solid rgba(212,175,55,0.25)',
                color: '#d4af37',
              }}
            >
              🎲 Hadith aléatoire
            </Link>
            <Link
              href="/hadiths/search"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              🔍 Rechercher un hadith
            </Link>
          </div>

          {/* Barre de recherche rapide */}
          <form action="/hadiths/search" method="GET" className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Rechercher dans les hadiths..."
                className="w-full px-5 py-3 pr-12 rounded-xl text-sm text-slate-200 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                aria-label="Rechercher"
              >
                🔍
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── Hadith du Jour ─────────────────────────────────────── */}
      {randomHadith && (
        <section className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-0.5 rounded" style={{ background: '#d4af37' }} />
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: '#d4af37' }}>
              Hadith du Jour
            </h2>
            <div className="flex-1 h-0.5 rounded" style={{ background: 'rgba(212,175,55,0.1)' }} />
          </div>

          <article
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(17,24,39,0.8)',
              border: '1px solid rgba(212,175,55,0.12)',
              boxShadow: '0 0 40px rgba(212,175,55,0.04)',
            }}
          >
            {/* Header de la carte */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(212,175,55,0.1)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.2)' }}
                >
                  {hadithNumber}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {hadithCollectionMeta?.nameEn ?? hadithCollectionId}
                  </p>
                  <p className="text-xs text-slate-500">{hadithCollectionMeta?.nameFr ?? ''}</p>
                </div>
              </div>
              {hadithGrade && (
                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-medium"
                  style={gradeStyle}
                >
                  {hadithGrade}
                </span>
              )}
            </div>

            {/* Texte arabe — ⚠️ ZONE SACRÉE */}
            <div
              className="px-6 py-8"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.02) 0%, transparent 100%)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#d4af37', opacity: 0.5 }}>
                النص العربي
              </p>
              <div
                dir="rtl"
                lang="ar"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  fontSize: '1.5rem',
                  lineHeight: '2.8rem',
                  color: '#f1f5f9',
                  direction: 'rtl',
                  textAlign: 'right',
                }}
              >
                {/* ⚠️ Texte sacré — affiché tel quel sans transformation */}
                {hadithArBody}
              </div>
            </div>

            {/* Texte anglais */}
            {hadithEnBody && (
              <div
                className="px-6 py-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
              >
                <p className="text-xs uppercase tracking-widest mb-3 text-slate-600">Translation</p>
                <div
                  className="text-sm text-slate-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: hadithEnBody }}
                />
              </div>
            )}

            {/* Footer de la carte */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(10,15,30,0.4)' }}
            >
              <p className="text-xs text-slate-600">
                {hadithCollectionMeta?.nameEn} · No. {hadithNumber}
              </p>
              <Link
                href={`/hadiths/${hadithCollectionId}/${hadithNumber}`}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{ color: '#d4af37', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                Lire en entier →
              </Link>
            </div>
          </article>
        </section>
      )}

      {/* ── Primary Collections (Kutub as-Sittah) ───────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-0.5 rounded" style={{ background: '#d4af37' }} />
          <div>
            <h2 className="text-base font-bold text-slate-100">Collections Primaires</h2>
            <p className="text-xs text-slate-500">Kutub as-Sittah — Les Six Livres Canoniques</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {primaryCollections.map((col, i) => {
            const color = PRIMARY_COLORS[i] ?? '#d4af37'
            return (
              <Link
                key={col.id}
                href={`/hadiths/${col.id}`}
                className="group relative p-5 rounded-2xl transition-all duration-300"
                style={{
                  background: 'rgba(17,24,39,0.8)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${color}08 0%, transparent 60%)` }}
                />

                {/* Numéro de rang */}
                <span
                  className="absolute top-4 right-4 text-xs font-bold opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ color }}
                >
                  #{i + 1}
                </span>

                <div className="relative">
                  {/* Nom arabe — ⚠️ SACRÉ */}
                  <p
                    dir="rtl"
                    lang="ar"
                    className="text-xl mb-2"
                    style={{ fontFamily: 'var(--font-amiri)', color, lineHeight: '1.8' }}
                  >
                    {/* ⚠️ Affiché tel quel */}
                    {col.nameAr}
                  </p>

                  <p className="font-semibold text-slate-100 text-sm group-hover:text-white transition-colors">
                    {col.nameEn}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{col.authorEn}</p>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs font-medium" style={{ color }}>
                      {col.totalHadith.toLocaleString('fr-FR')} hadiths
                    </span>
                    <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
                      Explorer →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── Secondary Collections ────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-0.5 rounded" style={{ background: 'rgba(212,175,55,0.4)' }} />
          <div>
            <h2 className="text-base font-bold text-slate-100">Collections Secondaires</h2>
            <p className="text-xs text-slate-500">Autres œuvres majeures de la Sunna</p>
          </div>
        </div>

        <div className="grid gap-3">
          {secondaryCollections.map((col) => (
            <Link
              key={col.id}
              href={`/hadiths/${col.id}`}
              className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(17,24,39,0.6)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-200 text-sm group-hover:text-white transition-colors">
                  {col.nameEn}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{col.authorEn}</p>
              </div>

              {/* Nom arabe — ⚠️ SACRÉ */}
              <div
                dir="rtl"
                lang="ar"
                className="hidden sm:block flex-shrink-0 text-right"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  fontSize: '1.1rem',
                  lineHeight: '2',
                  color: '#94a3b8',
                }}
              >
                {/* ⚠️ Affiché tel quel */}
                {col.nameAr}
              </div>

              <span className="flex-shrink-0 text-xs text-slate-600">
                {col.totalHadith.toLocaleString('fr-FR')} ·
              </span>
              <span className="flex-shrink-0 text-xs text-slate-600 group-hover:text-amber-400 transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer
        className="text-center py-8 text-xs text-slate-600 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p>Source : sunnah.com API · Données en lecture seule</p>
        <p className="mt-1" style={{ color: 'rgba(34,197,94,0.4)' }}>بارك الله فيكم</p>
      </footer>
    </div>
  )
}
