import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { RegisterForm } from '@components/auth/RegisterForm'

const server = setupServer(
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as Record<string, string>

    if (body['email'] === 'existente@vento.com') {
      return HttpResponse.json({ error: 'El email ya esta registrado' }, { status: 409 })
    }

    if (!body['email']?.includes('@')) {
      return HttpResponse.json(
        { fieldErrors: { email: 'El email no tiene un formato valido' } },
        { status: 400 }
      )
    }

    return HttpResponse.json({ user: { id: '1', email: body['email'] } }, { status: 201 })
  })
)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('<RegisterForm />', () => {
  it('renderiza los campos requeridos', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/contrase/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
  })

  it('muestra errores de validacion de API', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'no-es-email')
    await user.type(screen.getByLabelText(/contrase/i), 'corta')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/email no tiene un formato/i)).toBeInTheDocument()
  })

  it('deshabilita el boton durante el envio', async () => {
    server.use(
      http.post('/api/auth/register', async ({ request }) => {
        const body = (await request.json()) as Record<string, string>
        await delay(120)
        return HttpResponse.json({ user: { id: '1', email: body['email'] } }, { status: 201 })
      })
    )

    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'nuevo@vento.com')
    await user.type(screen.getByLabelText(/contrase/i), 'Vento123')

    const promise = user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByRole('button', { name: /creando cuenta/i })).toBeDisabled()

    await promise
  })

  it('llama onSuccess al registrarse correctamente', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(<RegisterForm onSuccess={onSuccess} />)

    await user.type(screen.getByLabelText(/email/i), 'nuevo@vento.com')
    await user.type(screen.getByLabelText(/contrase/i), 'Vento123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith({ id: '1', email: 'nuevo@vento.com' })
    })
  })

  it('muestra error de email duplicado desde API', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'existente@vento.com')
    await user.type(screen.getByLabelText(/contrase/i), 'Vento123')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))

    expect(await screen.findByText(/email ya esta registrado/i)).toBeInTheDocument()
  })

  it('limpia el error del campo al escribir', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)

    await user.type(screen.getByLabelText(/email/i), 'no-es-email')
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }))
    await screen.findByText(/email no tiene un formato/i)

    await user.clear(screen.getByLabelText(/email/i))
    await user.type(screen.getByLabelText(/email/i), 'v')

    expect(screen.queryByText(/email no tiene un formato/i)).not.toBeInTheDocument()
  })
})
