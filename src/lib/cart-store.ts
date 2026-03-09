// src/lib/cart-store.ts
// Estado del carrito en cliente con Zustand
// Persiste en localStorage y sincroniza con DB al hacer login
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  addItem, removeItem, updateQuantity, clearCart,
  itemCount, subtotal, isEmpty,
  type Cart, type CartProduct,
} from '@domain/cart'

type CartStore = {
  cart: Cart
  // Acciones
  add: (product: CartProduct, qty?: number) => void
  remove: (productId: string) => void
  update: (productId: string, qty: number) => void
  clear: () => void
  // Computed (derivados del dominio puro)
  count: () => number
  subtotal: () => number
  isEmpty: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: { items: [] },

      add: (product, qty = 1) =>
        set((s) => ({ cart: addItem(s.cart, product, qty) })),

      remove: (productId) =>
        set((s) => ({ cart: removeItem(s.cart, productId) })),

      update: (productId, qty) =>
        set((s) => ({ cart: updateQuantity(s.cart, productId, qty) })),

      clear: () => set({ cart: clearCart() }),

      count: () => itemCount(get().cart),
      subtotal: () => subtotal(get().cart),
      isEmpty: () => isEmpty(get().cart),
    }),
    {
      name: 'vento-cart',
      // Solo persiste los items, no las funciones
      partialize: (s) => ({ cart: s.cart }),
    }
  )
)
