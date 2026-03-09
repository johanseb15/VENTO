// src/app/api/admin/products/[id]/route.ts
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
  const body = await req.json()
  const result = await adminService.updateProduct(id, body)

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminAPI()
  if (error) return error

  const { id } = await params
  await adminService.deleteProduct(id)
  return NextResponse.json({ success: true })
}
