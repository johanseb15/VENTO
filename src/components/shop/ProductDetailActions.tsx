'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart-store'
import { toCartProduct } from '@/application/cartMappers'
import type { Product } from '@/application/ProductService'

const sizes = ['S', 'M', 'L'] as const

export function ProductDetailActions({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<(typeof sizes)[number]>('M')
  const addToCart = useCartStore((state) => state.add)

  return (
    <>
      <div className="mb-8 flex gap-4">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
              selectedSize === size
                ? 'border-brand-primary bg-brand-rose/30 text-text-main'
                : 'border-slate-200 hover:border-brand-primary'
            }`}
            type="button"
            aria-pressed={selectedSize === size}
          >
            {size}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => addToCart(toCartProduct(product), 1)}
        disabled={product.stock === 0}
        className="w-full rounded-full bg-text-main py-5 text-lg font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {product.stock === 0 ? 'Sin stock' : `Agregar talle ${selectedSize} a la bolsa`}
      </button>
    </>
  )
}
