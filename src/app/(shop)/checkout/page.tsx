// src/app/(shop)/checkout/page.tsx
import type { Metadata } from 'next'
import { CheckoutForm } from '@components/checkout/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 pb-20 pt-32">
      <div className="bento-card">
        <h1 className="mb-8 font-serif text-3xl text-text-main">Finalizar Pedido</h1>
        <CheckoutForm />
      </div>
    </main>
  )
}
