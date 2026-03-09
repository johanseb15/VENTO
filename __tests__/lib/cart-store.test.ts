import { beforeEach, describe, expect, it } from 'vitest'
import { useCartStore } from '@/lib/cart-store'
import type { CartProduct } from '@/domain/cart'

const product: CartProduct = {
  id: 'p1',
  name: 'Remera Lino',
  price: 5000,
  stock: 3,
  image: '/img/remera.jpg',
}

describe('cart-store', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: { items: [] } })
  })

  it('starts empty', () => {
    const { cart } = useCartStore.getState()
    expect(cart.items).toHaveLength(0)
    expect(useCartStore.getState().subtotal()).toBe(0)
  })

  it('adds product and updates subtotal', () => {
    useCartStore.getState().add(product, 1)

    const { cart, subtotal } = useCartStore.getState()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.quantity).toBe(1)
    expect(subtotal()).toBe(5000)
  })

  it('does not exceed stock limit', () => {
    useCartStore.getState().add(product, 5)
    const { cart } = useCartStore.getState()
    expect(cart.items[0]?.quantity).toBe(3)
  })
})
