import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export const revalidate = 0

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: { category?: string, q?: string }
}) {
    const supabase = createClient()
    let query = supabase.from('products').select('*, categories(slug, name), product_images(image_url, is_primary)').eq('is_active', true)

    if (searchParams.q) {
        query = query.ilike('name', `%${searchParams.q}%`)
    }

    const { data: products, error } = await query

    const displayedProducts = products?.filter(p => searchParams.category ? p.categories?.slug === searchParams.category : true) || []

    return (
        <div className="container mx-auto px-4 py-16 flex-1 bg-background">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                <h1 className="text-4xl font-bold text-foreground">Our Products</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <form className="flex gap-2" method="GET" action="/products">
                        {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
                        <Input name="q" placeholder="Search products..." defaultValue={searchParams.q} className="max-w-xs" />
                        <Button type="submit">Search</Button>
                    </form>
                    {(searchParams.category || searchParams.q) && (
                        <Link href="/products">
                            <Button variant="outline">Clear Filters</Button>
                        </Link>
                    )}
                </div>
            </div>

            {error && <p className="text-destructive bg-destructive/10 p-4 rounded-md">Error loading products: {error.message}</p>}

            {!error && displayedProducts.length === 0 ? (
                <div className="text-center py-32 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    <h3 className="text-2xl font-semibold mb-2">No products found</h3>
                    <p>We are currently updating our inventory. Please check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                    {displayedProducts.map((product) => {
                        const displayImage = product.product_images?.[0]?.image_url || null
                        return (
                            <Card key={product.id} className="flex flex-col shadow-sm hover:shadow-lg transition-shadow border-border">
                                <div className="aspect-square bg-muted relative rounded-t-xl overflow-hidden flex items-center justify-center border-b">
                                    {displayImage ? (
                                        <img src={displayImage} alt={product.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <span className="text-muted-foreground font-medium">No Image</span>
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground font-medium">{product.categories?.name || 'Uncategorized'}</p>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="font-bold text-2xl text-primary">RM{product.price.toFixed(2)}</p>
                                    <p className={`text-sm mt-2 font-medium ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <Link href={`/products/${product.slug}`} className="w-full">
                                        <Button className="w-full" variant="secondary">View Details</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
