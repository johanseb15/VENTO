// src/infrastructure/payments/StripeGateway.ts
import Stripe from 'stripe'
import type { PaymentGateway } from '@application/OrderService'

const stripeSecret = process.env.STRIPE_SECRET_KEY

const stripe = new Stripe(stripeSecret ?? '', {
  apiVersion: '2024-06-20',
})

export class StripeGateway implements PaymentGateway {
  async createPaymentIntent(params: {
    amount: number
    currency: string
    metadata: Record<string, string>
  }) {
    if (!stripeSecret || stripeSecret.includes('...')) {
      throw new Error('Stripe no configurado: define STRIPE_SECRET_KEY valida en .env.local')
    }

    const intent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
      automatic_payment_methods: { enabled: true },
    })

    return {
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
    }
  }

  async confirmPayment(paymentIntentId: string) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return {
      success: intent.status === 'succeeded',
      error: intent.status !== 'succeeded' ? intent.status : undefined,
    }
  }
}
