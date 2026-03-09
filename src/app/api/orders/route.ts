import { NextRequest, NextResponse } from 'next/server'
import { OrderService } from '@application/OrderService'
import { PrismaOrderRepository } from '@infrastructure/db/PrismaOrderRepository'
import { PrismaStockRepository } from '@infrastructure/db/PrismaStockRepository'
import { PrismaCouponRepository } from '@infrastructure/db/PrismaCouponRepository'
import { StripeGateway } from '@infrastructure/payments/StripeGateway'
import { validateShippingAddress } from '@domain/validation'
import { requireAuthAPI } from '@lib/auth-utils'

const noopMailer = { sendOrderConfirmation: async (_id: string) => {} }

const orderService = new OrderService(
  new PrismaOrderRepository(),
  new PrismaStockRepository(),
  new StripeGateway(),
  new PrismaCouponRepository(),
  noopMailer
)

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireAuthAPI()
    if (error) return error

    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { cart, shippingAddress, couponCode } = await req.json()

    const addrValidation = validateShippingAddress(shippingAddress)
    if (!addrValidation.success) {
      return NextResponse.json(
        { error: 'Direccion invalida', fieldErrors: addrValidation.errors },
        { status: 400 }
      )
    }

    const result = await orderService.initiateCheckout({
      userId,
      cart,
      couponCode,
      shippingAddress: addrValidation.data,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, stockErrors: result.stockErrors },
        { status: result.stockErrors ? 409 : 400 }
      )
    }

    return NextResponse.json(
      {
        orderId: result.orderId,
        clientSecret: result.clientSecret,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/orders]', error)
    const message = error instanceof Error ? error.message : 'Error interno del servidor'

    if (message.toLowerCase().includes('stripe no configurado')) {
      return NextResponse.json({ error: message }, { status: 503 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  const { session, error } = await requireAuthAPI()
  if (error) return error

  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ orders: [] }, { status: 200 })

  const orders = await orderService.getUserOrders(userId)
  return NextResponse.json({ orders })
}
