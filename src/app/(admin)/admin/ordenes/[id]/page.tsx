import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@lib/auth-utils'
import { formatPrice } from '@domain/pricing'
import { OrderStatusForm } from '@components/admin/OrderStatusForm'
import prisma from '@lib/prisma'

type ShippingAddress = {
  fullName: string
  street: string
  city: string
  province: string
  postalCode: string
}

export const metadata: Metadata = { title: 'Pedido | Admin VENTO' }

export default async function AdminOrdenPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: { include: { product: { select: { name: true } } } },
    },
  })

  if (!order) notFound()

  const addr = order.shippingAddress as unknown as Partial<ShippingAddress>

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-stone-900">Pedido #{order.id.slice(-8).toUpperCase()}</h1>
      <p className="mb-8 text-sm text-stone-400">
        {new Date(order.createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-stone-100 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Cliente</h2>
          <p className="font-medium text-stone-900">{order.user.name ?? '-'}</p>
          <p className="text-sm text-stone-500">{order.user.email}</p>
        </div>

        <div className="rounded-xl border border-stone-100 bg-white p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-400">Envio</h2>
          <p className="text-sm text-stone-700">{addr.fullName}</p>
          <p className="text-sm text-stone-500">{addr.street}</p>
          <p className="text-sm text-stone-500">
            {addr.city}, {addr.province} {addr.postalCode}
          </p>
        </div>
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-stone-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-100 bg-stone-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-500">Producto</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wide text-stone-500">Cant.</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-stone-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {order.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-stone-900">{item.product.name}</td>
                <td className="px-4 py-3 text-center text-stone-500">{item.quantity}</td>
                <td className="px-4 py-3 text-right font-medium text-stone-900">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-stone-100 bg-stone-50">
            {order.discount > 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-2 text-sm text-stone-500">Descuento</td>
                <td className="px-4 py-2 text-right text-sm text-green-700">-{formatPrice(order.discount)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={2} className="px-4 py-3 font-semibold text-stone-900">Total</td>
              <td className="px-4 py-3 text-right font-semibold text-stone-900">{formatPrice(order.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="rounded-xl border border-stone-100 bg-white p-5">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-400">Estado del pedido</h2>
        <OrderStatusForm orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  )
}

