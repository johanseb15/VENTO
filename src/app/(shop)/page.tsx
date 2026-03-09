import { ProductService, type Product } from '@/application/ProductService'
import { PrismaProductRepository } from '@/infrastructure/db/PrismaProductRepository'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ProductCard } from '@/components/shop/ProductCard'

const productService = new ProductService(new PrismaProductRepository())

const fallbackProducts: Product[] = [
  {
    id: 'fallback-1',
    name: 'Tote Bag Lino',
    slug: 'tote-bag-lino',
    description: null,
    price: 12000,
    stock: 0,
    images: ['/images/product-placeholder.svg'],
    category: { id: 'acc', name: 'Accesorios', slug: 'accesorios' },
  },
  {
    id: 'fallback-2',
    name: 'Vestido Petalo',
    slug: 'vestido-petalo',
    description: null,
    price: 45000,
    stock: 0,
    images: ['/images/product-placeholder.svg'],
    category: { id: 'verano', name: 'Coleccion Verano', slug: 'coleccion-verano' },
  },
  {
    id: 'fallback-3',
    name: 'Cardigan Lana',
    slug: 'cardigan-lana',
    description: null,
    price: 32000,
    stock: 0,
    images: ['/images/product-placeholder.svg'],
    category: { id: 'invierno', name: 'Invierno', slug: 'invierno' },
  },
  {
    id: 'fallback-4',
    name: 'Sombrero Sol',
    slug: 'sombrero-sol',
    description: null,
    price: 8500,
    stock: 0,
    images: ['/images/product-placeholder.svg'],
    category: { id: 'acc', name: 'Accesorios', slug: 'accesorios' },
  },
]

export default async function Home() {
  let products = fallbackProducts

  try {
    const result = await productService.list({}, 'newest', 1, 8)
    if (result.products.length > 0) products = result.products
  } catch {
    products = fallbackProducts
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
      <section className="mb-10 grid gap-6 md:grid-cols-12">
        <div className="bento-card organic-bg md:col-span-8">
          <p className="text-xs font-bold tracking-[0.18em] text-brand-primary">VENTO SELECTION</p>
          <h1 className="mt-2 font-serif text-5xl text-text-main">Slow Fashion with botanical soul.</h1>
          <p className="mt-4 max-w-2xl text-slate-600">
            Piezas de lino, algodon y fibras nobles disenadas para durar anos, no temporadas.
          </p>
        </div>
        <div className="bento-card bg-brand-rose/25 md:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Capsula</p>
          <p className="mt-2 font-serif text-3xl">Edicion limitada</p>
          <p className="mt-3 text-sm text-slate-600">Tonos tierra, cortes sueltos y terminaciones artesanales.</p>
        </div>
      </section>

      <ProductGrid>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </main>
  )
}
