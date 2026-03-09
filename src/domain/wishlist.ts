// src/domain/wishlist.ts — wishlist, FP puro

export type WishlistItem = {
  productId: string
  addedAt: Date
}

export type Wishlist = { items: WishlistItem[] }

/** ¿El producto está en la wishlist? */
export const isInWishlist = (wishlist: Wishlist, productId: string): boolean =>
  wishlist.items.some(i => i.productId === productId)

/** Agrega un producto (idempotente: no duplica) */
export const addToWishlist = (wishlist: Wishlist, productId: string): Wishlist => {
  if (isInWishlist(wishlist, productId)) return wishlist
  return {
    items: [...wishlist.items, { productId, addedAt: new Date() }],
  }
}

/** Elimina un producto */
export const removeFromWishlist = (wishlist: Wishlist, productId: string): Wishlist => ({
  items: wishlist.items.filter(i => i.productId !== productId),
})

/** Alterna el estado (toggle) */
export const toggleWishlist = (wishlist: Wishlist, productId: string): Wishlist =>
  isInWishlist(wishlist, productId)
    ? removeFromWishlist(wishlist, productId)
    : addToWishlist(wishlist, productId)
