// __tests__/domain/wishlist.test.ts
import { describe, it, expect } from 'vitest'
import { isInWishlist, addToWishlist, removeFromWishlist, toggleWishlist } from '@domain/wishlist'
import type { Wishlist } from '@domain/wishlist'

const empty: Wishlist = { items: [] }
const withP1: Wishlist = { items: [{ productId: 'p1', addedAt: new Date() }] }

describe('isInWishlist()', () => {
  it('retorna true si el producto está', () => {
    expect(isInWishlist(withP1, 'p1')).toBe(true)
  })
  it('retorna false si no está', () => {
    expect(isInWishlist(empty, 'p1')).toBe(false)
  })
})

describe('addToWishlist()', () => {
  it('agrega un producto nuevo', () => {
    const result = addToWishlist(empty, 'p1')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.productId).toBe('p1')
  })
  it('es idempotente: no duplica', () => {
    const result = addToWishlist(withP1, 'p1')
    expect(result.items).toHaveLength(1)
  })
  it('no muta el original', () => {
    addToWishlist(empty, 'p1')
    expect(empty.items).toHaveLength(0)
  })
})

describe('removeFromWishlist()', () => {
  it('elimina un producto existente', () => {
    expect(removeFromWishlist(withP1, 'p1').items).toHaveLength(0)
  })
  it('no falla si el producto no existe', () => {
    expect(removeFromWishlist(empty, 'p99').items).toHaveLength(0)
  })
})

describe('toggleWishlist()', () => {
  it('agrega si no está', () => {
    expect(toggleWishlist(empty, 'p1').items).toHaveLength(1)
  })
  it('elimina si ya está', () => {
    expect(toggleWishlist(withP1, 'p1').items).toHaveLength(0)
  })
})
