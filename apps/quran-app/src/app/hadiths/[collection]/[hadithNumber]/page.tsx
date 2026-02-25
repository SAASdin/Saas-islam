// ============================================================
// hadiths/[collection]/[hadithNumber]/page.tsx — Hadith Détail
// ⚠️  RÈGLES ABSOLUES :
//   - Texte arabe : JAMAIS toucher — dir="rtl" lang="ar" OBLIGATOIRES
//   - Font arabe : var(--font-amiri) — jamais Arial
//   - [prematn] → sanad (gris) | [matn] → texte principal (blanc)
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/Navigation'
import {
  getCollectionMeta,
  getHadith,
  getHadithByLang,
  parseArabicBody,
  stripHadithTags,
  getGradeBadgeStyle,
  formatSunnahRef,
} from '@/lib/sunnah-api'
import HadithActions from './HadithActions'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ collection: string; hadithNumber: string }>
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection, hadithNumber } = await params
  const meta = getCollectionMeta(collection)
  if (!meta) return {}
  return {
    title: `${meta.nameEn} — Hadith ${hadithNumber} — NoorApp`,
    description: `Hadith n° ${hadithNumber} de ${meta.nameEn} avec texte arabe et traduction anglaise.`,
  }
}

export default async function HadithPage({ params }: Props) {
  const { collection, hadithNumber } = await params

  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const hadithDetail = await getHadith(collection, hadithNumber)
  if (!hadithDetail) notFound()

  const arHadith = getHadithByLang(hadithDetail, 'ar')
  const enHadith = getHadithByLang(hadithDetail, 'en')

  if (!arHadith && !enHadith) notFound()

  // Parse du corps arabe
  const arParsed = arHadith ? parseArabicBody(arHadith.body) : null

  // Grade — priorité au grade anglais
  const gradeEn = enHadith?.grades?.[0]?.grade ?? ''
  const gradeAr = arHadith?.grades?.[0]?.grade ?? ''
  const grade = gradeEn || gradeAr
  const gradeStyle = getGradeBadgeStyle(grade)

  // Référence
  const ref = formatSunnahRef(collection, hadithNumber)

  // Navigation prev / next (approximatif — basé sur le numéro)
  const num = parseInt(hadithNumber)
  const prevNum = num > 1 ? String(num - 1) : null
  const nextNum = num < meta.totalHadith ? String(num + 1) : null

  // Titre de chapitre
  const chapterTitle = enHadith?.chapterTitle ?? arHadith?.chapterTitle ?? ''

  // Texte anglais brut (HTML)
  const enBody = enHadith?.body ?? ''

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
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-2 text-xs text-slate-600 mb-5 flex-wrap">
            <Link href="/hadiths" className="hover:text-amber-400 transition-colors">
              Hadiths
            </Link>
            <span>›</span>
            <Link href={`/hadiths/${collection}`} className="hover:text-amber-400 transition-colors">
              {meta.nameEn}
            </Link>
            <span>›</span>
            <span className="text-slate-400">Hadith {hadithNumber}</span>
          </nav>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-slate-100 mb-1">
                Hadith n° {hadithNumber}
              </h1>
              <p className="text-sm text-slate-500">{meta.nameEn}</p>
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
              <p
                dir="rtl"
                lang="ar"
                style={{
                  fontFamily: 'var(--font-amiri)',
                  fontSize: '1.2rem',
                  lineHeight: '1.8',
                  color: '#d4af37',
                }}
              >
                {/* ⚠️ Affiché tel quel */}
                {meta.nameAr}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ── Carte principale ──────────────────────────────────── */}
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
                <p className="font-semibold text-slate-100 text-sm">{meta.nameEn}</p>
                <p className="text-xs text-slate-500">{meta.nameFr}</p>
              </div>
            </div>

            {/* Numéro en arabe */}
            <span
              dir="rtl"
              lang="ar"
              className="text-xs text-slate-600"
              style={{ fontFamily: 'var(--font-amiri)', lineHeight: '1.8' }}
            >
              حديث رقم {hadithNumber}
            </span>
          </div>

          {/* ── Texte arabe ────────────────────────────────────── */}
          {/*
            ⚠️  ZONE SACRÉE ABSOLUE
            - dir="rtl" lang="ar" OBLIGATOIRES
            - Le texte arabe est affiché sans AUCUNE transformation
            - [prematn] → sanad en gris (chaîne narrateurs)
            - [matn] → texte principal en blanc lumineux
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
                  {/* Sanad (chaîne des narrateurs) — ⚠️ SACRÉ */}
                  {arParsed.prematn && (
                    <p
                      className="mb-4 leading-loose"
                      style={{
                        fontSize: '1.25rem',
                        lineHeight: '2.5rem',
                        color: '#94a3b8',
                      }}
                    >
                      {/* ⚠️ Texte sacré — affiché tel quel */}
                      {arParsed.prematn}
                    </p>
                  )}
                  {/* Matn (texte principal) — ⚠️ SACRÉ */}
                  {arParsed.matn && (
                    <p
                      className="leading-loose"
                      style={{
                        fontSize: '1.5rem',
                        lineHeight: '3rem',
                        color: '#f1f5f9',
                      }}
                    >
                      {/* ⚠️ Texte sacré — affiché tel quel */}
                      {arParsed.matn}
                    </p>
                  )}
                </div>
              ) : (
                /* Fallback si pas de structure prematn/matn */
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

          {/* ── Texte anglais ─────────────────────────────────── */}
          {enBody && (
            <div
              className="px-6 py-7"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-xs uppercase tracking-widest mb-4 text-slate-600">
                English Translation
              </p>
              <div
                className="text-sm text-slate-300 leading-relaxed prose-sm"
                dangerouslySetInnerHTML={{ __html: enBody }}
                style={{ lineHeight: '1.8' }}
              />
              {enHadith && enHadith.grades.length > 0 && (
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {enHadith.grades.map((g, i) => {
                    const gs = getGradeBadgeStyle(g.grade)
                    return (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-lg font-medium"
                        style={gs}
                      >
                        {g.grade}{g.graded_by ? ` — ${g.graded_by}` : ''}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Référence complète ────────────────────────────── */}
          <div
            className="px-6 py-5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(10,15,30,0.4)',
            }}
          >
            <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider">Référence</p>
            <p className="font-semibold text-slate-200 text-sm">{ref}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <p
                dir="rtl"
                lang="ar"
                className="text-xs text-slate-500"
                style={{ fontFamily: 'var(--font-amiri)', lineHeight: '1.8' }}
              >
                {/* ⚠️ Nom de la collection en arabe — SACRÉ */}
                {meta.nameAr}، رقم {hadithNumber}
              </p>
              {hadithDetail.bookNumber && (
                <Link
                  href={`/hadiths/${collection}/books/${hadithDetail.bookNumber}`}
                  className="text-xs hover:text-amber-400 transition-colors"
                  style={{ color: '#64748b' }}
                >
                  📖 Voir dans le livre {hadithDetail.bookNumber}
                </Link>
              )}
            </div>
          </div>

          {/* ── Actions (favoris, copier, partager) ──────────── */}
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <HadithActions
              collection={collection}
              hadithNumber={hadithNumber}
              collectionName={meta.nameEn}
              ref={ref}
              arText={arParsed?.full ?? stripHadithTags(arHadith?.body ?? '')}
            />
          </div>
        </article>

        {/* ── Navigation prev / next ────────────────────────── */}
        <nav
          className="mt-8 flex items-center justify-between gap-4"
          aria-label="Navigation entre hadiths"
        >
          {prevNum ? (
            <Link
              href={`/hadiths/${collection}/${prevNum}`}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              ← Hadith {prevNum}
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/hadiths/${collection}`}
            className="text-xs text-slate-600 hover:text-amber-400 transition-colors px-3 py-2"
          >
            ☰ Livres
          </Link>

          {nextNum ? (
            <Link
              href={`/hadiths/${collection}/${nextNum}`}
              className="flex-1 text-center px-4 py-3 rounded-xl text-sm transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
            >
              Hadith {nextNum} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <footer className="mt-10 text-center text-xs text-slate-700 space-y-1">
          <p>Source : sunnah.com API · Données en lecture seule</p>
          <p>Pour toute question de jurisprudence, consultez un savant qualifié.</p>
        </footer>
      </div>
    </div>
  )
}
