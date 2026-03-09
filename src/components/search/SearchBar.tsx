'use client'
// src/components/search/SearchBar.tsx
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = { initialValue?: string; placeholder?: string }

export function SearchBar({ initialValue = '', placeholder = 'Buscar productos...' }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialValue)
  const [, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    startTransition(() => {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="flex gap-2">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar en el catálogo"
        className="flex-1 border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none
                   focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition"
      />
      <button
        type="submit"
        disabled={!query.trim()}
        aria-label="Buscar"
        className="bg-stone-900 text-white px-5 py-3 rounded-xl text-sm font-medium
                   hover:bg-stone-800 disabled:opacity-40 transition"
      >
        Buscar
      </button>
    </form>
  )
}
