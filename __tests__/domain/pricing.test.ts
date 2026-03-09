// __tests__/domain/pricing.test.ts
import { describe, it, expect } from 'vitest'
import { applyDiscount, calcSubtotal, calcTotal, formatPrice } from '@domain/pricing'

describe('applyDiscount()', () => {
  it('aplica descuento porcentual correctamente', () => {
    expect(applyDiscount(10000, { type: 'PERCENT', value: 20 })).toBe(8000)
  })

  it('aplica descuento de monto fijo', () => {
    expect(applyDiscount(10000, { type: 'FIXED', value: 1500 })).toBe(8500)
  })

  it('descuento fijo nunca resulta en precio negativo', () => {
    expect(applyDiscount(500, { type: 'FIXED', value: 1000 })).toBe(0)
  })

  it('no aplica descuento si no se alcanza el mínimo de compra', () => {
    const rule = { type: 'PERCENT' as const, value: 20, minPurchase: 5000 }
    expect(applyDiscount(3000, rule)).toBe(3000) // sin cambio
  })

  it('aplica descuento si se supera el mínimo de compra', () => {
    const rule = { type: 'PERCENT' as const, value: 20, minPurchase: 5000 }
    expect(applyDiscount(6000, rule)).toBe(4800)
  })

  it('descuento de 0% no cambia el precio', () => {
    expect(applyDiscount(5000, { type: 'PERCENT', value: 0 })).toBe(5000)
  })
})

describe('calcSubtotal()', () => {
  it('calcula el subtotal de múltiples items', () => {
    const items = [
      { price: 4500, quantity: 2 },
      { price: 3200, quantity: 1 },
    ]
    expect(calcSubtotal(items)).toBe(12200) // 9000 + 3200
  })

  it('carrito vacío devuelve 0', () => {
    expect(calcSubtotal([])).toBe(0)
  })

  it('un solo item con cantidad 1', () => {
    expect(calcSubtotal([{ price: 5900, quantity: 1 }])).toBe(5900)
  })
})

describe('calcTotal()', () => {
  const items = [
    { price: 5000, quantity: 2 }, // 10000
  ]

  it('sin descuento, total === subtotal', () => {
    const { subtotal, discountAmount, total } = calcTotal(items)
    expect(subtotal).toBe(10000)
    expect(discountAmount).toBe(0)
    expect(total).toBe(10000)
  })

  it('con descuento porcentual calcula el monto correcto', () => {
    const { subtotal, discountAmount, total } = calcTotal(items, {
      type: 'PERCENT',
      value: 20,
    })
    expect(subtotal).toBe(10000)
    expect(discountAmount).toBe(2000)
    expect(total).toBe(8000)
  })
})

describe('formatPrice()', () => {
  it('formatea centavos a pesos argentinos', () => {
    const result = formatPrice(4500)
    expect(result).toContain('45')
    expect(result).toContain('$')
  })

  it('formatea precio 0', () => {
    const result = formatPrice(0)
    expect(result).toContain('$')
  })
})
