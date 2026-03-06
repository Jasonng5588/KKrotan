import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 0

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login?next=/profile/orders')

    const { data: order } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, product_images(image_url, is_primary)))')
        .eq('id', params.id)
        .eq('profile_id', user.id)
        .single()

    if (!order) notFound()

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: '📋', desc: 'Your order has been received' },
        { key: 'paid', label: 'Payment Confirmed', icon: '💳', desc: 'Payment successfully processed' },
        { key: 'processing', label: 'Processing', icon: '📦', desc: 'Your order is being prepared' },
        { key: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Your order is on the way' },
        { key: 'delivered', label: 'Delivered', icon: '✅', desc: 'Order successfully delivered' },
    ]

    const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(order.status)

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        shipped: 'bg-orange-100 text-orange-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Link href="/profile/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                ← Back to Orders
            </Link>

            {/* Order Header */}
            <div className="bg-card border rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Order ID</p>
                        <p className="font-mono font-bold text-lg">{order.id.split('-')[0].toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground mt-1">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                        </span>
                        <p className="text-2xl font-bold text-primary mt-2">RM{order.total_amount.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-card border rounded-2xl p-6 mb-6 shadow-sm">
                <h2 className="font-bold text-lg mb-6">Order Tracking</h2>
                <div className="relative">
                    {/* Connector Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

                    <div className="space-y-6">
                        {statusSteps.map((step, i) => {
                            const isDone = i <= currentIndex
                            const isCurrent = i === currentIndex
                            return (
                                <div key={step.key} className="flex items-start gap-4 relative">
                                    {/* Circle */}
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-lg border-2 transition-all
                                        ${isDone
                                            ? isCurrent
                                                ? 'bg-primary border-primary text-white ring-4 ring-primary/20'
                                                : 'bg-primary/90 border-primary/80'
                                            : 'bg-muted border-border'
                                        }`}
                                    >
                                        {isDone ? step.icon : <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />}
                                    </div>
                                    <div className={`pt-1.5 ${isDone ? '' : 'opacity-40'}`}>
                                        <p className={`font-semibold text-sm ${isCurrent ? 'text-primary' : ''}`}>{step.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                                        {isCurrent && (
                                            <p className="text-xs text-primary font-semibold mt-1 animate-pulse">● Current status</p>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Order Items */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold text-lg mb-5">Items Ordered</h2>
                <div className="space-y-4">
                    {order.order_items?.map((item: any) => {
                        const images = item.products?.product_images || []
                        const img = images.find((i: any) => i.is_primary) || images[0]
                        return (
                            <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-0">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border flex-shrink-0">
                                    {img ? (
                                        <img src={img.image_url} alt={item.products?.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-2xl">🪑</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{item.products?.name || 'Product'}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} × RM{(item.price).toFixed(2)}</p>
                                </div>
                                <p className="font-bold text-primary whitespace-nowrap">RM{(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        )
                    })}
                </div>
                <div className="border-t mt-4 pt-4 flex justify-between items-center">
                    <span className="font-bold text-base">Total</span>
                    <span className="font-bold text-xl text-primary">RM{order.total_amount.toFixed(2)}</span>
                </div>
            </div>

            {order.status === 'pending' && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                    💳 <span className="font-semibold">Payment pending.</span> Please complete your payment. Contact us if you need assistance.
                </div>
            )}
        </div>
    )
}
