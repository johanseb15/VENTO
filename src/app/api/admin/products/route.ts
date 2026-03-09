// src/app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAPI } from '@lib/auth-utils'
import { AdminService } from '@application/AdminService'
import { PrismaAdminProductRepository } from '@infrastructure/db/PrismaAdminProductRepository'
import { PrismaAdminOrderRepository } from '@infrastructure/db/PrismaAdminOrderRepository'

const adminService = new AdminService(
  new PrismaAdminProductRepository(),
  new PrismaAdminOrderRepository(),
)

export async function POST(req: NextRequest) {
  const { error } = await requireAdminAPI()
  if (error) return error

  const body = await req.json()
  const result = await adminService.createProduct(body)

  if (!result.success) {
    return NextResponse.json({ errors: result.errors }, { status: 400 })
  }

  return NextResponse.json({ id: result.id }, { status: 201 })
}
