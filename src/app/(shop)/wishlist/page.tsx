// src/app/(shop)/wishlist/page.tsx
import { requireAuth } from '@lib/auth-utils'
import { WishlistService } from '@application/WishlistService'
import { PrismaWishlistRepository } from '@infrastructure/db/PrismaWishlistRepository'
import { formatPrice } from '@domain/pricing'
import { WishlistToggleButton } from '@components/wishlist/WishlistToggleButton'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi wishlist · VENTO' }

const wishlistService = new WishlistService(new PrismaWishlistRepository())

export default async function WishlistPage() {
  const session = await requireAuth()
  const userId = session.user?.id
  if (!userId) throw new Error('Sesion invalida')
  const { items } = await wishlistService.getUserWishlist(userId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">
        Mi wishlist
        {items.length > 0 && (
          <span className="ml-2 text-base font-normal text-stone-400">
            ({items.length})
          </span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="mb-4">Tu wishlist está vacía.</p>
          <Link href="/productos"
            className="text-stone-900 font-medium text-sm underline">
            Explorar productos
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <li key={item.id}
              className="bg-white border border-stone-100 rounded-xl overflow-hidden hover:shadow-sm transition group">

              <Link href={`/productos/${item.slug}`} className="relative block aspect-[3/4] bg-stone-50">
                {item.images[0] ? (
                  <Image
                    src={item.images[0]} alt={item.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-stone-100" />
                )}
              </Link>

              <div className="p-4 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-stone-400">{item.category.name}</p>
                  <p className="text-sm font-medium text-stone-900 truncate mt-0.5">{item.name}</p>
                  <p className="text-sm font-semibold text-stone-900 mt-1">{formatPrice(item.price)}</p>
                </div>
                <WishlistToggleButton
                  productId={item.id}
                  initialState={true}
                  variant="icon"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
