export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-[#067b55] to-[#045a3e] rounded-xl p-8 mb-8 text-center">
        <div className="h-10 bg-white/20 rounded-lg w-64 mx-auto mb-3" />
        <div className="h-5 bg-white/20 rounded w-96 mx-auto mb-6" />
        <div className="h-12 bg-white/20 rounded-xl max-w-lg mx-auto" />
      </div>

      {/* Section titre skeleton */}
      <div className="mb-4 flex items-baseline gap-3">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-200 rounded w-56" />
      </div>

      {/* Grid de cartes skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* Titre arabe */}
            <div className="h-7 bg-gray-200 rounded w-3/4 mb-2 ml-auto" />
            {/* Titre français */}
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
            {/* Auteur */}
            <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
            {/* Barre de progression */}
            <div className="h-2 bg-gray-100 rounded-full mb-2">
              <div
                className="h-2 bg-[#067b55]/30 rounded-full"
                style={{ width: `${40 + i * 10}%` }}
              />
            </div>
            {/* Compteur */}
            <div className="h-4 bg-gray-100 rounded w-24" />
          </div>
        ))}
      </div>

      {/* Section 2 */}
      <div className="mb-4 flex items-baseline gap-3">
        <div className="h-6 bg-gray-200 rounded w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm"
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 ml-auto" />
            <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Indicateur central */}
      <div className="flex justify-center mt-12">
        <div className="flex items-center gap-3 text-[#067b55]">
          <svg
            className="w-5 h-5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="text-sm font-medium">Chargement des hadiths…</span>
        </div>
      </div>
    </div>
  )
}
