// src/infrastructure/email/TransactionalMailer.ts
// Emails: bienvenida + recupero de contraseña
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM   = process.env.EMAIL_FROM ?? 'VENTO <noreply@vento.com.ar>'
const APP    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export class TransactionalMailer {
  async sendWelcome(to: string, name: string | null): Promise<void> {
    const displayName = name ?? to.split('@')[0]

    await resend.emails.send({
      from:    FROM,
      to,
      subject: `¡Bienvenida a VENTO, ${displayName}!`,
      html: `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#f9fafb">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#111827;padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.5px">VENTO</h1>
        </td></tr>
        <tr><td style="padding:40px 32px">
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">
            Hola, ${displayName} 👋
          </h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
            Tu cuenta fue creada exitosamente. Ya podés explorar todo el catálogo de VENTO y
            encontrar la ropa que define tu identidad.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${APP}/productos"
               style="display:inline-block;background:#111827;color:#fff;padding:14px 32px;
                      border-radius:8px;text-decoration:none;font-size:15px;font-weight:500">
              Ver el catálogo
            </a>
          </div>
          <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center">
            Si no creaste esta cuenta, podés ignorar este email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            VENTO · Moda con identidad
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  }

  async sendPasswordReset(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${APP}/reset-password?token=${resetToken}`

    await resend.emails.send({
      from:    FROM,
      to,
      subject: 'Recuperá tu contraseña · VENTO',
      html: `
<!DOCTYPE html>
<html lang="es">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#f9fafb">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
        <tr><td style="background:#111827;padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.5px">VENTO</h1>
        </td></tr>
        <tr><td style="padding:40px 32px">
          <h2 style="margin:0 0 12px;color:#111827;font-size:20px">Recuperá tu contraseña</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.
            El link es válido por <strong>1 hora</strong>.
          </p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}"
               style="display:inline-block;background:#111827;color:#fff;padding:14px 32px;
                      border-radius:8px;text-decoration:none;font-size:15px;font-weight:500">
              Restablecer contraseña
            </a>
          </div>
          <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center">
            Si no solicitaste esto, podés ignorar este email. Tu contraseña no cambiará.
          </p>
          <p style="margin:12px 0 0;color:#9ca3af;font-size:11px;text-align:center;word-break:break-all">
            O copiá este link: ${resetUrl}
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">VENTO · Moda con identidad</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })
  }
}
