import type { Metadata } from 'next'
import Link from 'next/link'
import { OrderService } from '@application/OrderService'
import { formatPrice } from '@domain/pricing'
import { requireAuth } from '@lib/auth-utils'
import { PrismaOrderRepository } from '@infrastructure/db/PrismaOrderRepository'
import { PrismaStockRepository } from '@infrastructure/db/PrismaStockRepository'
import { PrismaCouponRepository } from '@infrastructure/db/PrismaCouponRepository'
import { StripeGateway } from '@infrastructure/payments/StripeGateway'

export const metadata: Metadata = { title: 'Mis pedidos' }

const orderService = new OrderService(
  new PrismaOrderRepository(),
  new PrismaStockRepository(),
  new StripeGateway(),
  new PrismaCouponRepository(),
  { sendOrderConfirmation: async () => {} }
)

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  SHIPPED: 'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-stone-50 text-stone-700 border-stone-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default async function PedidosPage() {
  const session = await requireAuth()
  const orders = await orderService.getUserOrders(session.user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Mis pedidos</h1>
          <p className="mt-1 text-sm text-stone-500">Consulta estado, fecha y total de cada compra.</p>
        </div>
        <Link href="/productos" className="text-sm font-medium text-stone-700 underline-offset-4 hover:underline">
          Seguir comprando
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-stone-500">Todavia no realizaste ningun pedido.</p>
          <Link
            href="/productos"
            className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Ir al catalogo
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/dashboard/pedidos/${order.id}`}
                className="group flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5 transition hover:border-stone-300 hover:shadow-sm"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-stone-400">#{order.id.slice(-8).toUpperCase()}</span>
                  <span className="text-sm text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {' · '}
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                      STATUS_COLOR[order.status] ?? STATUS_COLOR['PENDING']
                    }`}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm font-semibold text-stone-900">{formatPrice(order.total)}</span>
                  <span className="text-stone-300 transition group-hover:text-stone-500">?</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

