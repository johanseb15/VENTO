import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ProductService } from '@/application/ProductService'
import { ReviewService } from '@/application/ReviewService'
import { PrismaProductRepository } from '@/infrastructure/db/PrismaProductRepository'
import { PrismaReviewRepository } from '@/infrastructure/db/PrismaReviewRepository'
import { formatPrice } from '@/domain/pricing'
import { ProductDetailActions } from '@/components/shop/ProductDetailActions'
import { ReviewList } from '@/components/reviews/ReviewList'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import { resolveProductImage } from '@/lib/image'
import { auth } from '@/lib/auth'

const productService = new ProductService(new PrismaProductRepository())
const reviewService = new ReviewService(new PrismaReviewRepository())

type Props = {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const product = await productService.getBySlug(id)
  const session = await auth()

  if (!product) notFound()

  const { reviews } = await reviewService.getProductReviews(product.id)

  const [primaryImage, ...secondaryImages] = product.images
  const mainImage = resolveProductImage(primaryImage)

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-32">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bento-card relative col-span-2 h-[500px] overflow-hidden p-0">
            <Image
              src={mainImage}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="bento-card relative h-40 overflow-hidden bg-brand-rose/20 p-0">
            <Image
              src={resolveProductImage(secondaryImages[0] || primaryImage)}
              alt={`${product.name} detalle 1`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="bento-card relative h-40 overflow-hidden bg-brand-mint/30 p-0">
            <Image
              src={resolveProductImage(secondaryImages[1] || primaryImage)}
              alt={`${product.name} detalle 2`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span className="mb-2 text-xs font-bold tracking-[0.2em] text-brand-primary">
            LIMITED EDITION
          </span>
          <h1 className="mb-4 font-serif text-5xl text-text-main">{product.name}</h1>
          <p className="mb-6 text-2xl text-slate-700">{formatPrice(product.price)}</p>
          <p className="mb-8 leading-relaxed text-slate-500">
            {product.description ||
              'Confeccionado artesanalmente con fibras naturales y terminaciones premium para uso diario duradero.'}
          </p>

          <ProductDetailActions product={product} />
        </div>
      </div>

      <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="bento-card">
          <h2 className="mb-5 font-serif text-2xl text-text-main">Resenas</h2>
          <ReviewList reviews={reviews} />
        </div>

        <div className="bento-card">
          <h2 className="mb-5 font-serif text-2xl text-text-main">Tu opinion</h2>
          {session?.user ? (
            <ReviewForm productId={product.id} />
          ) : (
            <p className="text-sm text-slate-500">
              Inicia sesion para publicar una resena de este producto.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
