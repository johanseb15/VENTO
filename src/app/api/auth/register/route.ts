import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@application/AuthService'
import { PrismaUserRepository } from '@infrastructure/db/PrismaUserRepository'
import { TransactionalMailer } from '@infrastructure/email/TransactionalMailer'

const authService = new AuthService(new PrismaUserRepository())
const mailer = new TransactionalMailer()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = await authService.register({
      email: body.email ?? '',
      password: body.password ?? '',
      name: body.name,
    })

    if (!result.success) {
      const isConflict = result.error.toLowerCase().includes('ya est')
      return NextResponse.json(
        { error: result.error, fieldErrors: result.fieldErrors },
        { status: isConflict ? 409 : 400 }
      )
    }

    try {
      await mailer.sendWelcome(result.user.email, result.user.name ?? null)
    } catch (mailError) {
      console.error('[POST /api/auth/register] welcome email error', mailError)
    }

    return NextResponse.json({ user: result.user }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/auth/register]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
