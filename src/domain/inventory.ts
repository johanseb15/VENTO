// src/domain/inventory.ts
// Lógica de stock — funciones puras

export type StockItem = {
  productId: string
  stock: number
}

export type CartQuantity = {
  productId: string
  quantity: number
}

/** ¿Hay suficiente stock para la cantidad pedida? */
export const isAvailable = (stock: number, requested: number): boolean =>
  stock > 0 && requested > 0 && stock >= requested

/** Valida todos los items del carrito contra el stock disponible.
 *  Devuelve los productIds con problemas de stock. */
export const validateCartStock = (
  cartItems: CartQuantity[],
  stockMap: StockItem[]
): { productId: string; available: number; requested: number }[] => {
  const stock = new Map(stockMap.map((s) => [s.productId, s.stock]))

  return cartItems
    .filter((item) => {
      const available = stock.get(item.productId) ?? 0
      return !isAvailable(available, item.quantity)
    })
    .map((item) => ({
      productId: item.productId,
      available: stock.get(item.productId) ?? 0,
      requested: item.quantity,
    }))
}

/** Calcula el nuevo stock después de una venta.
 *  Lanza error si no hay suficiente stock (debe validarse antes). */
export const deductStock = (
  current: number,
  sold: number
): number => {
  if (current < sold) {
    throw new Error(`Stock insuficiente: disponible ${current}, solicitado ${sold}`)
  }
  return current - sold
}
