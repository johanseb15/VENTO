// src/app/(admin)/admin/productos/[id]/page.tsx
import { requireAdmin } from '@lib/auth-utils'
import { ProductForm } from '@components/admin/ProductForm'
import prisma from '@lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editar producto · Admin VENTO' }

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-stone-900 mb-8">Editar: {product.name}</h1>
      <ProductForm
        categories={categories}
        mode="edit"
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          price: String(product.price / 100),
          stock: String(product.stock),
          categoryId: product.categoryId,
          isActive: product.isActive,
          images: product.images,
        }}
      />
    </div>
  )
}
