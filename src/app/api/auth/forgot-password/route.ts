// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { TransactionalMailer } from '@infrastructure/email/TransactionalMailer'
import prisma from '@lib/prisma'
import crypto from 'crypto'

const mailer = new TransactionalMailer()

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
  }

  // Siempre responde 200 para no revelar si el email existe
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  if (user) {
    const token     = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.passwordResetToken.upsert({
      where:  { userId: user.id },
      create: { userId: user.id, token, expiresAt },
      update: { token, expiresAt },
    })

    try {
      await mailer.sendPasswordReset(user.email, token)
    } catch (err) {
      console.error('[forgot-password] Email failed:', err)
    }
  }

  return NextResponse.json({
    message: 'Si el email existe, recibirás las instrucciones en breve.',
  })
}
