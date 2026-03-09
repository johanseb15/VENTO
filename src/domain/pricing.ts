// src/domain/pricing.ts
// Lógica de precios — funciones puras (FP)
// Los precios se manejan siempre en CENTAVOS para evitar errores de float

export type DiscountRule = {
  type: 'PERCENT' | 'FIXED'
  value: number          // porcentaje (20) o centavos (1000)
  minPurchase?: number   // centavos mínimos para aplicar
}

export type CartItem = {
  price: number    // centavos
  quantity: number
}

// ── PRECIOS ───────────────────────────────────

/** Aplica un descuento a un precio. Nunca devuelve negativo. */
export const applyDiscount = (
  price: number,
  rule: DiscountRule
): number => {
  if (rule.minPurchase && price < rule.minPurchase) return price

  const discounted =
    rule.type === 'PERCENT'
      ? price * (1 - rule.value / 100)
      : price - rule.value

  return Math.max(0, Math.round(discounted))
}

/** Calcula el subtotal de un carrito (sin descuentos) */
export const calculateSubtotal = (items: CartItem[]): number =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0)

// Compat alias kept for existing tests and callers.
export const calcSubtotal = calculateSubtotal

/** Calcula el total aplicando un descuento opcional al subtotal */
export const calcTotal = (
  items: CartItem[],
  discount?: DiscountRule
): { subtotal: number; discountAmount: number; total: number } => {
  const subtotal = calculateSubtotal(items)
  const total = discount ? applyDiscount(subtotal, discount) : subtotal
  const discountAmount = subtotal - total

  return { subtotal, discountAmount, total }
}

/** Formatea centavos a string legible (ej: 4500 → "$45,00") */
export const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(cents / 100)
