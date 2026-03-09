// src/app/(admin)/admin/productos/page.tsx
import { requireAdmin } from '@lib/auth-utils'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminProductRepository'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminOrderRepository'
import { formatPrice } from '@domain/pricing'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos · Admin VENTO' }

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository(),
)

export default async function AdminProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ pagina?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const page = Math.max(1, Number(params.pagina ?? '1'))
  const { products, total } = await adminService.listProducts(page, 20)
  const totalPages = Math.ceil(total / 20)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Productos</h1>
          <p className="text-stone-400 text-sm mt-1">{total} productos</p>
        </div>
        <Link href="/admin/productos/nueva"
          className="bg-stone-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-stone-800 transition">
          + Nuevo
        </Link>
      </div>

      <div className="bg-white border border-stone-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-100">
            <tr>
              {['Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-stone-50 transition">
                <td className="px-4 py-3 font-medium text-stone-900">{product.name}</td>
                <td className="px-4 py-3 text-stone-500">{product.category.name}</td>
                <td className="px-4 py-3 text-stone-700">{formatPrice(product.price)}</td>
                <td className="px-4 py-3">
                  <span className={product.stock === 0 ? 'text-red-600 font-medium' : 'text-stone-700'}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium
                    ${product.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/productos/${product.id}`}
                    className="text-stone-400 hover:text-stone-900 transition text-xs font-medium">
                    Editar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <a key={p} href={`?pagina=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition
                ${page === p ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
