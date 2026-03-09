// src/infrastructure/email/ResendMailer.ts
import { Resend } from 'resend'
import prisma from '@lib/prisma'
import { formatPrice } from '@domain/pricing'
import type { Mailer } from '@application/OrderService'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = process.env.EMAIL_FROM ?? 'VENTO <noreply@vento.com.ar>'

export class ResendMailer implements Mailer {
  async sendOrderConfirmation(orderId: string): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: { include: { product: { select: { name: true } } } },
      },
    })

    if (!order) throw new Error(`Order ${orderId} not found`)

    const itemsHtml = order.items
      .map(item => `
        <tr>
          <td style="padding:8px 0;color:#374151">${item.product.name}</td>
          <td style="padding:8px 0;color:#374151;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;color:#374151;text-align:right">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `)
      .join('')

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;background:#f9fafb">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">

        <!-- Header -->
        <tr><td style="background:#111827;padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:24px;font-weight:600;letter-spacing:-0.5px">VENTO</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 8px;color:#111827;font-size:18px">¡Pedido confirmado!</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">
            Hola ${order.user.name ?? order.user.email}, tu pedido fue confirmado y está siendo preparado.
          </p>

          <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;font-weight:500;text-transform:uppercase;letter-spacing:0.05em">
            Pedido #${order.id.slice(-8).toUpperCase()}
          </p>

          <!-- Items table -->
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f3f4f6">
            <tr>
              <th style="padding:8px 0;text-align:left;font-size:12px;color:#9ca3af;font-weight:500">Producto</th>
              <th style="padding:8px 0;text-align:center;font-size:12px;color:#9ca3af;font-weight:500">Cant.</th>
              <th style="padding:8px 0;text-align:right;font-size:12px;color:#9ca3af;font-weight:500">Total</th>
            </tr>
            ${itemsHtml}
            <tr style="border-top:1px solid #f3f4f6">
              <td colspan="2" style="padding:12px 0;font-weight:600;color:#111827;font-size:14px">Total</td>
              <td style="padding:12px 0;font-weight:600;color:#111827;font-size:14px;text-align:right">
                ${formatPrice(order.total)}
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-top:32px">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/pedidos/${order.id}"
               style="display:inline-block;background:#111827;color:#fff;padding:12px 28px;
                      border-radius:8px;text-decoration:none;font-size:14px;font-weight:500">
              Ver mi pedido
            </a>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;border-top:1px solid #f3f4f6;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">
            VENTO · Moda con identidad · Si tenés preguntas, respondé este email
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

    await resend.emails.send({
      from: FROM,
      to:   order.user.email,
      subject: `Pedido confirmado #${order.id.slice(-8).toUpperCase()} · VENTO`,
      html,
    })
  }
}
