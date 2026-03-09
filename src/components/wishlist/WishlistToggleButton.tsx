'use client'
// src/components/wishlist/WishlistToggleButton.tsx
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  productId: string
  initialState: boolean
  variant?: 'icon' | 'button'
}

export function WishlistToggleButton({ productId, initialState, variant = 'icon' }: Props) {
  const router = useRouter()
  const [wishlisted, setWishlisted] = useState(initialState)
  const [, startTransition] = useTransition()

  const toggle = async () => {
    setWishlisted(w => !w) // optimistic update

    const res = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })

    if (!res.ok) {
      setWishlisted(w => !w) // revertir si falla
      if (res.status === 401) router.push('/login')
      return
    }

    startTransition(() => router.refresh())
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        aria-label={wishlisted ? 'Quitar de wishlist' : 'Agregar a wishlist'}
        aria-pressed={wishlisted}
        className="w-8 h-8 flex items-center justify-center rounded-full
                   text-stone-400 hover:text-red-400 transition flex-shrink-0"
      >
        {wishlisted ? '♥' : '♡'}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={wishlisted ? 'Quitar de wishlist' : 'Agregar a wishlist'}
      aria-pressed={wishlisted}
      className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition
        ${wishlisted
          ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
          : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}
    >
      {wishlisted ? '♥' : '♡'}
      {wishlisted ? 'En wishlist' : 'Guardar'}
    </button>
  )
}
