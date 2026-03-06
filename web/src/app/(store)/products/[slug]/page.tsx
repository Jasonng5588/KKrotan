import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductActions } from '@/components/product/ProductActions'
import { ProductReviews } from '@/components/product/ProductReviews'

export const revalidate = 0

export default async function ProductDetailPage({
    params
}: {
    params: { slug: string }
}) {
    const supabase = createClient()
    const { data: product } = await supabase
        .from('products')
        .select('*, categories(name), product_images(image_url, is_primary)')
        .eq('slug', params.slug)
        .single()

    if (!product) notFound()

    const { data: { user } } = await supabase.auth.getUser()

    const { data: tiers } = await supabase
        .from('wholesale_tiers')
        .select('*')
        .eq('product_id', product.id)
        .order('min_quantity', { ascending: true })

    const { data: reviews } = await supabase
        .from('reviews')
        .select('*, profiles(first_name, last_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })

    const images: any[] = product.product_images || []
    const primaryImage = images.find((img: any) => img.is_primary) || images[0]

    return (
        <div className="container mx-auto px-4 py-16 flex-1 bg-background">
            <Link href="/products" className="text-primary hover:underline mb-8 inline-block font-medium text-sm">
                ← Back to Products
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-2xl overflow-hidden border shadow-sm">
                        {primaryImage?.image_url ? (
                            <img src={primaryImage.image_url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">🪑</div>
                        )}
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                            {images.map((img: any, i: number) => (
                                <div key={i} className="aspect-square bg-muted rounded-lg overflow-hidden border hover:border-primary transition-colors cursor-pointer">
                                    <img src={img.image_url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div>
                    <p className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-2">
                        {product.categories?.name || 'Uncategorized'}
                    </p>
                    <h1 className="text-4xl font-extrabold text-foreground mb-3">{product.name}</h1>
                    <p className="text-4xl text-primary font-bold mb-2">RM{product.price.toFixed(2)}</p>
                    <p className={`text-sm font-semibold mb-6 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : '✗ Out of Stock'}
                    </p>

                    <div className="text-muted-foreground text-base leading-relaxed border-b pb-6 mb-6">
                        <p>{product.description || 'No description available.'}</p>
                    </div>

                    {product.specifications && (
                        <div className="mb-6 p-5 bg-muted/40 rounded-xl border">
                            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">Specifications</h3>
                            <pre className="text-sm text-muted-foreground font-sans whitespace-pre-wrap">
                                {JSON.stringify(product.specifications, null, 2)}
                            </pre>
                        </div>
                    )}

                    {tiers && tiers.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-bold mb-3 text-sm uppercase tracking-wider">Wholesale Pricing</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {tiers.map(tier => (
                                    <div key={tier.id} className="p-4 border rounded-xl bg-amber-50 flex justify-between items-center border-amber-200">
                                        <span className="font-semibold text-amber-800 text-sm">{tier.min_quantity}+ units</span>
                                        <span className="font-bold text-amber-900">RM{tier.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                For large orders, <Link href="/b2b" className="text-primary underline">request a custom quote</Link>.
                            </p>
                        </div>
                    )}

                    {/* Client-side interactive actions */}
                    <ProductActions
                        productId={product.id}
                        slug={product.slug}
                        stock={product.stock}
                        isLoggedIn={!!user}
                    />
                </div>
            </div>

            <ProductReviews
                productId={product.id}
                initialReviews={reviews || []}
                isLoggedIn={!!user}
            />
        </div>
    )
}
