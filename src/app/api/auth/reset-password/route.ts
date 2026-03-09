// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { token, password } = await req.json()

  if (!token || !password) {
    return NextResponse.json({ error: 'Datos requeridos' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'La contraseña debe tener al menos 8 caracteres' },
      { status: 400 }
    )
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!resetToken || resetToken.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'El link es inválido o ha expirado' },
      { status: 400 }
    )
  }

  const hashed = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data:  { password: hashed },
    }),
    prisma.passwordResetToken.delete({ where: { token } }),
  ])

  return NextResponse.json({ message: 'Contraseña actualizada correctamente' })
}
