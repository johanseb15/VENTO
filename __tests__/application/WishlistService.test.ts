// __tests__/application/WishlistService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WishlistService } from '@application/WishlistService'
import type { WishlistRepository } from '@application/WishlistService'

const repo: WishlistRepository = {
  findByUser:          vi.fn(),
  addProduct:          vi.fn(),
  removeProduct:       vi.fn(),
  findProductsDetail:  vi.fn(),
}
const sut = new WishlistService(repo)

beforeEach(() => vi.clearAllMocks())

describe('WishlistService.toggle()', () => {
  it('agrega el producto si no estaba en la wishlist', async () => {
    vi.mocked(repo.findByUser).mockResolvedValue({ items: [] })
    vi.mocked(repo.addProduct).mockResolvedValue()

    const result = await sut.toggle('u1', 'p1')
    expect(result.isWishlisted).toBe(true)
    expect(repo.addProduct).toHaveBeenCalledWith('u1', 'p1')
    expect(repo.removeProduct).not.toHaveBeenCalled()
  })

  it('elimina el producto si ya estaba en la wishlist', async () => {
    vi.mocked(repo.findByUser).mockResolvedValue({
      items: [{ productId: 'p1', addedAt: new Date() }],
    })
    vi.mocked(repo.removeProduct).mockResolvedValue()

    const result = await sut.toggle('u1', 'p1')
    expect(result.isWishlisted).toBe(false)
    expect(repo.removeProduct).toHaveBeenCalledWith('u1', 'p1')
    expect(repo.addProduct).not.toHaveBeenCalled()
  })
})

describe('WishlistService.isWishlisted()', () => {
  it('retorna true si el producto está en la wishlist', async () => {
    vi.mocked(repo.findByUser).mockResolvedValue({
      items: [{ productId: 'p1', addedAt: new Date() }],
    })
    expect(await sut.isWishlisted('u1', 'p1')).toBe(true)
  })
  it('retorna false si no está', async () => {
    vi.mocked(repo.findByUser).mockResolvedValue({ items: [] })
    expect(await sut.isWishlisted('u1', 'p1')).toBe(false)
  })
})
