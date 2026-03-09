import type { Product } from '@/application/ProductService'
import type { CartProduct } from '@/domain/cart'
import { resolveProductImage } from '@/lib/image'

export const toCartProduct = (product: Product): CartProduct => ({
  id: product.id,
  name: product.name,
  price: product.price,
  stock: product.stock,
  image: resolveProductImage(product.images[0]),
})
