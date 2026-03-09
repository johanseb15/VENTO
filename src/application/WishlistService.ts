// src/application/WishlistService.ts
import { isInWishlist, toggleWishlist, type Wishlist } from '@domain/wishlist'

export interface WishlistRepository {
  findByUser(userId: string): Promise<Wishlist>
  addProduct(userId: string, productId: string): Promise<void>
  removeProduct(userId: string, productId: string): Promise<void>
  findProductsDetail(productIds: string[]): Promise<WishlistProduct[]>
}

export type WishlistProduct = {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  stock: number
  category: { name: string }
}

export class WishlistService {
  constructor(private readonly repo: WishlistRepository) {}

  async getUserWishlist(userId: string): Promise<{
    items: (WishlistProduct & { addedAt: Date })[]
  }> {
    const wishlist = await this.repo.findByUser(userId)
    if (wishlist.items.length === 0) return { items: [] }

    const products = await this.repo.findProductsDetail(
      wishlist.items.map(i => i.productId)
    )

    return {
      items: products.map(p => ({
        ...p,
        addedAt: wishlist.items.find(i => i.productId === p.id)!.addedAt,
      })),
    }
  }

  async toggle(userId: string, productId: string): Promise<{ isWishlisted: boolean }> {
    const wishlist = await this.repo.findByUser(userId)
    const alreadyIn = isInWishlist(wishlist, productId)

    if (alreadyIn) {
      await this.repo.removeProduct(userId, productId)
    } else {
      await this.repo.addProduct(userId, productId)
    }

    return { isWishlisted: !alreadyIn }
  }

  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.repo.findByUser(userId)
    return isInWishlist(wishlist, productId)
  }
}
