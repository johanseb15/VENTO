import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SearchService } from '@application/SearchService'
import type { Product } from '@application/ProductService'
import { parseSearchParams } from '@domain/search'
import { PrismaSearchRepository } from '@infrastructure/db/PrismaSearchRepository'
import { ProductCard } from '@components/shop/ProductCard'
import { SearchBar } from '@components/search/SearchBar'

export const metadata: Metadata = { title: 'Buscar | VENTO' }

const searchService = new SearchService(new PrismaSearchRepository())

type Props = { searchParams: Promise<Record<string, string | undefined>> }

export default async function BuscarPage({ searchParams }: Props) {
  const params = await searchParams
  const query = parseSearchParams(params)
  const result = query.q ? await searchService.search(query) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Buscar</h1>

      <div className="mb-8 max-w-xl">
        <Suspense>
          <SearchBar initialValue={query.q} />
        </Suspense>
      </div>

      {result === null && (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-6 text-sm text-stone-500">
          Escribi algo para buscar en el catalogo.
        </div>
      )}

      {result && !result.isValid && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Ingresa al menos 2 caracteres para buscar.
        </div>
      )}

      {result?.isValid && result.total === 0 && (
        <p className="text-sm text-stone-500">
          No encontramos resultados para <strong>"{query.q}"</strong>.
        </p>
      )}

      {result?.isValid && result.total > 0 && (
        <>
          <p className="mb-6 text-sm text-stone-400">
            {result.total} resultado{result.total !== 1 ? 's' : ''} para{' '}
            <strong className="text-stone-700">"{query.q}"</strong>
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {result.results.map((product) => {
              const cardProduct: Product = {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: null,
                price: product.price,
                stock: product.stock,
                images: product.images,
                category: { id: 'search', slug: 'search', name: product.categoryName },
              }

              return <ProductCard key={product.id} product={cardProduct} />
            })}
          </div>
        </>
      )}
    </div>
  )
}

