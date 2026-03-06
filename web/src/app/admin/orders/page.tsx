import { redirect } from 'next/navigation'
import { adminSupabase } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export const revalidate = 0

async function updateOrderStatus(id: string, status: string) {
    'use server'
    const supabase = adminSupabase()
    await supabase.from('orders').update({ status }).eq('id', id)
    revalidatePath('/admin/orders')
    revalidatePath('/profile/orders')
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    paid: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-orange-100 text-orange-800 border-orange-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const orderFlow = ['pending', 'paid', 'processing', 'shipped', 'delivered']

export default async function AdminOrdersPage() {

    const { cookies } = require('next/headers')
    const isAdmin = cookies().get('kkrotan_admin_session')?.value === 'kkrotan_admin_authenticated_2026'
    if (!isAdmin) redirect('/admin/login')

    const supabase = adminSupabase()
    const { data: orders } = await supabase
        .from('orders')
        .select('*, profiles(email, first_name, last_name), order_items(quantity, price, products(name))')
        .order('created_at', { ascending: false })

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Orders</h1>
                    <p className="text-slate-500 mt-1">{orders?.length || 0} total orders</p>
                </div>
            </div>

            <div className="space-y-4">
                {orders?.map((order: any) => {
                    const currentIdx = orderFlow.indexOf(order.status)
                    const nextStatus = currentIdx < orderFlow.length - 1 ? orderFlow[currentIdx + 1] : null
                    return (
                        <div key={order.id} className="bg-white border rounded-xl shadow-sm p-5">
                            <div className="flex flex-wrap gap-4 justify-between items-start mb-4">
                                <div>
                                    <p className="font-mono font-bold text-sm">{order.id.split('-')[0].toUpperCase()}</p>
                                    <p className="text-sm font-semibold mt-0.5">{order.profiles?.first_name} {order.profiles?.last_name}</p>
                                    <p className="text-xs text-slate-400">{order.profiles?.email}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-amber-700">RM{order.total_amount.toFixed(2)}</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase border mt-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="text-sm text-slate-600 mb-4 space-y-1 bg-slate-50 rounded-lg p-3">
                                {order.order_items?.map((item: any, i: number) => (
                                    <div key={i} className="flex justify-between">
                                        <span>{item.products?.name} ×{item.quantity}</span>
                                        <span className="font-medium">RM{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Status Actions — full flow */}
                            <div className="flex flex-wrap gap-2">
                                {nextStatus && (
                                    <form action={updateOrderStatus.bind(null, order.id, nextStatus)}>
                                        <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition-colors capitalize">
                                            Mark as {nextStatus}
                                        </button>
                                    </form>
                                )}
                                {order.status !== 'pending' && order.status !== 'cancelled' && (
                                    <form action={updateOrderStatus.bind(null, order.id, 'cancelled')}>
                                        <button type="submit" className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition-colors">
                                            Cancel
                                        </button>
                                    </form>
                                )}
                                {order.status === 'cancelled' && (
                                    <form action={updateOrderStatus.bind(null, order.id, 'pending')}>
                                        <button type="submit" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
                                            Reopen
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )
                })}
                {!orders?.length && (
                    <div className="text-center py-16 border-2 border-dashed rounded-xl text-slate-400">No orders yet</div>
                )}
            </div>
        </div>
    )
}
