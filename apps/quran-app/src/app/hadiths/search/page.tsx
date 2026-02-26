// ============================================================
// hadiths/search/page.tsx — Recherche full-text hadiths
// ⚠️  Texte arabe : dir="rtl" lang="ar" OBLIGATOIRES
//     Font arabe : var(--font-amiri)
// ============================================================

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import {
  searchHadiths,
  getCollectionMeta,
  getHadithByLang,
  stripHadithTags,
  getGradeBadgeStyle,
} from '@/lib/sunnah-api'
import HadithSearchClient from './HadithSearchClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Recherche Hadiths — NoorApp',
  description: 'Recherchez dans 18 collections de hadiths. Sahih al-Bukhari, Muslim, et plus.',
}

interface Props {
  searchParams: Promise<{ q?: string; collection?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', collection = '' } = await searchParams

  const query = q.trim()
  const results = query ? await searchHadiths(query, collection || undefined) : []

  return (
    <div className="min-h-screen" style={{ background: '#0a0f1e' }}>
      <Navigation />

      {/* ── En-tête ───────────────────────────────────────────── */}
      <div
        className="py-10 px-4"
        style={{
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-3xl mx-auto">
          <Link
            href="/hadiths"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-400 transition-colors mb-6"
          >
            ← Collections
          </Link>

          <h1 className="text-xl font-bold text-slate-100 mb-4">Recherche Hadiths</h1>

          {/* Client component pour l'interactivité */}
          <HadithSearchClient initialQ={query} initialCollection={collection} />
        </div>
      </div>

      {/* ── Résultats ─────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        {query ? (
          <>
            {/* Compteur résultats */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-400">
                {results.length > 0 ? (
                  <>
                    <span className="font-semibold text-slate-200">{results.length}</span> résultat
                    {results.length > 1 ? 's' : ''} pour &quot;<span className="text-amber-400">{query}</span>&quot;
                    {collection && (
                      <> dans {getCollectionMeta(collection)?.nameEn ?? collection}</>
                    )}
                  </>
                ) : (
                  <>Aucun résultat pour &quot;<span className="text-amber-400">{query}</span>&quot;</>
                )}
              </p>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((hadithDetail) => {
                  const arHadith = getHadithByLang(hadithDetail, 'ar')
                  const enHadith = getHadithByLang(hadithDetail, 'en')

                  const arText = arHadith ? stripHadithTags(arHadith.body) : ''
                  const enText = enHadith ? stripHadithTags(enHadith.body) : ''

                  const grade =
                    enHadith?.grades?.[0]?.grade ?? arHadith?.grades?.[0]?.grade ?? ''
                  const gradeStyle = getGradeBadgeStyle(grade)
                  const collMeta = getCollectionMeta(hadithDetail.collection)

                  return (
                    <Link
                      key={`${hadithDetail.collection}-${hadithDetail.hadithNumber}`}
                      href={`/hadiths/${hadithDetail.collection}/${hadithDetail.hadithNumber}`}
                      className="group block p-5 rounded-2xl transition-all duration-200"
                      style={{
                        background: 'rgba(17,24,39,0.8)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* Header résultat */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {/* Badge collection */}
                          <span
                            className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                            style={{
                              background: 'rgba(212,175,55,0.08)',
                              border: '1px solid rgba(212,175,55,0.15)',
                              color: '#d4af37',
                            }}
                          >
                            {collMeta?.nameEn ?? hadithDetail.collection}
                          </span>
                          <span className="text-xs text-slate-600">
                            n° {hadithDetail.hadithNumber}
                          </span>
                        </div>
                        {grade && (
                          <span
                            className="text-xs px-2.5 py-0.5 rounded-md font-medium"
                            style={gradeStyle}
                          >
                            {grade}
                          </span>
                        )}
                      </div>

                      {/* Aperçu arabe — ⚠️ ZONE SACRÉE */}
                      {arText && (
                        <p
                          dir="rtl"
                          lang="ar"
                          className="line-clamp-2 mb-3"
                          style={{
                            fontFamily: 'var(--font-amiri)',
                            fontSize: '1.15rem',
                            lineHeight: '2.2',
                            color: '#e2e8f0',
                            direction: 'rtl',
                            textAlign: 'right',
                          }}
                        >
                          {/* ⚠️ Texte sacré — affiché tel quel */}
                          {arText}
                        </p>
                      )}

                      {/* Aperçu anglais */}
                      {enText && (
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {enText}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 group-hover:text-amber-400 transition-colors mt-3">
                        Lire →
                      </p>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🔍</p>
                <p className="text-slate-400 mb-2">Aucun résultat trouvé</p>
                <p className="text-xs text-slate-600">
                  Essayez un terme différent ou retirez le filtre de collection.
                </p>
              </div>
            )}
          </>
        ) : (
          /* État initial — pas encore de recherche */
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📜</p>
            <p className="text-slate-300 font-medium mb-2">Recherchez dans 18 collections</p>
            <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto">
              Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud et plus de 70 000 hadiths indexés.
            </p>
            <Link
              href="/hadiths/random"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.2)',
                color: '#d4af37',
              }}
            >
              🎲 Hadith aléatoire
            </Link>
          </div>
        )}
      </section>

      <footer
        className="text-center py-6 text-xs text-slate-700 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
      >
        <p>Source : sunnah.com API · Données en lecture seule</p>
      </footer>
    </div>
  )
}
