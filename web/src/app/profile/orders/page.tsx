import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function OrdersPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login?next=/profile/orders')

    const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, order_items(quantity, price, products(name))')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })

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
            <h1 className="text-3xl font-bold mb-8 text-foreground">My Orders</h1>

            {!orders?.length ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                    <p className="text-5xl mb-4">📦</p>
                    <p className="font-medium mb-4">You have no past orders</p>
                    <Link href="/products" className="text-primary hover:underline font-semibold">Browse Products</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <Link key={order.id} href={`/profile/orders/${order.id}`} className="block">
                            <div className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer group">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div>
                                        <p className="font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                                            #{order.id.split('-')[0].toUpperCase()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                        <p className="font-bold text-primary text-lg mt-1">RM{order.total_amount.toFixed(2)}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {order.order_items?.slice(0, 2).map((item: any, i: number) => (
                                        <p key={i} className="text-sm text-muted-foreground">
                                            {item.products?.name} ×{item.quantity}
                                        </p>
                                    ))}
                                    {(order.order_items?.length || 0) > 2 && (
                                        <p className="text-xs text-muted-foreground">+{order.order_items.length - 2} more items</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-end mt-3 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                                    View Details & Tracking →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
