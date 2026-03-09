// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@lib/auth-utils'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminProductRepository'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminOrderRepository'

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository(),
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAPI()
  if (error) return error

  const { id } = await params
  const { status } = await req.json()

  try {
    await adminService.updateOrderStatus(id, status)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 })
  }
}
