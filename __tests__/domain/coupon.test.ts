// __tests__/domain/coupon.test.ts
import { describe, it, expect } from 'vitest'
import { validateCoupon, applyCartCoupon, type Coupon } from '@domain/coupon'

const makeCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  id: 'c1',
  code: 'VENTO20',
  type: 'PERCENT',
  value: 20,
  minPurchase: null,
  maxUses: null,
  usedCount: 0,
  expiresAt: null,
  isActive: true,
  ...overrides,
})

const SUBTOTAL = 10000 // $100.00 en centavos

// ── validateCoupon ────────────────────────────

describe('validateCoupon()', () => {
  it('valida un cupón activo y vigente', () => {
    const result = validateCoupon(makeCoupon(), SUBTOTAL)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discountAmount).toBe(2000) // 20% de 10000
    }
  })

  it('rechaza cupón inactivo', () => {
    const result = validateCoupon(makeCoupon({ isActive: false }), SUBTOTAL)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/no está activo/)
  })

  it('rechaza cupón vencido', () => {
    const expired = new Date('2020-01-01')
    const result = validateCoupon(makeCoupon({ expiresAt: expired }), SUBTOTAL)
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/ha vencido/)
  })

  it('acepta cupón con fecha de vencimiento futura', () => {
    const future = new Date('2099-01-01')
    const result = validateCoupon(makeCoupon({ expiresAt: future }), SUBTOTAL)
    expect(result.valid).toBe(true)
  })

  it('rechaza cupón que alcanzó el límite de usos', () => {
    const result = validateCoupon(
      makeCoupon({ maxUses: 100, usedCount: 100 }),
      SUBTOTAL
    )
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/límite de usos/)
  })

  it('acepta cupón que no ha alcanzado el límite', () => {
    const result = validateCoupon(
      makeCoupon({ maxUses: 100, usedCount: 99 }),
      SUBTOTAL
    )
    expect(result.valid).toBe(true)
  })

  it('rechaza si el subtotal no alcanza el mínimo requerido', () => {
    const result = validateCoupon(
      makeCoupon({ minPurchase: 15000 }),
      SUBTOTAL // 10000 < 15000
    )
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toMatch(/compra mínima/)
  })

  it('acepta si el subtotal supera el mínimo requerido', () => {
    const result = validateCoupon(
      makeCoupon({ minPurchase: 5000 }),
      SUBTOTAL // 10000 > 5000
    )
    expect(result.valid).toBe(true)
  })
})

// ── applyCartCoupon ───────────────────────────

describe('applyCartCoupon()', () => {
  it('aplica descuento porcentual correctamente', () => {
    const { discountAmount, total } = applyCartCoupon(
      10000,
      makeCoupon({ type: 'PERCENT', value: 20 })
    )
    expect(discountAmount).toBe(2000)
    expect(total).toBe(8000)
  })

  it('aplica descuento de monto fijo', () => {
    const { discountAmount, total } = applyCartCoupon(
      10000,
      makeCoupon({ type: 'FIXED', value: 1500 })
    )
    expect(discountAmount).toBe(1500)
    expect(total).toBe(8500)
  })

  it('descuento fijo nunca produce total negativo', () => {
    const { total } = applyCartCoupon(
      500,
      makeCoupon({ type: 'FIXED', value: 5000 })
    )
    expect(total).toBe(0)
  })
})
