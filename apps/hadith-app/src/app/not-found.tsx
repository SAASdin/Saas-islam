import Link from 'next/link'

export const metadata = {
  title: 'Page introuvable — Hadith',
  description: 'La page que vous cherchez n\'existe pas.',
}

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Décoration arabe */}
      <div className="font-arabic text-6xl text-[#067b55] mb-4 opacity-20 select-none">
        ٤٠٤
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-10 max-w-md w-full shadow-sm">
        <div className="text-5xl mb-4">🔍</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page introuvable</h1>
        <p className="font-arabic text-xl text-[#067b55] mb-4 leading-loose">
          الصفحة غير موجودة
        </p>

        <p className="text-gray-500 text-sm mb-8">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#067b55] text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-[#055c40] transition-colors"
          >
            ← Accueil
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 border border-[#067b55] text-[#067b55] px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors"
          >
            🔍 Rechercher
          </Link>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-xs">
        وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
      </p>
    </div>
  )
}
