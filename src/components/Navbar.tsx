'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/cart-store'

export function Navbar() {
  const itemsCount = useCartStore((state) => state.count())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="fixed left-1/2 top-6 z-40 w-[92%] max-w-6xl -translate-x-1/2">
      <div className="rounded-full border border-brand-mint bg-white/70 px-8 py-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-tight text-text-main">
            VENTO
          </Link>

          <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/productos" className="transition-colors hover:text-brand-primary">
              Coleccion
            </Link>
            <Link href="/nosotros" className="transition-colors hover:text-brand-primary">
              Nosotros
            </Link>
          </div>

          <Link href="/checkout" className="group relative text-sm font-medium text-text-main">
            Carrito
            {mounted && itemsCount > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] text-white transition-transform group-hover:scale-105">
                {itemsCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
