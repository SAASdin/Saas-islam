// ============================================================
// /tafsir-audio — Page d'accueil des tafsirs audio
// Clone de read.tafsir.one homepage
// Server component — force-dynamic pour Next.js 15
// ============================================================
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '@/components/Navigation'
import { TAFSIR_ONE_BOOKS, TAFSIR_ONE_BOOK_KEYS, getCoverUrl } from '@/lib/tafsir-one-api'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'التفسير التفاعلي — Tafsir Audio',
  description: 'استمع وتعلم — 8 تفاسير قرآنية مع تلاوة',
}

export default function TafsirAudioPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-amiri)', color: '#d4af37' }}
            dir="rtl"
            lang="ar"
          >
            التفسير التفاعلي
          </h1>
          <p
            className="text-xl text-slate-400 mt-3"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            استمع وتعلم
          </p>
          <p className="text-slate-500 text-sm mt-2">
            8 tafsirs — lecture & écoute intégrées
          </p>
        </div>

        {/* ── Grille des 8 livres ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {TAFSIR_ONE_BOOK_KEYS.map((key) => {
            const book = TAFSIR_ONE_BOOKS[key]
            const coverUrl = getCoverUrl(key)
            return (
              <Link
                key={key}
                href={`/tafsir-audio/${key}?s=1&a=1`}
                className="group flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#d4af37]/40 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-[#d4af37]/10"
              >
                {/* Couverture */}
                <div className="relative w-full aspect-[3/4] bg-[#0f1628] overflow-hidden">
                  <Image
                    src={coverUrl}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    onError={undefined}
                    unoptimized
                  />
                  {/* Badge audio */}
                  {book.hasAudio && (
                    <span className="absolute top-2 right-2 bg-[#d4af37]/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      🎧
                    </span>
                  )}
                </div>

                {/* Infos */}
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <p
                    className="text-[0.95rem] font-semibold text-white leading-snug text-right"
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-amiri)' }}
                  >
                    {book.title}
                  </p>
                  <p
                    className="text-[0.7rem] text-slate-500 leading-snug text-right line-clamp-2"
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: 'var(--font-amiri)' }}
                  >
                    {book.author}
                  </p>
                </div>

                {/* CTA */}
                <div className="px-3 pb-3">
                  <span className="block text-center text-xs text-[#d4af37] font-medium border border-[#d4af37]/30 group-hover:border-[#d4af37]/60 rounded-lg py-1.5 transition-colors">
                    قرأ واستمع ←
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* ── Note de crédit ── */}
        <div className="text-center border-t border-white/10 pt-8">
          <p
            className="text-slate-500 text-sm"
            dir="rtl"
            lang="ar"
            style={{ fontFamily: 'var(--font-amiri)' }}
          >
            هذه التفاسير مستقاة من موقع{' '}
            <a
              href="https://read.tafsir.one"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4af37] hover:underline"
            >
              read.tafsir.one
            </a>{' '}
            مع كامل الحقوق لأصحابها
          </p>
        </div>
      </main>
    </div>
  )
}
