'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/cart-store'
import { toCartProduct } from '@/application/cartMappers'
import { formatPrice } from '@domain/pricing'
import type { Product } from '@application/ProductService'
import { resolveProductImage } from '@/lib/image'

type Props = { product: Product }
type FlyingState = { startX: number; startY: number; deltaX: number; deltaY: number }

export function ProductCard({ product }: Props) {
  const addToCart = useCartStore((state) => state.add)
  const outOfStock = product.stock === 0
  const imageSrc = resolveProductImage(product.images[0])
  const [flying, setFlying] = useState<FlyingState | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleAdd = () => {
    const rect = buttonRef.current?.getBoundingClientRect()
    const cartProduct = toCartProduct(product)

    if (rect) {
      const cartTargetX = window.innerWidth - 184
      const cartTargetY = 64

      setFlying({
        startX: rect.left,
        startY: rect.top,
        deltaX: cartTargetX - rect.left,
        deltaY: cartTargetY - rect.top,
      })
      addToCart(cartProduct, 1)
      setTimeout(() => setFlying(null), 800)
      return
    }

    addToCart(cartProduct, 1)
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-stone-100 bg-white transition-shadow hover:shadow-md">
      <Link
        href={`/productos/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-stone-50"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-stone-300">Sin imagen</div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-500">
              Agotado
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <span className="text-xs uppercase tracking-wide text-stone-400">{product.category.name}</span>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-medium text-stone-900">{product.name}</h3>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-stone-900">{formatPrice(product.price)}</span>

          <motion.button
            ref={buttonRef}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label={`Agregar ${product.name} al carrito`}
            className="rounded-lg border border-stone-900 px-3 py-1.5 text-xs font-medium text-stone-900 transition hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-stone-900"
          >
            {outOfStock ? 'Sin stock' : '+ Agregar'}
          </motion.button>
        </div>
      </div>

      {flying && (
        <div
          className="flying-item"
          style={{
            left: `${flying.startX}px`,
            top: `${flying.startY}px`,
            transform: `translate(${flying.deltaX}px, ${flying.deltaY}px)`,
            opacity: 0,
          }}
        >
          <Image
            src={imageSrc}
            alt={product.name}
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        </div>
      )}
    </article>
  )
}
