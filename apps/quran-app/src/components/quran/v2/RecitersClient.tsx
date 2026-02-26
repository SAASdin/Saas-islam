'use client'
import type { QdcReciter } from '@/lib/quran-cdn-api'
import { useSettings } from '@/store/settings'
import Link from 'next/link'

interface Props { reciters: QdcReciter[] }

export default function RecitersClient({ reciters }: Props) {
  const { reciterId, setReciter } = useSettings()

  // Grouper par style
  const byStyle = reciters.reduce<Record<string, QdcReciter[]>>((acc, r) => {
    const style = r.style?.name ?? 'Autre'
    if (!acc[style]) acc[style] = []
    acc[style].push(r)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(byStyle).map(([style, list]) => (
        <div key={style} className="mb-10">
          <h2 className="text-base font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
            {style}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {list.map(reciter => {
              const isSelected = reciter.id === reciterId
              const initials = reciter.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              return (
                <button
                  key={reciter.id}
                  onClick={() => setReciter(reciter.id, `ar.${reciter.name.toLowerCase().replace(/\s+/g, '')}`)}
                  className={`relative p-3 rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 ring-1 ring-emerald-500/50'
                      : 'bg-white/3 border-white/10 hover:bg-white/6 hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center text-lg font-bold ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}>
                    {initials}
                  </div>

                  <p className={`text-xs font-medium leading-tight ${isSelected ? 'text-emerald-300' : 'text-white'}`}>
                    {reciter.translated_name?.name ?? reciter.name}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{reciter.qirat?.name}</p>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Écouter avec le récitateur sélectionné */}
      <div className="mt-8 flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
        <span className="text-2xl">🎵</span>
        <div className="flex-1">
          <p className="text-white text-sm font-medium">
            Récitateur sélectionné · ID {reciterId}
          </p>
          <p className="text-emerald-400/70 text-xs mt-0.5">
            Ce récitateur sera utilisé pour la lecture du Coran
          </p>
        </div>
        <Link href="/surah/1" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors">
          Écouter Al-Fatihah
        </Link>
      </div>
    </div>
  )
}
