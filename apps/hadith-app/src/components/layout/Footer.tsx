export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-white font-semibold mb-2">Collections des Kutub as-Sittah</h3>
            <ul className="space-y-1 text-xs">
              {['bukhari','muslim','nasai','abudawud','tirmidhi','ibnmajah'].map(c => (
                <li key={c}>
                  <a href={`/${c}`} className="hover:text-green-400 transition-colors capitalize">
                    {c === 'bukhari' ? 'Sahih Al-Bukhari' :
                     c === 'muslim' ? 'Sahih Muslim' :
                     c === 'nasai' ? "Sunan an-Nasa'i" :
                     c === 'abudawud' ? 'Sunan Abi Dawud' :
                     c === 'tirmidhi' ? "Jami' at-Tirmidhi" :
                     'Sunan Ibn Majah'}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Autres collections</h3>
            <ul className="space-y-1 text-xs">
              {[
                ['malik', 'Muwatta Malik'],
                ['riyadussalihin', 'Riyad as-Salihin'],
                ['nawawi40', '40 Hadiths de Nawawi'],
                ['adab', 'Al-Adab Al-Mufrad'],
                ['bulugh', 'Bulugh al-Maram'],
                ['mishkat', 'Mishkat al-Masabih'],
              ].map(([k,n]) => (
                <li key={k}><a href={`/${k}`} className="hover:text-green-400 transition-colors">{n}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">À propos</h3>
            <p className="text-xs leading-relaxed">
              Toutes les données proviennent de sunnah.com (API v1). 
              Le texte arabe est reproduit à l&apos;identique, sans modification.
              Les traductions anglaises sont celles des traducteurs référencés.
            </p>
            <p className="text-xs mt-2 text-green-500 font-arabic text-right">
              وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4 text-center text-xs">
          <p>Source des données : <a href="https://sunnah.com" className="text-green-500 hover:underline" target="_blank" rel="noopener noreferrer">sunnah.com</a> — Plateforme Islamique SaaS</p>
        </div>
      </div>
    </footer>
  )
}
