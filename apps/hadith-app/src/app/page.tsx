// @ts-nocheck
import { getCollections } from '@/lib/db'
import CollectionCard from '@/components/collections/CollectionCard'
import SearchBar from '@/components/search/SearchBar'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Collections de Hadiths — Sunnah' }

const KUTUB_SITTA = ['bukhari','muslim','nasai','abudawud','tirmidhi','ibnmajah']
const OTHER_MAIN  = ['malik','ahmad','riyadussalihin','nawawi40','adab','mishkat','bulugh','shamail','darimi','mishkat','forty','hisn','virtues']

export default async function HomePage() {
  let collections: Record<string, unknown>[] = []
  let dbError = false

  try {
    collections = await getCollections() as Record<string, unknown>[]
  } catch {
    dbError = true
  }

  const byKey = Object.fromEntries(collections.map(c => [c.collection_key as string, c]))

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#067b55] to-[#045a3e] rounded-xl p-8 mb-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">
          <span className="font-arabic block text-4xl mb-1">كتب الحديث</span>
          Collections de Hadiths
        </h1>
        <p className="text-green-100 mb-6 max-w-xl mx-auto">
          Les collections authentiques de la Sunnah du Prophète Muhammad ﷺ
        </p>
        <div className="max-w-lg mx-auto">
          <SearchBar />
        </div>
      </section>

      {dbError && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-amber-800 text-sm">
          ⚠️ Base de données non disponible — assurez-vous que PostgreSQL est en cours d&apos;exécution
          et que les seeds hadiths ont été importés.
        </div>
      )}

      {/* Kutub as-Sittah */}
      <section className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">الكتب الستة</h2>
          <span className="text-gray-500 text-sm">Les Six Livres canoniques</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KUTUB_SITTA.map(key => {
            const c = byKey[key]
            if (!c) return null
            return (
              <CollectionCard
                key={key}
                collectionKey={key}
                nameArabic={c.name_arabic as string}
                nameEnglish={c.name_english as string}
                nameFrench={c.name_french as string}
                author={c.author as string}
                deathHijri={c.death_year_hijri as number | null}
                totalHadiths={c.total_hadiths as number}
                loadedHadiths={c.loaded_hadiths as number}
              />
            )
          })}
          {!dbError && KUTUB_SITTA.map(key => !byKey[key] && (
            <div key={key} className="hadith-card p-4 animate-pulse">
              <div className="h-16 bg-gray-200 rounded mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </section>

      {/* Autres collections */}
      <section className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Autres collections</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {collections
            .filter(c => !KUTUB_SITTA.includes(c.collection_key as string))
            .map(c => (
              <CollectionCard
                key={c.collection_key as string}
                collectionKey={c.collection_key as string}
                nameArabic={c.name_arabic as string}
                nameEnglish={c.name_english as string}
                nameFrench={c.name_french as string}
                author={c.author as string}
                deathHijri={c.death_year_hijri as number | null}
                totalHadiths={c.total_hadiths as number}
                loadedHadiths={c.loaded_hadiths as number}
              />
            ))}
        </div>
      </section>

      {/* Stats */}
      {collections.length > 0 && (
        <section className="bg-[#f0faf5] border border-green-100 rounded-xl p-6 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-3xl font-bold text-[#067b55]">{collections.length}</p>
              <p className="text-sm text-gray-500">Collections</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#067b55]">
                {collections.reduce((s, c) => s + (c.loaded_hadiths as number || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Hadiths importés</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#067b55]">
                {collections.reduce((s, c) => s + (c.total_hadiths as number || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Total disponible</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#067b55]">2</p>
              <p className="text-sm text-gray-500">Langues (AR + EN)</p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
