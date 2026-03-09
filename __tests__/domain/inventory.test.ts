// __tests__/domain/inventory.test.ts
import { describe, it, expect } from 'vitest'
import { isAvailable, validateCartStock, deductStock } from '@domain/inventory'

describe('isAvailable()', () => {
  it('devuelve true si hay stock suficiente', () => {
    expect(isAvailable(10, 3)).toBe(true)
  })

  it('devuelve true si la cantidad exacta está disponible', () => {
    expect(isAvailable(3, 3)).toBe(true)
  })

  it('devuelve false si el stock es 0', () => {
    expect(isAvailable(0, 1)).toBe(false)
  })

  it('devuelve false si se pide más de lo disponible', () => {
    expect(isAvailable(2, 5)).toBe(false)
  })

  it('devuelve false si la cantidad pedida es 0', () => {
    expect(isAvailable(10, 0)).toBe(false)
  })
})

describe('validateCartStock()', () => {
  const stockMap = [
    { productId: 'p1', stock: 10 },
    { productId: 'p2', stock: 2 },
    { productId: 'p3', stock: 0 },
  ]

  it('devuelve array vacío si todos tienen stock', () => {
    const cart = [
      { productId: 'p1', quantity: 5 },
      { productId: 'p2', quantity: 2 },
    ]
    expect(validateCartStock(cart, stockMap)).toHaveLength(0)
  })

  it('detecta producto sin stock', () => {
    const cart = [{ productId: 'p3', quantity: 1 }]
    const errors = validateCartStock(cart, stockMap)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.productId).toBe('p3')
    expect(errors[0]?.available).toBe(0)
  })

  it('detecta cuando se pide más de lo disponible', () => {
    const cart = [{ productId: 'p2', quantity: 5 }]
    const errors = validateCartStock(cart, stockMap)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.available).toBe(2)
    expect(errors[0]?.requested).toBe(5)
  })

  it('detecta múltiples problemas a la vez', () => {
    const cart = [
      { productId: 'p2', quantity: 10 }, // insuficiente
      { productId: 'p3', quantity: 1 },  // sin stock
    ]
    const errors = validateCartStock(cart, stockMap)
    expect(errors).toHaveLength(2)
  })
})

describe('deductStock()', () => {
  it('resta el stock correctamente', () => {
    expect(deductStock(10, 3)).toBe(7)
  })

  it('permite dejar el stock en 0', () => {
    expect(deductStock(5, 5)).toBe(0)
  })

  it('lanza error si no hay suficiente stock', () => {
    expect(() => deductStock(2, 5)).toThrow('Stock insuficiente')
  })
})
