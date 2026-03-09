// __tests__/domain/cart.test.ts
import { describe, it, expect } from 'vitest'
import {
  addItem, removeItem, updateQuantity, clearCart,
  itemCount, subtotal, isEmpty,
  type Cart, type CartProduct,
} from '@domain/cart'

const makeProduct = (overrides: Partial<CartProduct> = {}): CartProduct => ({
  id: 'p1',
  name: 'Remera Vento Classic',
  price: 4500,
  stock: 10,
  image: '/img/remera.jpg',
  ...overrides,
})

const emptyCart: Cart = { items: [] }

// ── addItem ───────────────────────────────────

describe('addItem()', () => {
  it('agrega un producto nuevo al carrito vacío', () => {
    const product = makeProduct()
    const cart = addItem(emptyCart, product)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.product.id).toBe('p1')
    expect(cart.items[0]?.quantity).toBe(1)
  })

  it('incrementa la cantidad si el producto ya existe', () => {
    const product = makeProduct()
    const cart = addItem(addItem(emptyCart, product), product)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.quantity).toBe(2)
  })

  it('no supera el stock disponible al agregar', () => {
    const product = makeProduct({ stock: 3 })
    const cart = addItem(emptyCart, product, 10)
    expect(cart.items[0]?.quantity).toBe(3)
  })

  it('no agrega un producto sin stock', () => {
    const product = makeProduct({ stock: 0 })
    const cart = addItem(emptyCart, product)
    expect(cart.items).toHaveLength(0)
  })

  it('no modifica el carrito original (inmutabilidad)', () => {
    const product = makeProduct()
    addItem(emptyCart, product)
    expect(emptyCart.items).toHaveLength(0)
  })
})

// ── removeItem ────────────────────────────────

describe('removeItem()', () => {
  it('elimina el producto del carrito', () => {
    const cart = addItem(emptyCart, makeProduct())
    const result = removeItem(cart, 'p1')
    expect(result.items).toHaveLength(0)
  })

  it('no falla si el producto no existe en el carrito', () => {
    const result = removeItem(emptyCart, 'no-existe')
    expect(result.items).toHaveLength(0)
  })

  it('elimina solo el producto correcto si hay varios', () => {
    const p1 = makeProduct({ id: 'p1' })
    const p2 = makeProduct({ id: 'p2', name: 'Jean Slim' })
    const cart = addItem(addItem(emptyCart, p1), p2)
    const result = removeItem(cart, 'p1')
    expect(result.items).toHaveLength(1)
    expect(result.items[0]?.product.id).toBe('p2')
  })
})

// ── updateQuantity ────────────────────────────

describe('updateQuantity()', () => {
  it('actualiza la cantidad de un producto', () => {
    const cart = addItem(emptyCart, makeProduct())
    const result = updateQuantity(cart, 'p1', 5)
    expect(result.items[0]?.quantity).toBe(5)
  })

  it('elimina el item si la cantidad es 0', () => {
    const cart = addItem(emptyCart, makeProduct())
    const result = updateQuantity(cart, 'p1', 0)
    expect(result.items).toHaveLength(0)
  })

  it('elimina el item si la cantidad es negativa', () => {
    const cart = addItem(emptyCart, makeProduct())
    const result = updateQuantity(cart, 'p1', -1)
    expect(result.items).toHaveLength(0)
  })

  it('no supera el stock disponible', () => {
    const product = makeProduct({ stock: 4 })
    const cart = addItem(emptyCart, product)
    const result = updateQuantity(cart, 'p1', 99)
    expect(result.items[0]?.quantity).toBe(4)
  })
})

// ── Queries ───────────────────────────────────

describe('itemCount()', () => {
  it('cuenta el total de unidades en el carrito', () => {
    const p1 = makeProduct({ id: 'p1' })
    const p2 = makeProduct({ id: 'p2', stock: 5 })
    const cart = addItem(addItem(emptyCart, p1, 3), p2, 2)
    expect(itemCount(cart)).toBe(5)
  })

  it('carrito vacío devuelve 0', () => {
    expect(itemCount(emptyCart)).toBe(0)
  })
})

describe('subtotal()', () => {
  it('calcula el subtotal correctamente en centavos', () => {
    const p1 = makeProduct({ id: 'p1', price: 4500 })
    const p2 = makeProduct({ id: 'p2', price: 3200, stock: 5 })
    const cart = addItem(addItem(emptyCart, p1, 2), p2, 1)
    expect(subtotal(cart)).toBe(12200) // 9000 + 3200
  })
})

describe('isEmpty()', () => {
  it('devuelve true para carrito vacío', () => {
    expect(isEmpty(emptyCart)).toBe(true)
  })

  it('devuelve false cuando hay items', () => {
    const cart = addItem(emptyCart, makeProduct())
    expect(isEmpty(cart)).toBe(false)
  })
})

describe('clearCart()', () => {
  it('devuelve un carrito vacío', () => {
    const cart = addItem(emptyCart, makeProduct())
    expect(isEmpty(clearCart())).toBe(true)
  })
})
