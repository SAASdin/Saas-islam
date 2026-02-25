// ============================================================
// hadiths/[collection]/[hadithNumber]/page.tsx — Un hadith
// Affiche le texte arabe + traduction si disponible
// ⚠️  RÈGLES ABSOLUES :
//   - hadith.arab : JAMAIS toucher — dir="rtl" lang="ar" OBLIGATOIRES
//   - Toute traduction affichée avec badge "traduction automatique"
//   - Référence complète toujours visible
// ============================================================

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHadith, getCollectionMeta, HADITH_COLLECTIONS, formatHadithRef } from '@/lib/hadith-api'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ collection: string; hadithNumber: string }>
}

export async function generateStaticParams() {
  // On ne pré-génère pas tous les hadiths (trop nombreux — >30 000)
  // On laisse Next.js générer à la demande (ISR)
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

export const revalidate = 86400 // 24h

export default async function HadithPage({ params }: Props) {
  const { collection, hadithNumber } = await params

  // Validation des paramètres
  const meta = getCollectionMeta(collection)
  if (!meta) notFound()

  const num = parseInt(hadithNumber)
  if (isNaN(num) || num < 1 || num > meta.totalHadiths) notFound()

  // Récupération du hadith
  const hadith = await getHadith(collection, num)
  if (!hadith) notFound()

  const prevNum = num > 1 ? num - 1 : null
  const nextNum = num < meta.totalHadiths ? num + 1 : null
  const ref = formatHadithRef(meta.name, num)

  return (
    <main className="min-h-screen bg-cream-50 dark:bg-gray-900 pb-8">

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link
            href={`/hadiths/${collection}`}
            className="text-islam-600 dark:text-islam-400 hover:text-islam-700 text-sm flex items-center gap-1 flex-shrink-0"
            aria-label={`Retour à ${meta.name}`}
          >
            ← {meta.name}
          </Link>

          <div className="flex-1 text-center">
            <h1 className="font-bold text-gray-900 dark:text-gray-100 text-sm">
              Hadith n° {num}
            </h1>
            <p className="text-xs text-gray-500">
              {meta.name}
            </p>
          </div>

          {/* Nom arabe ⚠️ SACRÉ */}
          <div
            dir="rtl"
            lang="ar"
            className="arabic-text text-gray-700 dark:text-gray-300 flex-shrink-0"
            style={{ fontSize: '0.9rem', lineHeight: '1.6rem' }}
            aria-label={`Collection : ${meta.nameArabic}`}
          >
            {meta.nameArabic}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6">

        {/* ── Carte principale ────────────────────────────── */}
        <article
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden"
          aria-label={ref}
        >
          {/* En-tête de la carte */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-2">
                <span className="
                  inline-flex items-center justify-center
                  w-9 h-9 rounded-full
                  bg-islam-100 dark:bg-islam-900/40
                  text-islam-700 dark:text-islam-400
                  text-sm font-bold
                ">
                  {num}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {meta.name}
                </span>
              </span>
            </div>
            {/* Numéro en arabe */}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              حديث رقم {num}
            </span>
          </div>

          {/* ── Texte arabe du hadith ────────────────────── */}
          {/*
            ⚠️  ZONE SACRÉE
            - dir="rtl" lang="ar" OBLIGATOIRES
            - hadith.arab copié sans aucune transformation
            - Unité indivisible : jamais couper un hadith
          */}
          <div className="px-6 py-8 bg-amber-50/30 dark:bg-amber-900/5">
            <p
              dir="rtl"
              lang="ar"
              className="arabic-text leading-loose text-gray-900 dark:text-gray-100"
              style={{ fontSize: '1.4rem', lineHeight: '2.6rem' }}
            >
              {/* ⚠️ Texte sacré — copié tel quel, JAMAIS transformer */}
              {hadith.arab}
            </p>
          </div>

          {/* ── Traduction française ────────────────────── */}
          {/*
            ⚠️  L'API gading.dev ne fournit pas de traduction FR
            Si une traduction est ajoutée plus tard, afficher obligatoirement
            le badge "traduction automatique non vérifiée"
          */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 mb-4">
              <span>⚠️</span>
              <span className="font-medium uppercase tracking-wide">
                Traduction française non disponible
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              La traduction française de ce hadith n&apos;est pas encore disponible dans notre base de données.
              Consultez des ouvrages traduits par des savants qualifiés.
            </p>
          </div>

          {/* ── Référence complète ──────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Référence
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 font-semibold">
              {ref}
            </p>
            <p
              dir="rtl"
              lang="ar"
              className="arabic-text text-gray-500 dark:text-gray-400 mt-1"
              style={{ fontSize: '0.9rem', lineHeight: '1.6rem' }}
            >
              {/* ⚠️ Nom de la collection en arabe — SACRÉ */}
              {meta.nameArabic}
              {' '}
              {/* Numéro en arabe-indic */}
              {`، رقم ${num}`}
            </p>
          </div>

          {/* ── Partage ─────────────────────────────────── */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Partager</p>
            <div className="flex gap-2">
              <ShareButton
                text={`${ref}\n\n${hadith.arab}`}
                url={`/hadiths/${collection}/${num}`}
              />
            </div>
          </div>
        </article>

        {/* ── Navigation hadiths ──────────────────────────── */}
        <nav
          className="mt-6 flex justify-between gap-4"
          aria-label="Navigation entre hadiths"
        >
          {prevNum ? (
            <Link
              href={`/hadiths/${collection}/${prevNum}`}
              className="flex-1 text-center px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm"
            >
              ← Hadith {prevNum}
            </Link>
          ) : (
            <span />
          )}

          <Link
            href={`/hadiths/${collection}`}
            className="text-center px-4 py-2 text-gray-500 dark:text-gray-400 text-sm hover:text-islam-600 transition-colors"
          >
            Liste
          </Link>

          {nextNum ? (
            <Link
              href={`/hadiths/${collection}/${nextNum}`}
              className="flex-1 text-center px-4 py-2 bg-islam-50 dark:bg-islam-900/30 text-islam-700 dark:text-islam-400 rounded-lg hover:bg-islam-100 transition-colors text-sm"
            >
              Hadith {nextNum} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* ── Source ──────────────────────────────────────── */}
        <footer className="mt-8 text-center text-xs text-gray-400 dark:text-gray-600 space-y-1">
          <p>Source : api.hadith.gading.dev · Données en lecture seule</p>
          <p>Pour toute question de jurisprudence, consultez un savant qualifié.</p>
        </footer>
      </div>
    </main>
  )
}

// ── Composant partage (Client Component inline) ─────────────
// Utilise l'API Web Share ou clipboard comme fallback

'use client'

function ShareButton({ text, url }: { text: string; url: string }) {
  const handleShare = async () => {
    const fullUrl = `${window.location.origin}${url}`
    if (navigator.share) {
      await navigator.share({ text, url: fullUrl }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text}\n\n${fullUrl}`).catch(() => {})
      // TODO: Afficher une notification "Copié !" (toast)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="
        flex items-center gap-2 px-3 py-1.5
        bg-gray-100 dark:bg-gray-700
        hover:bg-islam-50 dark:hover:bg-islam-900/30
        text-gray-600 dark:text-gray-300
        hover:text-islam-600 dark:hover:text-islam-400
        rounded-lg text-xs
        transition-colors duration-150
      "
    >
      <span>🔗</span>
      <span>Partager ce hadith</span>
    </button>
  )
}
