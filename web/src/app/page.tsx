import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const categories = [
    { name: 'Raw Rattan', slug: 'raw-rattan', img: '/images/manau_rattan.png', desc: 'Premium Manau, Mantang, and Sega poles for crafting.' },
    { name: 'Rattan Furniture', slug: 'rattan-furniture', img: '/images/rattan_chair.png', desc: 'Handcrafted chairs, tables, wardrobes and sets.' },
    { name: 'Rattan Baskets', slug: 'rattan-baskets', img: '/images/rattan_basket.png', desc: 'Beautifully woven storage and decorative baskets.' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/rattan_dining_set.png" alt="KK Rotan showroom" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <p className="uppercase tracking-widest text-sm font-semibold mb-4 text-amber-300">Malaysia's Premier Rattan Supplier</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-lg">
            Premium Rattan for<br />
            <span className="text-amber-300">Exceptional Craftsmanship</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/90 mb-10">
            Source high-quality raw rattan, semi-processed materials, and beautifully crafted rattan furniture from KK Rotan.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="px-10 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-white font-bold">Shop Now</Button>
            </Link>
            <Link href="/b2b">
              <Button size="lg" variant="outline" className="px-10 py-6 text-lg text-white border-white hover:bg-white/10 bg-transparent font-bold">B2B Wholesale</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">What We Offer</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">From raw materials to finished furniture — all under one roof.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`} className="group">
                <div className="rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all duration-300 bg-card">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{cat.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{cat.desc}</p>
                    <span className="text-primary font-semibold text-sm group-hover:underline">Browse Category →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features / Why KK Rotan */}
      <section className="w-full py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Why Choose KK Rotan?</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">We've been the trusted name in rattan since decades.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🌿', title: 'Premium Quality', desc: 'We source only the finest grade rattan from sustainable Malaysian forests.' },
              { icon: '📦', title: 'Fast Shipping', desc: 'Reliable logistics across Malaysia and international export available.' },
              { icon: '🤝', title: 'B2B & Wholesale', desc: 'Special bulk pricing tiers and custom quotes for business orders.' },
            ].map((f) => (
              <div key={f.title} className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="w-full py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-foreground">Gallery</h2>
          <p className="text-center text-muted-foreground mb-14 text-lg">A glimpse into our products and craftsmanship.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['/images/manau_rattan.png', '/images/rattan_chair.png', '/images/rattan_table.png', '/images/rattan_basket.png', '/images/mantang_rattan.png', '/images/rattan_wardrobe.png', '/images/rattan_dining_set.png', '/images/rattan_chair.png'].map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border">
                <img src={src} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/gallery"><Button variant="outline" size="lg">View Full Gallery</Button></Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="w-full py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl opacity-90 mb-8">Browse our full catalogue or request a wholesale quote for your business.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products"><Button size="lg" variant="secondary" className="px-10 font-bold">Shop Products</Button></Link>
            <Link href="/b2b"><Button size="lg" variant="outline" className="px-10 font-bold border-white text-white hover:bg-white/10 bg-transparent">Request a Quote</Button></Link>
          </div>
        </div>
      </section>
    </div>
  )
}
