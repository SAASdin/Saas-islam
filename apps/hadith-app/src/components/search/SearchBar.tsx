'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchBarProps {
  compact?: boolean
  defaultValue?: string
  collection?: string
}

export default function SearchBar({ compact, defaultValue = '', collection }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const params = new URLSearchParams({ q })
    if (collection) params.set('collection', collection)
    router.push(`/search?${params}`)
  }, [query, collection, router])

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Rechercher dans les hadiths..."
          className={`
            w-full rounded-lg border border-white/30 bg-white/10 text-white
            placeholder:text-green-100/70 outline-none
            focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400
            focus:border-white transition-all
            ${compact ? 'py-1.5 pl-4 pr-10 text-sm' : 'py-3 pl-5 pr-12 text-base'}
          `}
        />
        <button
          type="submit"
          className="absolute right-2 p-1.5 text-green-100 hover:text-white transition-colors"
          aria-label="Rechercher"
        >
          <svg className={compact ? 'w-4 h-4' : 'w-5 h-5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  )
}
