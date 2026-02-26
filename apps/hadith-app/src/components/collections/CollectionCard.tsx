import Link from 'next/link'

interface CollectionCardProps {
  collectionKey: string
  nameArabic: string
  nameEnglish: string
  nameFrench: string
  author: string
  deathHijri: number | null
  totalHadiths: number
  loadedHadiths?: number
}

const COLLECTION_COLORS: Record<string, string> = {
  bukhari:        'from-emerald-600 to-emerald-800',
  muslim:         'from-teal-600 to-teal-800',
  nasai:          'from-cyan-600 to-cyan-800',
  abudawud:       'from-green-600 to-green-800',
  tirmidhi:       'from-lime-600 to-lime-800',
  ibnmajah:       'from-sky-600 to-sky-800',
  malik:          'from-amber-600 to-amber-800',
  ahmad:          'from-orange-600 to-orange-800',
  riyadussalihin: 'from-violet-600 to-violet-800',
  nawawi40:       'from-purple-600 to-purple-800',
  adab:           'from-pink-600 to-pink-800',
  shamail:        'from-rose-600 to-rose-800',
  mishkat:        'from-indigo-600 to-indigo-800',
  bulugh:         'from-blue-600 to-blue-800',
  forty:          'from-slate-600 to-slate-800',
  hisn:           'from-stone-600 to-stone-800',
  virtues:        'from-yellow-600 to-yellow-800',
  darimi:         'from-red-600 to-red-800',
}

export default function CollectionCard({
  collectionKey, nameArabic, nameEnglish, nameFrench,
  author, deathHijri, totalHadiths, loadedHadiths
}: CollectionCardProps) {
  const gradient = COLLECTION_COLORS[collectionKey] || 'from-gray-600 to-gray-800'
  const loaded = loadedHadiths ?? 0
  const pct = totalHadiths > 0 ? Math.round((loaded / totalHadiths) * 100) : 0

  return (
    <Link href={`/${collectionKey}`} className="group block">
      <div className="hadith-card overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Header coloré */}
        <div className={`bg-gradient-to-br ${gradient} p-4 text-white`}>
          <p className="font-arabic text-xl text-right mb-1 leading-relaxed">{nameArabic}</p>
          <h3 className="font-bold text-base leading-tight">{nameEnglish}</h3>
          {nameFrench !== nameEnglish && (
            <p className="text-xs opacity-80 mt-0.5">{nameFrench}</p>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>{author}{deathHijri ? ` (d. ${deathHijri}H)` : ''}</span>
            <span className="font-semibold text-gray-700">
              {totalHadiths.toLocaleString()} hadiths
            </span>
          </div>

          {/* Barre de chargement */}
          {loaded > 0 && (
            <div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#067b55] rounded-full transition-all"
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {loaded.toLocaleString()} importés ({pct}%)
              </p>
            </div>
          )}

          {loaded === 0 && (
            <p className="text-xs text-gray-400">En cours d&apos;import...</p>
          )}
        </div>
      </div>
    </Link>
  )
}
