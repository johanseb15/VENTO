// src/app/(admin)/admin/dashboard/page.tsx
import { requireAdmin } from '@lib/auth-utils'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminProductRepository'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminOrderRepository'
import { formatPrice } from '@domain/pricing'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard · Admin VENTO' }

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository(),
)

export default async function AdminDashboardPage() {
  await requireAdmin()
  const stats = await adminService.getDashboardStats()

  const cards = [
    { label: 'Ingresos totales',       value: formatPrice(stats.totalRevenue),    href: '/admin/ordenes' },
    { label: 'Pedidos totales',        value: String(stats.totalOrders),          href: '/admin/ordenes' },
    { label: 'Pedidos pendientes',     value: String(stats.pendingOrders),        href: '/admin/ordenes?status=PENDING' },
    { label: 'Productos activos',      value: String(stats.totalProducts),        href: '/admin/productos' },
    { label: 'Ingresos este mes',      value: formatPrice(stats.revenueThisMonth),href: '/admin/ordenes' },
    { label: 'Pedidos este mes',       value: String(stats.ordersThisMonth),      href: '/admin/ordenes' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map(({ label, value, href }) => (
          <Link key={label} href={href}
            className="bg-white border border-stone-100 rounded-xl p-6 hover:border-stone-300 transition group">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">{label}</p>
            <p className="text-2xl font-semibold text-stone-900 group-hover:text-stone-700 transition">
              {value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/productos/nueva"
          className="flex items-center gap-3 p-5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition">
          <span className="text-2xl">+</span>
          <div>
            <p className="font-medium">Nuevo producto</p>
            <p className="text-stone-400 text-sm">Agregar al catálogo</p>
          </div>
        </Link>
        <Link href="/admin/ordenes"
          className="flex items-center gap-3 p-5 bg-white border border-stone-100 rounded-xl hover:border-stone-300 transition">
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-medium text-stone-900">Ver pedidos</p>
            <p className="text-stone-400 text-sm">Gestionar órdenes</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
