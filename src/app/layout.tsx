import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'VENTO - Ropa y Accesorios',
    template: '%s | VENTO',
  },
  description: 'Tienda online de ropa y accesorios. Envios a todo el pais.',
  openGraph: {
    siteName: 'VENTO',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body suppressHydrationWarning className="min-h-screen bg-stone-50 text-stone-900 antialiased">
        {children}
      </body>
    </html>
  )
}
