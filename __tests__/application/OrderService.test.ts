// __tests__/application/OrderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderService } from '@application/OrderService'
import type {
  OrderRepository, StockRepository,
  PaymentGateway, CouponRepository, Mailer,
} from '@application/OrderService'
import type { Cart } from '@domain/cart'
import type { ShippingAddress } from '@domain/validation'

// ── Mocks ─────────────────────────────────────
const orderRepo: OrderRepository = {
  create: vi.fn(),
  findByUser: vi.fn(),
  findById: vi.fn(),
}
const stockRepo: StockRepository = {
  getStock: vi.fn(),
  deductStock: vi.fn(),
}
const paymentGw: PaymentGateway = {
  createPaymentIntent: vi.fn(),
  confirmPayment: vi.fn(),
}
const couponRepo: CouponRepository = {
  findByCode: vi.fn(),
  incrementUsage: vi.fn(),
}
const mailer: Mailer = {
  sendOrderConfirmation: vi.fn(),
}

const sut = new OrderService(orderRepo, stockRepo, paymentGw, couponRepo, mailer)

const cart: Cart = {
  items: [
    { product: { id: 'p1', name: 'Remera', price: 4500, stock: 10, image: '' }, quantity: 2 },
  ],
}

const address: ShippingAddress = {
  fullName: 'Ana García',
  street: 'Av. Corrientes 1234',
  city: 'CABA',
  province: 'Buenos Aires',
  postalCode: '1043',
  phone: '+5491155556666',
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ── initiateCheckout ──────────────────────────

describe('OrderService.initiateCheckout()', () => {

  it('crea orden y devuelve clientSecret cuando hay stock', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 10 }])
    vi.mocked(paymentGw.createPaymentIntent).mockResolvedValue({
      clientSecret: 'pi_secret_xxx',
      paymentIntentId: 'pi_xxx',
    })
    vi.mocked(orderRepo.create).mockResolvedValue({ id: 'order_1' })

    const result = await sut.initiateCheckout({
      userId: 'u1', cart, shippingAddress: address,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.clientSecret).toBe('pi_secret_xxx')
      expect(result.orderId).toBe('order_1')
    }
  })

  it('rechaza cuando no hay suficiente stock', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 1 }])

    const result = await sut.initiateCheckout({
      userId: 'u1', cart, shippingAddress: address,
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toMatch(/stock/i)
      expect(result.stockErrors).toHaveLength(1)
    }
    expect(paymentGw.createPaymentIntent).not.toHaveBeenCalled()
    expect(orderRepo.create).not.toHaveBeenCalled()
  })

  it('aplica cupón válido y descuenta del total', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 10 }])
    vi.mocked(couponRepo.findByCode).mockResolvedValue({
      id: 'c1', code: 'VENTO20', type: 'PERCENT', value: 20,
      minPurchase: null, maxUses: null, usedCount: 0,
      expiresAt: null, isActive: true,
    })
    vi.mocked(paymentGw.createPaymentIntent).mockResolvedValue({
      clientSecret: 'pi_secret_yyy', paymentIntentId: 'pi_yyy',
    })
    vi.mocked(orderRepo.create).mockResolvedValue({ id: 'order_2' })

    await sut.initiateCheckout({
      userId: 'u1', cart, couponCode: 'VENTO20', shippingAddress: address,
    })

    // Subtotal: 4500 * 2 = 9000. Descuento 20% = 1800. Total = 7200
    const createCall = vi.mocked(paymentGw.createPaymentIntent).mock.calls[0]?.[0]
    expect(createCall?.amount).toBe(7200)
  })

  it('rechaza cupón inexistente', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 10 }])
    vi.mocked(couponRepo.findByCode).mockResolvedValue(null)

    const result = await sut.initiateCheckout({
      userId: 'u1', cart, couponCode: 'INVALIDO', shippingAddress: address,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/no existe/)
    expect(paymentGw.createPaymentIntent).not.toHaveBeenCalled()
  })

  it('rechaza cupón vencido', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 10 }])
    vi.mocked(couponRepo.findByCode).mockResolvedValue({
      id: 'c2', code: 'OLD10', type: 'PERCENT', value: 10,
      minPurchase: null, maxUses: null, usedCount: 0,
      expiresAt: new Date('2020-01-01'), isActive: true,
    })

    const result = await sut.initiateCheckout({
      userId: 'u1', cart, couponCode: 'OLD10', shippingAddress: address,
    })

    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toMatch(/vencido/)
  })

  it('no llama al repo de órdenes si el pago falla', async () => {
    vi.mocked(stockRepo.getStock).mockResolvedValue([{ productId: 'p1', stock: 10 }])
    vi.mocked(paymentGw.createPaymentIntent).mockRejectedValue(
      new Error('Stripe error')
    )

    await expect(
      sut.initiateCheckout({ userId: 'u1', cart, shippingAddress: address })
    ).rejects.toThrow('Stripe error')

    expect(orderRepo.create).not.toHaveBeenCalled()
  })
})

// ── getUserOrders ─────────────────────────────

describe('OrderService.getUserOrders()', () => {
  it('devuelve los pedidos del usuario', async () => {
    const mockOrders = [
      { id: 'o1', status: 'PAID', total: 9000, createdAt: new Date(), itemCount: 2 },
    ]
    vi.mocked(orderRepo.findByUser).mockResolvedValue(mockOrders)

    const result = await sut.getUserOrders('u1')
    expect(result).toHaveLength(1)
    expect(result[0]?.status).toBe('PAID')
  })
})
