import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@components/auth/LoginForm'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

import { signIn } from 'next-auth/react'

beforeEach(() => vi.clearAllMocks())

describe('<LoginForm />', () => {
  it('renderiza email, contrasena y boton de submit', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contras/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument()
  })

  it('renderiza el boton de Google', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
  })

  it('muestra error con credenciales incorrectas', async () => {
    vi.mocked(signIn).mockResolvedValue({
      code: 'credentials',
      error: 'CredentialsSignin',
      ok: false,
      status: 401,
      url: undefined,
    } as any)

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@vento.com')
    await user.type(screen.getByLabelText(/contras/i), 'WrongPass1')
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/email o contrasena incorrectos/i)
  })

  it('deshabilita el boton mientras carga', async () => {
    vi.mocked(signIn).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'ana@vento.com')
    await user.type(screen.getByLabelText(/contras/i), 'Vento123')
    user.click(screen.getByRole('button', { name: /iniciar sesion/i }))

    expect(await screen.findByRole('button', { name: /entrando/i })).toBeDisabled()
  })

  it('limpia el error al modificar los campos', async () => {
    vi.mocked(signIn).mockResolvedValue({
      code: 'credentials',
      error: 'CredentialsSignin',
      ok: false,
      status: 401,
      url: undefined,
    } as any)

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), 'wrong@vento.com')
    await user.type(screen.getByLabelText(/contras/i), 'bad')
    await user.click(screen.getByRole('button', { name: /iniciar sesion/i }))
    await screen.findByRole('alert')

    await user.type(screen.getByLabelText(/email/i), 'x')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('llama signIn con proveedor google', async () => {
    vi.mocked(signIn).mockResolvedValue({
      code: 'ok',
      ok: true,
      error: undefined,
      status: 200,
      url: '/',
    } as any)

    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: /google/i }))
    expect(signIn).toHaveBeenCalledWith('google', expect.any(Object))
  })
})
