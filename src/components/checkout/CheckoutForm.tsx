'use client'

import { useState } from 'react'
import { useCartStore } from '@lib/cart-store'
import { formatPrice } from '@domain/pricing'

type ShippingFields = {
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
  phone: string
}

const emptyFields: ShippingFields = {
  fullName: '',
  street: '',
  city: '',
  province: '',
  postalCode: '',
  phone: '',
}

export function CheckoutForm() {
  const { cart, subtotal, clear } = useCartStore()
  const [fields, setFields] = useState<ShippingFields>(emptyFields)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState<{
    valid: boolean
    message: string
    discountAmount?: number
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update =
    (field: keyof ShippingFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [field]: e.target.value }))
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return

    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: couponCode.toUpperCase(),
        subtotal: subtotal(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setCouponResult({ valid: false, message: data.error })
      return
    }

    setCouponResult({
      valid: true,
      message: `Cupon aplicado - ${formatPrice(data.discountAmount)} de descuento`,
      discountAmount: data.discountAmount,
    })
  }

  const totalWithDiscount = subtotal() - (couponResult?.discountAmount ?? 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          shippingAddress: fields,
          couponCode: couponResult?.valid ? couponCode : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors)
        else setError(data.error ?? 'Error al procesar el pedido')
        return
      }

      clear()
      window.location.href = `/dashboard/pedidos/${data.orderId}`
    } catch {
      setError('No se pudo conectar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6">
      {([
        { id: 'fullName', label: 'Nombre completo', col: 'md:col-span-2', placeholder: 'Ana Garcia' },
        {
          id: 'street',
          label: 'Direccion de envio',
          col: 'md:col-span-2',
          placeholder: 'Av. Corrientes 1234, Piso 3',
        },
        { id: 'city', label: 'Ciudad', col: '', placeholder: 'Buenos Aires' },
        { id: 'province', label: 'Provincia', col: '', placeholder: 'CABA' },
        { id: 'postalCode', label: 'Codigo Postal', col: '', placeholder: '1043' },
        { id: 'phone', label: 'Telefono', col: '', placeholder: '+54 11 5555 6666' },
      ] as const).map(({ id, label, col, placeholder }) => (
        <div key={id} className={`flex flex-col gap-2 ${col}`}>
          <label htmlFor={id} className="text-xs font-bold uppercase text-slate-400">
            {label}
          </label>
          <input
            id={id}
            type="text"
            value={fields[id]}
            onChange={update(id)}
            placeholder={placeholder}
            aria-invalid={!!fieldErrors[id]}
            className="rounded-2xl bg-brand-sand/30 p-4 text-sm outline-none ring-brand-primary/20 transition focus:ring-2 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-300"
          />
          {fieldErrors[id] && (
            <span className="text-xs text-red-600" role="alert">
              {fieldErrors[id]}
            </span>
          )}
        </div>
      ))}

      <div className="md:col-span-2 bento-card border-brand-mint/70 bg-brand-mint/15">
        <h2 className="mb-3 text-xs font-bold uppercase text-slate-500">Cupon</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase())
              setCouponResult(null)
            }}
            placeholder="Ej: VENTO20"
            className="flex-1 rounded-2xl bg-white px-3 py-3 text-sm font-mono outline-none ring-brand-primary/20 transition focus:ring-2"
          />
          <button
            type="button"
            onClick={applyCoupon}
            disabled={!couponCode.trim()}
            className="rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium transition hover:bg-stone-50 disabled:opacity-40"
          >
            Aplicar
          </button>
        </div>
        {couponResult && (
          <p className={`mt-2 text-sm ${couponResult.valid ? 'text-green-700' : 'text-red-600'}`} role="alert">
            {couponResult.message}
          </p>
        )}
      </div>

      <section className="md:col-span-2 bento-card bg-white/70">
        <h2 className="mb-4 font-serif text-2xl text-text-main">Resumen</h2>
        <div className="flex flex-col gap-2">
          {cart.items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm text-slate-600">
              <span className="max-w-[240px] truncate">
                {product.name} x {quantity}
              </span>
              <span>{formatPrice(product.price * quantity)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-stone-200 pt-4">
          <div className="mb-1 flex justify-between text-sm text-slate-500">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal())}</span>
          </div>
          {couponResult?.valid && couponResult.discountAmount && (
            <div className="mb-1 flex justify-between text-sm text-green-700">
              <span>Descuento ({couponCode})</span>
              <span>-{formatPrice(couponResult.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold text-text-main">
            <span>Total</span>
            <span>{formatPrice(totalWithDiscount)}</span>
          </div>
        </div>
      </section>

      {error && (
        <p
          className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="md:col-span-2 mt-2">
        <button
          type="submit"
          disabled={loading || cart.items.length === 0}
          className="w-full rounded-full bg-brand-rose py-5 font-bold text-text-main shadow-xl shadow-brand-rose/20 transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Procesando...' : `Proceder al Pago Seguro - ${formatPrice(totalWithDiscount)}`}
        </button>
      </div>
    </form>
  )
}
