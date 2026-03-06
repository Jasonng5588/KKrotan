import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export const revalidate = 0

export default async function CheckoutPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login?next=/checkout')
    }

    const { data: cart } = await supabase.from('carts').select('id').eq('profile_id', user.id).maybeSingle()
    let cartItems: any[] = []
    if (cart) {
        const { data } = await supabase
            .from('cart_items')
            .select('id, quantity, products(id, name, price, product_images(image_url))')
            .eq('cart_id', cart.id)
        cartItems = data || []
    }

    if (cartItems.length === 0) {
        redirect('/cart')
    }

    const subtotal = cartItems.reduce((acc, item) => acc + ((item.products?.price || 0) * item.quantity), 0)
    const shipping = 15.00

    return (
        <div className="container mx-auto px-4 py-16 flex-1 bg-muted/20">
            <h1 className="text-4xl font-bold mb-10 text-foreground">Checkout</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Form */}
                <div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border mb-6">
                        <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
                        <form id="checkout-form" className="space-y-5" action={async (formData) => {
                            'use server'
                            const s = createClient()
                            const { data: { user: u } } = await s.auth.getUser()
                            if (!u) redirect('/login')

                            const { data: c } = await s.from('carts').select('id').eq('profile_id', u.id).maybeSingle()
                            if (!c) redirect('/cart')

                            const { data: items } = await s.from('cart_items').select('quantity, products(id, name, price)').eq('cart_id', c.id)
                            if (!items || items.length === 0) redirect('/cart')

                            const total = items.reduce((acc, item: any) => acc + ((item.products?.price || 0) * item.quantity), 0) + 15

                            const addressLine = `${formData.get('address')}, ${formData.get('city')}, ${formData.get('state')} ${formData.get('postal')}`

                            const { data: addr } = await s.from('addresses').insert([{
                                profile_id: u.id,
                                recipient_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
                                phone: formData.get('phone') as string,
                                street_address: `${formData.get('address')}`,
                                city: formData.get('city') as string,
                                state: formData.get('state') as string,
                                postal_code: formData.get('postal') as string,
                                country: 'Malaysia',
                                is_shipping: true,
                                is_billing: true,
                            }]).select('id').single()

                            const { data: order } = await s.from('orders').insert([{
                                profile_id: u.id,
                                total_amount: total,
                                status: 'pending',
                                shipping_address_id: addr?.id,
                            }]).select('id').single()

                            if (order) {
                                const orderItems = items.map((item: any) => ({
                                    order_id: order.id,
                                    product_id: item.products.id,
                                    product_name: item.products.name,
                                    product_price: item.products.price,
                                    quantity: item.quantity
                                }))
                                await s.from('order_items').insert(orderItems)
                                await s.from('cart_items').delete().eq('cart_id', c.id)
                            }

                            redirect('/profile/orders')
                        }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input id="firstName" name="firstName" required className="h-11" placeholder="John" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName">Last Name *</Label>
                                    <Input id="lastName" name="lastName" required className="h-11" placeholder="Doe" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone">Phone Number *</Label>
                                <Input id="phone" name="phone" required className="h-11" placeholder="+60 12-345 6789" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">Address *</Label>
                                <Input id="address" name="address" required className="h-11" placeholder="No. 123, Jalan Rattan, Taman Baru" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1 col-span-1">
                                    <Label htmlFor="postal">Postcode *</Label>
                                    <Input id="postal" name="postal" required className="h-11" placeholder="50000" />
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label htmlFor="city">City *</Label>
                                    <Input id="city" name="city" required className="h-11" placeholder="Kuala Lumpur" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="state">State *</Label>
                                <Input id="state" name="state" required className="h-11" placeholder="Selangor" />
                            </div>
                            <div className="pt-4 border-t">
                                <h2 className="text-xl font-semibold mb-3">Payment Method</h2>
                                <div className="p-4 border rounded-xl bg-amber-50 text-amber-800 border-amber-200 text-sm font-medium">
                                    💳 Online payment gateway (FPX / Credit Card) — coming soon. For now, clicking &quot;Place Order&quot; will confirm your order and we will contact you for payment.
                                </div>
                            </div>
                            <Button type="submit" size="lg" className="w-full h-14 text-lg font-bold">Place Order →</Button>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-card p-8 rounded-2xl shadow-sm border sticky top-24">
                        <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
                        <div className="space-y-4 divide-y divide-border">
                            {cartItems.map((item) => {
                                const imgUrl = (item.products?.product_images as any[])?.[0]?.image_url
                                return (
                                    <div key={item.id} className="flex gap-3 pt-4 first:pt-0">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted border flex-shrink-0">
                                            {imgUrl ? <img src={imgUrl} alt={item.products?.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm line-clamp-2">{item.products?.name}</p>
                                            <p className="text-muted-foreground text-xs mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-sm">RM{((item.products?.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="border-t mt-6 pt-4 space-y-2">
                            <div className="flex justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>RM{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>RM{shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-foreground border-t pt-3 mt-3">
                                <span>Total</span>
                                <span className="text-primary">RM{(subtotal + shipping).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
