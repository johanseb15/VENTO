// src/application/AdminService.ts
import { validateProduct, type ProductInput } from '@domain/admin'

export type AdminProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  stock: number
  images: string[]
  isActive: boolean
  category: { id: string; name: string }
  createdAt: Date
}

export type AdminOrder = {
  id: string
  status: string
  total: number
  discount: number
  createdAt: Date
  user: { email: string; name: string | null }
  itemCount: number
}

export type DashboardStats = {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  pendingOrders: number
  revenueThisMonth: number
  ordersThisMonth: number
  avgOrderValue: number
}

// Puertos
export interface AdminProductRepository {
  findAll(page: number, pageSize: number): Promise<{ products: AdminProduct[]; total: number }>
  findById(id: string): Promise<AdminProduct | null>
  create(data: ProductInput): Promise<{ id: string }>
  update(id: string, data: Partial<ProductInput>): Promise<void>
  delete(id: string): Promise<void>
  isSlugTaken(slug: string, excludeId?: string): Promise<boolean>
}

export interface AdminOrderRepository {
  findAll(page: number, pageSize: number, status?: string): Promise<{ orders: AdminOrder[]; total: number }>
  updateStatus(id: string, status: string): Promise<void>
  getStats(): Promise<DashboardStats>
}

export class AdminService {
  constructor(
    private readonly productRepo: AdminProductRepository,
    private readonly orderRepo: AdminOrderRepository,
  ) {}

  async listProducts(page = 1, pageSize = 20) {
    return this.productRepo.findAll(page, pageSize)
  }

  async createProduct(input: Partial<ProductInput>) {
    const validation = validateProduct(input)
    if (!validation.valid) {
      return { success: false as const, errors: validation.errors }
    }

    const slugTaken = await this.productRepo.isSlugTaken(validation.data.slug)
    if (slugTaken) {
      return { success: false as const, errors: { slug: 'Este slug ya está en uso' } }
    }

    const { id } = await this.productRepo.create(validation.data)
    return { success: true as const, id }
  }

  async updateProduct(id: string, input: Partial<ProductInput>) {
    const existing = await this.productRepo.findById(id)
    if (!existing) return { success: false as const, errors: { id: 'Producto no encontrado' } }

    const validation = validateProduct({
      ...existing,
      description: existing.description ?? undefined,
      ...input,
    })
    if (!validation.valid) {
      return { success: false as const, errors: validation.errors }
    }

    if (input.slug && input.slug !== existing.slug) {
      const taken = await this.productRepo.isSlugTaken(input.slug, id)
      if (taken) {
        return { success: false as const, errors: { slug: 'Este slug ya está en uso' } }
      }
    }

    await this.productRepo.update(id, validation.data)
    return { success: true as const }
  }

  async deleteProduct(id: string) {
    await this.productRepo.delete(id)
  }

  async listOrders(page = 1, pageSize = 20, status?: string) {
    return this.orderRepo.findAll(page, pageSize, status)
  }

  async updateOrderStatus(id: string, status: string) {
    const validStatuses = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}`)
    }
    await this.orderRepo.updateStatus(id, status)
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const stats = await this.orderRepo.getStats()
    return {
      ...stats,
      avgOrderValue:
        stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0,
    }
  }

  async getDashboard(): Promise<DashboardStats> {
    return this.getDashboardStats()
  }
}
