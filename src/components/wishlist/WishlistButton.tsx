'use client'
// src/components/wishlist/WishlistButton.tsx
import { useState } from 'react'

type Props = {
  productId: string
  initialInWishlist?: boolean
}

export function WishlistButton({ productId, initialInWishlist = false }: Props) {
  const [inWishlist, setInWishlist] = useState(initialInWishlist)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })

      if (res.status === 401) {
        window.location.href = '/login?callbackUrl=' + window.location.pathname
        return
      }

      if (res.ok) {
        const { added } = await res.json()
        setInWishlist(added)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={inWishlist ? 'Quitar de wishlist' : 'Agregar a wishlist'}
      aria-pressed={inWishlist}
      className={`w-9 h-9 flex items-center justify-center rounded-full border transition
        ${inWishlist
          ? 'border-red-300 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-stone-200 bg-white text-stone-400 hover:border-stone-400 hover:text-stone-700'}
        disabled:opacity-50`}
    >
      {inWishlist ? '♥' : '♡'}
    </button>
  )
}
