import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductService } from '@application/ProductService'
import { PrismaProductRepository } from '@infrastructure/db/PrismaProductRepository'
import { ProductCard } from '@components/shop/ProductCard'
import { ProductFilters } from '@components/shop/ProductFilters'
import { parseFilterFromParams } from '@domain/catalog'
import type { SortOption } from '@domain/catalog'
import prisma from '@lib/prisma'

export const metadata: Metadata = { title: 'Productos' }

const productService = new ProductService(new PrismaProductRepository())

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams
  const filter = parseFilterFromParams(params)
  const sort = ((Array.isArray(params['sort']) ? params['sort'][0] : params['sort']) ??
    'newest') as SortOption
  const page = Math.max(1, Number(params['pagina'] ?? '1'))

  const [{ products, total, totalPages }, categories] = await Promise.all([
    productService.list(filter, sort, page),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const paramsForLinks = Object.fromEntries(
    Object.entries(params).filter(([, value]) => typeof value === 'string')
  ) as Record<string, string>

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <Suspense>
            <ProductFilters categories={categories} />
          </Suspense>
        </aside>

        <section className="lg:col-span-9">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-4xl text-text-main">Nuestra Seleccion</h1>
              <p className="mt-2 text-sm text-slate-500">{total} productos disponibles</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="bento-card py-16 text-center text-slate-500">
              No hay productos que coincidan con los filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`?${new URLSearchParams({ ...paramsForLinks, pagina: String(p) })}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm transition
                    ${
                      page === p
                        ? 'bg-text-main font-semibold text-white'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
