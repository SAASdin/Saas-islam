// ============================================================
// hadiths/random/page.tsx — Hadith Aléatoire
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//     Font arabe : var(--font-amiri)
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import {
  getRandomHadith,
  getCollectionMeta,
  getHadithByLang,
  parseArabicBody,
  stripHadithTags,
  getGradeBadgeStyle,
  formatSunnahRef,
} from '@/lib/sunnah-api'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hadith Aléatoire — NoorApp',
  description: 'Découvrez un hadith aléatoire parmi 18 grandes collections.',
}

export default async function RandomHadithPage() {
  const hadithDetail = await getRandomHadith()
  if (!hadithDetail) notFound()

  const collection = hadithDetail.collection
  const hadithNumber = hadithDetail.hadithNumber

  const meta = getCollectionMeta(collection)
  const arHadith = getHadithByLang(hadithDetail, 'ar')
  const enHadith = getHadithByLang(hadithDetail, 'en')

  if (!arHadith && !enHadith) notFound()

  const arParsed = arHadith ? parseArabicBody(arHadith.body) : null
  const enBody = enHadith?.body ?? ''

  const gradeEn = enHadith?.grades?.[0]?.grade ?? ''
  const gradeAr = arHadith?.grades?.[0]?.grade ?? ''
  const grade = gradeEn || gradeAr
  const gradeStyle = getGradeBadgeStyle(grade)

  const ref = formatSunnahRef(collection, hadithNumber)
  const collectionNameEn = meta?.nameEn ?? collection
  const chapterTitle = enHadith?.chapterTitle ?? arHadith?.chapterTitle ?? ''

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête ───────────────────────────────────────────── */}
      <div
        className="py-8 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href="/hadiths"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-5"
          >
            ← Collections
          </Link>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎲</span>
                <h1 className="text-xl font-bold text-slate-100">Hadith Aléatoire</h1>
              </div>
              <p className="text-sm text-slate-500">
                {collectionNameEn} · n° {hadithNumber}
              </p>
              {chapterTitle && (
                <p className="text-xs text-slate-600 mt-1 max-w-sm">{chapterTitle}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {grade && (
                <span
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={gradeStyle}
                >
                  {grade}
                </span>
              )}
              {/* Nom arabe de la collection — ⚠️ SACRÉ */}
              {meta && (
                <p
                  dir="rtl"
                  lang="ar"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    fontSize: '1.1rem',
                    lineHeight: '1.8',
                    color: '#d4af37',
                  }}
                >
                  {/* ⚠️ Affiché tel quel */}
                  {meta.nameAr}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ── Carte hadith ──────────────────────────────────────── */}
        <article
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(17,24,39,0.8)',
          }}
          aria-label={ref}
        >
          {/* Header de la carte */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8962a 100%)',
                  color: '#0a0f1e',
                }}
              >
                {hadithNumber}
              </span>
              <div>
                <p className="font-semibold text-slate-100 text-sm">{collectionNameEn}</p>
                {meta && <p className="text-xs text-slate-500">{meta.nameFr}</p>}
              </div>
            </div>

            {grade && (
              <span
                className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={gradeStyle}
              >
                {grade}
              </span>
            )}
          </div>

          {/* ── Texte arabe ──────────────────────────────────── */}
          {/*
            ⚠️  ZONE SACRÉE ABSOLUE
            - dir="rtl" lang="ar" OBLIGATOIRES
            - Le texte arabe est affiché sans AUCUNE transformation
          */}
          {arHadith && arParsed && (
            <div
              className="px-6 py-10"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.03) 0%, rgba(21,128,61,0.02) 100%)',
              }}
            >
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#d4af37', opacity: 0.5 }}>
                النص العربي
              </p>

              {arParsed.prematn || arParsed.matn ? (
                <div dir="rtl" lang="ar" style={{ fontFamily: 'var(--font-amiri)', direction: 'rtl', textAlign: 'right' }}>
                  {/* Sanad — ⚠️ SACRÉ */}
                  {arParsed.prematn && (
                    <p
                      className="mb-4 leading-loose"
                      style={{ fontSize: '1.25rem', lineHeight: '2.5rem', color: '#94a3b8' }}
                    >
                      {/* ⚠️ Texte sacré — affiché tel quel */}
                      {arParsed.prematn}
                    </p>
                  )}
                  {/* Matn — ⚠️ SACRÉ */}
                  {arParsed.matn && (
                    <p
                      className="leading-loose"
                      style={{ fontSize: '1.5rem', lineHeight: '3rem', color: '#f1f5f9' }}
                    >
                      {/* ⚠️ Texte sacré — affiché tel quel */}
                      {arParsed.matn}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  dir="rtl"
                  lang="ar"
                  style={{
                    fontFamily: 'var(--font-amiri)',
                    fontSize: '1.5rem',
                    lineHeight: '3rem',
                    color: '#f1f5f9',
                    direction: 'rtl',
                    textAlign: 'right',
                  }}
                >
                  {/* ⚠️ Texte sacré — affiché tel quel */}
                  {stripHadithTags(arHadith.body)}
                </div>
              )}
            </div>
          )}

          {/* ── Texte anglais ─────────────────────────────── */}
          {enBody && (
            <div
              className="px-6 py-7"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-4 text-slate-600">
                English Translation
              </p>
              <div
                className="text-sm text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: enBody }}
                style={{ lineHeight: '1.8' }}
              />
            </div>
          )}

          {/* ── Référence ─────────────────────────────────── */}
          <div
            className="px-6 py-5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(10,15,30,0.4)',
            }}
          >
            <p className="text-xs text-slate-600 mb-1 uppercase tracking-wider">Référence</p>
            <p className="font-semibold text-slate-200 text-sm">{ref}</p>
            {meta && (
              <p
                dir="rtl"
                lang="ar"
                className="text-xs text-slate-500 mt-1"
                style={{ fontFamily: 'var(--font-amiri)', lineHeight: '1.8' }}
              >
                {/* ⚠️ Nom collection en arabe — SACRÉ */}
                {meta.nameAr}، رقم {hadithNumber}
              </p>
            )}
          </div>

          {/* ── Actions ───────────────────────────────────── */}
          <div
            className="px-6 py-4 flex items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            {/* Voir en détail */}
            <Link
              href={`/hadiths/${collection}/${hadithNumber}`}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.15)',
                color: '#d4af37',
              }}
            >
              📖 Voir détail complet
            </Link>

            {/* Autre hadith — recharge la page */}
            <a
              href="/hadiths/random"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              🎲 Autre hadith
            </a>
          </div>
        </article>

        <footer className="mt-10 text-center text-xs text-slate-700 space-y-1">
          <p>Source : sunnah.com API · Données en lecture seule</p>
          <p>Pour toute question de jurisprudence, consultez un savant qualifié.</p>
        </footer>
      </div>
    </div>
  )
}
