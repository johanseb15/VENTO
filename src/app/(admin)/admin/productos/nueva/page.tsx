// src/app/(admin)/admin/productos/nueva/page.tsx
import { requireAdmin } from '@lib/auth-utils'
import { ProductForm } from '@components/admin/ProductForm'
import prisma from '@lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Nuevo producto · Admin VENTO' }

export default async function NuevoProductoPage() {
  await requireAdmin()
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Nuevo producto</h1>
      <ProductForm categories={categories} mode="create" />
    </div>
  )
}
