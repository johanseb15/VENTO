// src/app/(admin)/admin/ordenes/page.tsx
import { requireAdmin } from '@lib/auth-utils'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminProductRepository'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminOrderRepository'
import { formatPrice } from '@domain/pricing'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pedidos · Admin VENTO' }

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository(),
)

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado',
  DELIVERED: 'Entregado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID:      'bg-green-50 text-green-700 border-green-200',
  SHIPPED:   'bg-blue-50 text-blue-700 border-blue-200',
  DELIVERED: 'bg-stone-50 text-stone-600 border-stone-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  REFUNDED:  'bg-purple-50 text-purple-700 border-purple-200',
}

export default async function AdminOrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string; status?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const page = Math.max(1, Number(params.pagina ?? '1'))
  const status = params.status

  const { orders, total } = await adminService.listOrders(page, 25, status)
  const totalPages = Math.ceil(total / 25)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Pedidos</h1>
          <p className="text-stone-400 text-sm mt-1">{total} pedidos</p>
        </div>
        {/* Filtros por estado */}
        <div className="flex gap-2 flex-wrap">
          {[undefined, 'PENDING', 'PAID', 'SHIPPED'].map(s => (
            <a key={s ?? 'all'} href={s ? `?status=${s}` : '?'}
              className={`text-xs px-3 py-1.5 rounded-full border transition font-medium
                ${status === s || (!status && !s)
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>
              {s ? STATUS_LABEL[s] : 'Todos'}
            </a>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['ID', 'Cliente', 'Items', 'Total', 'Estado', 'Fecha', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-stone-50 transition">
                <td className="px-4 py-3 font-mono text-xs text-stone-400">
                  #{order.id.slice(-8).toUpperCase()}
                </td>
                <td className="px-4 py-3">
                  <div className="text-stone-900 font-medium">{order.user.name ?? '—'}</div>
                  <div className="text-stone-400 text-xs">{order.user.email}</div>
                </td>
                <td className="px-4 py-3 text-stone-500">{order.itemCount}</td>
                <td className="px-4 py-3 font-medium text-stone-900">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium
                    ${STATUS_COLOR[order.status] ?? STATUS_COLOR['PENDING']}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {new Date(order.createdAt).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/ordenes/${order.id}`}
                    className="text-stone-400 hover:text-stone-900 transition text-xs font-medium">
                    Ver →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
