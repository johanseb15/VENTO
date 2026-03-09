export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
      {children}
    </section>
  )
}
