import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '@components/shop/ProductCard'
import { useCartStore } from '@/lib/cart-store'
import type { Product } from '@application/ProductService'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Remera Vento Classic',
  slug: 'remera-vento-classic',
  description: 'Remera de algodon premium',
  price: 4500,
  stock: 10,
  images: ['/img/remera.jpg'],
  category: { id: 'c1', name: 'Remeras', slug: 'remeras' },
  ...overrides,
})

describe('<ProductCard />', () => {
  beforeEach(() => {
    useCartStore.setState({ cart: { items: [] } })
  })

  it('muestra el nombre, precio y categoria del producto', () => {
    render(<ProductCard product={makeProduct()} />)
    expect(screen.getByText('Remera Vento Classic')).toBeInTheDocument()
    expect(screen.getByText('Remeras')).toBeInTheDocument()
    expect(screen.getByText(/45/)).toBeInTheDocument()
  })

  it('muestra badge agotado y deshabilita el boton cuando stock es 0', () => {
    render(<ProductCard product={makeProduct({ stock: 0 })} />)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
    expect(screen.getByText('Sin stock')).toBeDisabled()
  })

  it('agrega el producto al carrito al hacer click', async () => {
    const user = userEvent.setup()
    render(<ProductCard product={makeProduct()} />)

    await user.click(screen.getByRole('button', { name: /agregar/i }))

    const { cart } = useCartStore.getState()
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]?.product.id).toBe('p1')
    expect(cart.items[0]?.quantity).toBe(1)
  })

  it('tiene aria-label accesible en el boton', () => {
    render(<ProductCard product={makeProduct()} />)
    expect(
      screen.getByRole('button', { name: /agregar remera vento classic al carrito/i })
    ).toBeInTheDocument()
  })
})
