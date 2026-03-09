import { Navbar } from '@/components/Navbar'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="organic-bg min-h-screen">{children}</div>
    </>
  )
}
