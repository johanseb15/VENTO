// src/app/api/webhooks/stripe/route.ts
// Stripe envía eventos POST a esta ruta cuando el pago se confirma
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@lib/prisma'
import { ResendMailer } from '@infrastructure/email/ResendMailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const mailer = new ResendMailer()

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent

      // 1. Buscar la orden por stripePaymentId
      const order = await prisma.order.findFirst({
        where: { stripePaymentId: intent.id },
        include: {
          items: { include: { product: true } },
          user: true,
        },
      })

      if (!order) {
        console.error('[Stripe Webhook] Order not found for payment:', intent.id)
        break
      }

      if (order.status !== 'PENDING') break // ya procesada

      // 2. Actualizar estado a PAID + descontar stock (transacción atómica)
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { status: 'PAID' },
        }),
        ...order.items.map((item: any) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          })
        ),
        // Incrementar uso del cupón si aplica
        ...(order.couponId
          ? [prisma.coupon.update({
              where: { id: order.couponId },
              data: { usedCount: { increment: 1 } },
            })]
          : []
        ),
      ])

      // 3. Enviar email de confirmación
      try {
        await mailer.sendOrderConfirmation(order.id)
      } catch (mailError) {
        // No fallar el webhook si el email falla
        console.error('[Stripe Webhook] Email failed:', mailError)
      }

      console.log('[Stripe Webhook] Order confirmed:', order.id)
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      await prisma.order.updateMany({
        where: { stripePaymentId: intent.id, status: 'PENDING' },
        data:  { status: 'CANCELLED' },
      })
      console.log('[Stripe Webhook] Payment failed:', intent.id)
      break
    }

    default:
      // Ignorar eventos no relevantes
      break
  }

  return NextResponse.json({ received: true })
}

// Stripe necesita el body raw — deshabilitar el body parsing de Next.js
export const config = { api: { bodyParser: false } }
