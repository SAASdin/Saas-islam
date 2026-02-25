// ============================================================
// hadiths/[collection]/[hadithNumber]/page.tsx — Hadith détail — Premium dark
// ⚠️  RÈGLES ABSOLUES :
//   - hadith.arab : JAMAIS toucher — dir="rtl" lang="ar" OBLIGATOIRES
//   - Toute traduction affichée avec badge "traduction automatique"
//   - Référence complète toujours visible
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHadith, getCollectionMeta, HADITH_COLLECTIONS, formatHadithRef } from '@/lib/hadith-api'
import Navigation from '@/components/Navigation'
import ShareButton from '@/components/hadith/ShareButton'
import type { Metadata } from 'next'

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
  const num = parseInt(hadithNumber)
  return {
    title: `${meta.name} n° ${num}`,
    description: `Hadith n° ${num} de ${meta.name} (${meta.nameFr})`,
  }
}

export const revalidate = 86400

export default async function HadithPage({ params }: Props) {
  const { collection, hadithNumber } = await params

  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const num = parseInt(hadithNumber)
  if (isNaN(num) || num < 1 || num > meta.totalHadiths) notFound()

  const hadith = await getHadith(collection, num)
  if (!hadith) notFound()

  const prevNum = num > 1 ? num - 1 : null
  const nextNum = num < meta.totalHadiths ? num + 1 : null
  const ref = formatHadithRef(meta.name, num)

  return (
    <div className="min-h-screen pb-12" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête ────────────────────────────────────────── */}
      <div
        className="py-8 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href={`/hadiths/${collection}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-5"
          >
            ← {meta.name}
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Hadith n° {num}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{meta.name}</p>
            </div>

            {/* Nom arabe — ⚠️ SACRÉ */}
            <div
              dir="rtl"
              lang="ar"
              style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.2rem',
                lineHeight: '1.8',
                color: '#d4af37',
              }}
              aria-label={`Collection : ${meta.nameArabic}`}
            >
              {/* ⚠️ Affiché tel quel */}
              {meta.nameArabic}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">

        {/* ── Carte principale ────────────────────────────── */}
        <article
          className="rounded-2xl overflow-hidden animate-fade-in-scale"
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(17,24,39,0.7)',
          }}
          aria-label={ref}
        >
          {/* En-tête de la carte */}
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
                {num}
              </span>
              <div>
                <p className="font-semibold text-slate-100">{meta.name}</p>
                <p className="text-xs text-slate-500">{meta.nameFr}</p>
              </div>
            </div>

            <span className="text-xs text-slate-600">
              حديث رقم {num}
            </span>
          </div>

          {/* ── Texte arabe du hadith ────────────────────── */}
          {/*
            ⚠️  ZONE SACRÉE
            - dir="rtl" lang="ar" OBLIGATOIRES
            - hadith.arab copié sans aucune transformation
          */}
          <div
            className="px-6 py-10"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.03) 0%, rgba(21,128,61,0.02) 100%)',
            }}
          >
            {/* Label */}
            <p
              className="text-xs mb-4 uppercase tracking-widest"
              style={{ color: '#d4af37', opacity: 0.6 }}
            >
              Texte arabe
            </p>

            <p
              dir="rtl"
              lang="ar"
              className="leading-loose"
              style={{
                fontFamily: 'var(--font-amiri)',
                fontSize: '1.6rem',
                lineHeight: '3rem',
                color: '#f1f5f9',
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              {/* ⚠️ Texte sacré — copié tel quel, JAMAIS transformer */}
              {hadith.arab}
            </p>
          </div>

          {/* ── Note traduction ─────────────────────────── */}
          <div
            className="px-6 py-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-4"
              style={{
                background: 'rgba(251,191,36,0.04)',
                border: '1px solid rgba(251,191,36,0.12)',
              }}
            >
              <span>📝</span>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider mb-1"
                  style={{ color: '#fbbf24' }}
                >
                  Traduction non disponible dans cette version
                </p>
                <p className="text-sm text-slate-500">
                  La traduction française n&apos;est pas encore disponible.
                  Consultez des ouvrages traduits par des savants qualifiés.
                </p>
              </div>
            </div>
          </div>

          {/* ── Référence complète ──────────────────────── */}
          <div
            className="px-6 py-5"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(10,15,30,0.5)',
            }}
          >
            <p className="text-xs text-slate-600 mb-2 uppercase tracking-wider">Référence</p>
            <p className="font-semibold text-slate-200 text-sm">{ref}</p>
            <div className="flex items-center gap-2 mt-2">
              <p
                dir="rtl"
                lang="ar"
                className="text-xs text-slate-500"
                style={{ fontFamily: 'var(--font-amiri)', lineHeight: '1.8' }}
              >
                {/* ⚠️ Nom de la collection en arabe — SACRÉ */}
                {meta.nameArabic}
                {`، رقم ${num}`}
              </p>
            </div>
          </div>

          {/* ── Partage ─────────────────────────────────── */}
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <ShareButton
              text={`${ref}\n\n${hadith.arab}`}
              url={`/hadiths/${collection}/${num}`}
            />
          </div>
        </article>

        {/* ── Navigation hadiths ────────────────────────── */}
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
          ) : <span />}

          <Link
            href={`/hadiths/${collection}`}
            className="text-xs text-slate-600 hover:text-amber-400 transition-colors px-3 py-2"
          >
            ☰ Liste
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
          ) : <span />}
        </nav>

        <footer className="mt-10 text-center text-xs text-slate-700 space-y-1">
          <p>Source : api.hadith.gading.dev · Données en lecture seule</p>
          <p>Pour toute question de jurisprudence, consultez un savant qualifié.</p>
        </footer>
      </div>
    </div>
  )
}
