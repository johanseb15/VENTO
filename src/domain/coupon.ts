// src/domain/coupon.ts
// Lógica de cupones — funciones puras (FP)

export type Coupon = {
  id: string
  code: string
  type: 'PERCENT' | 'FIXED'
  value: number       // porcentaje o centavos
  minPurchase: number | null
  maxUses: number | null
  usedCount: number
  expiresAt: Date | null
  isActive: boolean
}

export type CouponValidationResult =
  | { valid: true; coupon: Coupon; discountAmount: number }
  | { valid: false; error: string }

/** Valida un cupón contra el subtotal del carrito */
export const validateCoupon = (
  coupon: Coupon,
  subtotalCents: number,
  now = new Date()
): CouponValidationResult => {
  if (!coupon.isActive) {
    return { valid: false, error: 'El cupón no está activo' }
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    return { valid: false, error: 'El cupón ha vencido' }
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'El cupón ha alcanzado su límite de usos' }
  }

  if (coupon.minPurchase !== null && subtotalCents < coupon.minPurchase) {
    return {
      valid: false,
      error: `El cupón requiere una compra mínima de $${coupon.minPurchase / 100}`,
    }
  }

  const discountAmount =
    coupon.type === 'PERCENT'
      ? Math.round(subtotalCents * (coupon.value / 100))
      : Math.min(coupon.value, subtotalCents)

  return { valid: true, coupon, discountAmount }
}

/** Calcula el total final aplicando el descuento del cupón */
export const applyCartCoupon = (
  subtotalCents: number,
  coupon: Coupon
): { discountAmount: number; total: number } => {
  const discountAmount =
    coupon.type === 'PERCENT'
      ? Math.round(subtotalCents * (coupon.value / 100))
      : Math.min(coupon.value, subtotalCents)

  return {
    discountAmount,
    total: Math.max(0, subtotalCents - discountAmount),
  }
}
