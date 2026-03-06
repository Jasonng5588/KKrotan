import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { removeFromWishlist } from './actions'

export const revalidate = 0

export default async function WishlistPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/profile/wishlist')
    }

    const { data: wishlists } = await supabase
        .from('wishlists')
        .select('id, products(id, name, slug, price, product_images(image_url))')
        .eq('profile_id', user.id)

    return (
        <div className="container mx-auto px-4 py-16 flex-1 max-w-5xl">
            <h1 className="text-4xl font-bold mb-10 text-foreground">My Wishlist</h1>

            {!wishlists || wishlists.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                    <h2 className="text-xl font-medium mb-4 text-muted-foreground">Your wishlist is empty.</h2>
                    <Link href="/products" className="text-primary hover:underline font-semibold">Browse Products</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlists.map((item: any) => {
                        const product = item.products;
                        const displayImage = product?.product_images?.[0]?.image_url || null;
                        return (
                            <div key={item.id} className="border rounded-xl bg-card shadow-sm border-border overflow-hidden flex flex-col">
                                <div className="aspect-video bg-muted relative">
                                    {displayImage ? (
                                        <img src={displayImage} alt={product?.name} className="object-cover w-full h-full" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">{product?.name}</h3>
                                    <p className="text-primary font-bold my-2">RM{product?.price?.toFixed(2)}</p>
                                    <div className="flex gap-2 mt-4">
                                        <Link href={`/products/${product?.slug}`} className="flex-1">
                                            <Button variant="outline" className="w-full">View</Button>
                                        </Link>
                                        <form action={async () => {
                                            'use server'
                                            await removeFromWishlist(item.id)
                                        }}>
                                            <Button variant="destructive" type="submit">Remove</Button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
