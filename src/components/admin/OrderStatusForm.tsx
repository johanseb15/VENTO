'use client'
// src/components/admin/OrderStatusForm.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { value: 'PENDING',   label: 'Pendiente' },
  { value: 'PAID',      label: 'Pagado' },
  { value: 'SHIPPED',   label: 'Enviado' },
  { value: 'DELIVERED', label: 'Entregado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'REFUNDED',  label: 'Reembolsado' },
]

type Props = { orderId: string; currentStatus: string }

export function OrderStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (status === currentStatus) return
    setLoading(true)
    setSuccess(false)

    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    setLoading(false)
    setSuccess(true)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="flex items-center gap-3">
      <select value={status} onChange={e => setStatus(e.target.value)}
        className="border border-stone-200 rounded-lg px-3 py-2 text-sm outline-none
                   focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 transition">
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      <button onClick={handleSave} disabled={loading || status === currentStatus}
        className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium
                   hover:bg-stone-800 disabled:opacity-40 transition">
        {loading ? 'Guardando...' : 'Guardar'}
      </button>

      {success && (
        <span className="text-sm text-green-700" role="status">Estado actualizado ✓</span>
      )}
    </div>
  )
}
