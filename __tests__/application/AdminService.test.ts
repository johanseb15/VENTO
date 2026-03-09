// __tests__/application/AdminService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminService } from '@application/AdminService'
import type { AdminProductRepository, AdminOrderRepository } from '@application/AdminService'

const productRepo: AdminProductRepository = {
  findAll:     vi.fn(),
  findById:    vi.fn(),
  create:      vi.fn(),
  update:      vi.fn(),
  delete:      vi.fn(),
  isSlugTaken: vi.fn(),
}

const orderRepo: AdminOrderRepository = {
  findAll:      vi.fn(),
  updateStatus: vi.fn(),
  getStats:     vi.fn(),
}

const sut = new AdminService(productRepo, orderRepo)

const validProduct = {
  name: 'Remera Vento Classic', slug: 'remera-vento-classic',
  description: 'Remera', price: 4500, stock: 10,
  images: [], categoryId: 'c1', isActive: true,
}

beforeEach(() => vi.clearAllMocks())

describe('AdminService.createProduct()', () => {
  it('crea producto cuando los datos son válidos y el slug no está en uso', async () => {
    vi.mocked(productRepo.isSlugTaken).mockResolvedValue(false)
    vi.mocked(productRepo.create).mockResolvedValue({ id: 'p1' })

    const result = await sut.createProduct(validProduct)
    expect(result.success).toBe(true)
    if (result.success) expect(result.id).toBe('p1')
    expect(productRepo.create).toHaveBeenCalledOnce()
  })

  it('devuelve error cuando los datos son inválidos', async () => {
    const result = await sut.createProduct({ name: '', price: -1 })
    expect(result.success).toBe(false)
    expect(productRepo.create).not.toHaveBeenCalled()
  })

  it('devuelve error cuando el slug ya está en uso', async () => {
    vi.mocked(productRepo.isSlugTaken).mockResolvedValue(true)

    const result = await sut.createProduct(validProduct)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.errors['slug']).toMatch(/en uso/)
    expect(productRepo.create).not.toHaveBeenCalled()
  })
})

describe('AdminService.updateProduct()', () => {
  it('actualiza producto existente', async () => {
    vi.mocked(productRepo.findById).mockResolvedValue({
      ...validProduct, id: 'p1', category: { id: 'c1', name: 'Remeras' },
      createdAt: new Date(), description: null,
    })
    vi.mocked(productRepo.isSlugTaken).mockResolvedValue(false)
    vi.mocked(productRepo.update).mockResolvedValue()

    const result = await sut.updateProduct('p1', { price: 5000 })
    expect(result.success).toBe(true)
    expect(productRepo.update).toHaveBeenCalledOnce()
  })

  it('devuelve error cuando el producto no existe', async () => {
    vi.mocked(productRepo.findById).mockResolvedValue(null)
    const result = await sut.updateProduct('no-existe', { price: 5000 })
    expect(result.success).toBe(false)
  })
})

describe('AdminService.updateOrderStatus()', () => {
  it('actualiza estado con un valor válido', async () => {
    vi.mocked(orderRepo.updateStatus).mockResolvedValue()
    await sut.updateOrderStatus('o1', 'SHIPPED')
    expect(orderRepo.updateStatus).toHaveBeenCalledWith('o1', 'SHIPPED')
  })

  it('lanza error con estado inválido', async () => {
    await expect(sut.updateOrderStatus('o1', 'INVENTADO')).rejects.toThrow(/inválido/)
  })
})
