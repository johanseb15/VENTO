'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '@/lib/cart-store'
import { formatPrice } from '@/domain/pricing'

export function CartDrawer() {
  const cart = useCartStore((state) => state.cart)
  const removeItem = useCartStore((state) => state.remove)
  const subtotal = useCartStore((state) => state.subtotal)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed right-6 top-6 z-50 hidden w-80 border-brand-rose bg-white/90 backdrop-blur-md lg:block bento-card"
    >
      <h2 className="mb-4 font-serif text-2xl">Tu Carrito</h2>

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {cart.items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex items-center justify-between rounded-[1.5rem] bg-brand-sand/30 p-3"
            >
              <div>
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-slate-500">
                  {item.quantity} x {formatPrice(item.product.price)}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.product.id)}
                className="px-2 text-[10px] font-bold uppercase text-red-400 hover:text-red-600"
                type="button"
              >
                Quitar
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {cart.items.length === 0 && <p className="text-sm text-slate-500">Tu carrito esta muy liviano.</p>}

        {cart.items.length > 0 && (
          <>
            <div className="mt-4 flex items-end justify-between border-t border-brand-rose/30 pt-4">
              <span className="text-sm text-slate-500">Total</span>
              <span className="font-serif text-2xl text-brand-primary">{formatPrice(subtotal())}</span>
            </div>

            <Link
              href="/checkout"
              className="block w-full rounded-full bg-brand-primary py-4 text-center font-bold text-white shadow-lg shadow-brand-rose/20 transition-transform hover:scale-[1.02]"
            >
              Finalizar Compra
            </Link>
          </>
        )}
      </div>
    </motion.div>
  )
}
