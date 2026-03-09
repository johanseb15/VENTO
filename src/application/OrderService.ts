// src/application/OrderService.ts
import { validateCartStock } from '@domain/inventory'
import { validateCoupon } from '@domain/coupon'
import { subtotal as calcSubtotal } from '@domain/cart'
import type { Cart } from '@domain/cart'
import type { Coupon } from '@domain/coupon'
import type { ShippingAddress } from '@domain/validation'

// Puertos
export interface OrderRepository {
  create(data: {
    userId: string
    items: { productId: string; quantity: number; price: number }[]
    subtotal: number
    discount: number
    total: number
    couponId?: string
    shippingAddress: ShippingAddress
    stripePaymentId: string
  }): Promise<{ id: string }>

  findByUser(userId: string): Promise<OrderSummary[]>
  findById(id: string, userId: string): Promise<OrderDetail | null>
}

export interface StockRepository {
  getStock(productIds: string[]): Promise<{ productId: string; stock: number }[]>
  deductStock(items: { productId: string; quantity: number }[]): Promise<void>
}

export interface PaymentGateway {
  createPaymentIntent(params: {
    amount: number
    currency: string
    metadata: Record<string, string>
  }): Promise<{ clientSecret: string; paymentIntentId: string }>

  confirmPayment(paymentIntentId: string): Promise<{
    success: boolean
    error?: string
  }>
}

export interface CouponRepository {
  findByCode(code: string): Promise<Coupon | null>
  incrementUsage(couponId: string): Promise<void>
}

export interface Mailer {
  sendOrderConfirmation(orderId: string): Promise<void>
}

export type OrderSummary = {
  id: string
  status: string
  total: number
  createdAt: Date
  itemCount: number
}

export type OrderDetail = {
  id: string
  status: string
  subtotal: number
  discount: number
  total: number
  shippingAddress: ShippingAddress
  items: { productName: string; quantity: number; price: number }[]
  createdAt: Date
}

export type CreateOrderResult =
  | { success: true; orderId: string; clientSecret: string }
  | { success: false; error: string; stockErrors?: { productId: string; available: number }[] }

export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly stockRepo: StockRepository,
    private readonly paymentGw: PaymentGateway,
    private readonly couponRepo: CouponRepository,
    private readonly mailer: Mailer
  ) {}

  async initiateCheckout(params: {
    userId: string
    cart: Cart
    couponCode?: string
    shippingAddress: ShippingAddress
  }): Promise<CreateOrderResult> {
    const { userId, cart, couponCode, shippingAddress } = params

    // 1. Verificar stock
    const stockData = await this.stockRepo.getStock(
      cart.items.map((i) => i.product.id)
    )
    const stockErrors = validateCartStock(
      cart.items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      stockData
    )
    if (stockErrors.length > 0) {
      return { success: false, error: 'Stock insuficiente', stockErrors }
    }

    // 2. Calcular precios
    const subtotalCents = calcSubtotal(cart)
    let discountAmount = 0
    let couponId: string | undefined

    // 3. Validar cupón (opcional)
    if (couponCode) {
      const coupon = await this.couponRepo.findByCode(couponCode.toUpperCase())
      if (!coupon) {
        return { success: false, error: 'El cupón no existe' }
      }
      const validation = validateCoupon(coupon, subtotalCents)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }
      discountAmount = validation.discountAmount
      couponId = coupon.id
    }

    const total = subtotalCents - discountAmount

    // 4. Crear Payment Intent en Stripe
    const payment = await this.paymentGw.createPaymentIntent({
      amount: total,
      currency: 'ars',
      metadata: { userId, couponCode: couponCode ?? '' },
    })

    // 5. Crear orden en DB (estado PENDING hasta que Stripe confirme)
    const order = await this.orderRepo.create({
      userId,
      items: cart.items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        price: i.product.price,
      })),
      subtotal: subtotalCents,
      discount: discountAmount,
      total,
      couponId,
      shippingAddress,
      stripePaymentId: payment.paymentIntentId,
    })

    return {
      success: true,
      orderId: order.id,
      clientSecret: payment.clientSecret,
    }
  }

  /** Llamado por el webhook de Stripe al confirmar el pago */
  async confirmOrder(stripePaymentId: string): Promise<void> {
    // En producción: buscar la orden por stripePaymentId,
    // descontar stock, marcar como PAID, enviar email
    console.log('[OrderService] Confirming order for payment:', stripePaymentId)
  }

  async getUserOrders(userId: string): Promise<OrderSummary[]> {
    return this.orderRepo.findByUser(userId)
  }

  async getOrderDetail(orderId: string, userId: string): Promise<OrderDetail | null> {
    return this.orderRepo.findById(orderId, userId)
  }
}
