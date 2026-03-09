// src/app/(admin)/admin/page.tsx
import type { Metadata } from 'next'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminRepositories'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminRepositories'
import { formatPrice } from '@domain/pricing'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Admin — Dashboard' }

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository()
)

export default async function AdminDashboardPage() {
  const [metrics, { orders }, { products }] = await Promise.all([
    adminService.getDashboard(),
    adminService.listOrders(undefined, 1),
    adminService.listProducts(1),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-stone-400 text-sm mt-1">Panel de administración VENTO</p>
        </div>
        <Link
          href="/admin/productos/nueva"
          className="bg-stone-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-stone-800 transition"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Revenue total', value: formatPrice(metrics.totalRevenue), accent: false },
          { label: 'Órdenes completadas', value: String(metrics.totalOrders), accent: false },
          { label: 'Ticket promedio', value: formatPrice(metrics.avgOrderValue), accent: false },
          { label: 'Pendientes de pago', value: String(metrics.pendingOrders), accent: metrics.pendingOrders > 0 },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white border border-stone-100 rounded-xl p-5">
            <p className="text-xs text-stone-400 mb-1">{label}</p>
            <p className={`text-2xl font-semibold ${accent ? 'text-amber-600' : 'text-stone-900'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Últimas órdenes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">Últimas órdenes</h2>
            <Link href="/admin/ordenes" className="text-xs text-stone-400 hover:text-stone-700 transition">
              Ver todas →
            </Link>
          </div>
          <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
            {orders.slice(0, 5).map((order, i) => (
              <Link
                key={order.id}
                href={`/admin/ordenes/${order.id}`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition
                  ${i < orders.slice(0,5).length - 1 ? 'border-b border-stone-50' : ''}`}
              >
                <div>
                  <p className="text-xs font-mono text-stone-500">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-stone-400">{order.user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-stone-900">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos con bajo stock */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-stone-900">Stock bajo</h2>
            <Link href="/admin/productos" className="text-xs text-stone-400 hover:text-stone-700 transition">
              Ver todos →
            </Link>
          </div>
          <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
            {products
              .filter((p) => p.stock <= 5)
              .slice(0, 5)
              .map((product, i, arr) => (
                <Link
                  key={product.id}
                  href={`/admin/productos/${product.id}`}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition
                    ${i < arr.length - 1 ? 'border-b border-stone-50' : ''}`}
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900 truncate max-w-[200px]">{product.name}</p>
                    <p className="text-xs text-stone-400">{product.category.name}</p>
                  </div>
                  <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : 'text-amber-600'}`}>
                    {product.stock === 0 ? 'Agotado' : `${product.stock} unid.`}
                  </span>
                </Link>
              ))}
            {products.filter((p) => p.stock <= 5).length === 0 && (
              <p className="px-5 py-4 text-sm text-stone-400">Todo el stock está en orden.</p>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING:   'bg-amber-50 text-amber-700',
    PAID:      'bg-green-50 text-green-700',
    SHIPPED:   'bg-blue-50 text-blue-700',
    DELIVERED: 'bg-stone-50 text-stone-600',
    CANCELLED: 'bg-red-50 text-red-600',
    REFUNDED:  'bg-purple-50 text-purple-600',
  }
  const labels: Record<string, string> = {
    PENDING: 'Pendiente', PAID: 'Pagado', SHIPPED: 'Enviado',
    DELIVERED: 'Entregado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? styles['PENDING']}`}>
      {labels[status] ?? status}
    </span>
  )
}
