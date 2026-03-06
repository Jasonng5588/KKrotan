import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { removeFromCart } from './actions'

export const revalidate = 0

export default async function CartPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return (
            <div className="container mx-auto px-4 py-32 text-center flex-1">
                <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
                <p className="text-muted-foreground mb-8">Please log in to view your shopping cart.</p>
                <Link href="/login?next=/cart">
                    <Button size="lg">Log In to View Cart</Button>
                </Link>
            </div>
        )
    }

    const { data: cart } = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle()

    let cartItems: any[] = []
    if (cart) {
        const { data } = await supabase
            .from('cart_items')
            .select('id, quantity, products(id, name, price, stock, slug, product_images(image_url, is_primary))')
            .eq('cart_id', cart.id)
        cartItems = data || []
    }

    const subtotal = cartItems.reduce((acc, item) => acc + ((item.products?.price || 0) * item.quantity), 0)

    return (
        <div className="container mx-auto px-4 py-16 flex-1">
            <h1 className="text-4xl font-bold mb-10 text-foreground">Shopping Cart ({cartItems.length} items)</h1>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="text-2xl font-semibold mb-4 text-muted-foreground">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Browse our products and add items to your cart.</p>
                    <Link href="/products">
                        <Button size="lg" className="mt-2">Browse Products</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const product = item.products
                            const imgUrl = (product?.product_images as any[])?.[0]?.image_url || null
                            return (
                                <div key={item.id} className="flex gap-5 p-5 border rounded-xl bg-card shadow-sm items-center">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0 border">
                                        {imgUrl ? (
                                            <img src={imgUrl} alt={product?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${product?.slug}`} className="font-semibold text-lg hover:underline text-foreground line-clamp-1">
                                            {product?.name}
                                        </Link>
                                        <p className="text-primary font-bold mt-1 text-xl">RM{product?.price?.toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        <p className="font-bold text-xl text-foreground">RM{((product?.price || 0) * item.quantity).toFixed(2)}</p>
                                        <form action={async () => {
                                            'use server'
                                            await removeFromCart(item.id)
                                        }}>
                                            <Button variant="destructive" size="sm" type="submit">Remove</Button>
                                        </form>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-8 border rounded-xl bg-card shadow-sm h-fit sticky top-24">
                        <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
                        <div className="space-y-3 text-base mb-6">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span className="font-medium text-foreground">RM{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span className="font-medium text-foreground">Calculated at checkout</span>
                            </div>
                            <div className="border-t pt-4 flex justify-between font-bold text-2xl text-foreground mt-4">
                                <span>Total</span>
                                <span className="text-primary">RM{subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <Link href="/checkout" className="block mt-6">
                            <Button size="lg" className="w-full text-lg h-14 font-semibold">Proceed to Checkout →</Button>
                        </Link>
                        <Link href="/products" className="block mt-3">
                            <Button variant="ghost" className="w-full">Continue Shopping</Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
