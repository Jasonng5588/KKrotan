import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { adminSupabase } from '@/lib/supabase/admin'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboardPage() {
    // Auth guard: redirect to login if not authenticated
    const cookieStore = await cookies()
    const isAdmin = cookieStore.get('kkrotan_admin_session')?.value === 'kkrotan_admin_authenticated_2026'
    if (!isAdmin) redirect('/admin/login')

    const supabase = adminSupabase()

    const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount },
        { count: pendingOrders },
        { count: quotesCount },
        { data: revenueData },
        { data: recentOrders },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount').in('status', ['paid', 'delivered']),
        supabase.from('orders').select('id, total_amount, status, created_at, profiles(email, first_name, last_name)').order('created_at', { ascending: false }).limit(10),
    ])

    const totalRevenue = revenueData?.reduce((acc: number, o: any) => acc + o.total_amount, 0) || 0

    const stats = [
        { label: 'Total Revenue', value: `RM${totalRevenue.toFixed(2)}`, icon: '💰', color: 'bg-green-50 border-green-200' },
        { label: 'Total Orders', value: ordersCount || 0, icon: '🛒', color: 'bg-blue-50 border-blue-200' },
        { label: 'Pending Orders', value: pendingOrders || 0, icon: '⏳', color: 'bg-yellow-50 border-yellow-200' },
        { label: 'Total Customers', value: usersCount || 0, icon: '👥', color: 'bg-purple-50 border-purple-200' },
        { label: 'Products', value: productsCount || 0, icon: '📦', color: 'bg-orange-50 border-orange-200' },
        { label: 'Pending Quotes', value: quotesCount || 0, icon: '📋', color: 'bg-pink-50 border-pink-200' },
    ]

    const statusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-blue-100 text-blue-800',
        processing: 'bg-purple-100 text-purple-800',
        shipped: 'bg-orange-100 text-orange-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="text-slate-500 mt-1">{new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {stats.map(s => (
                    <div key={s.label} className={`border rounded-xl p-5 ${s.color}`}>
                        <div className="text-2xl mb-1">{s.icon}</div>
                        <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                        <p className="text-sm text-slate-600 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                    { href: '/admin/products', label: '+ Add Product', color: 'bg-amber-500 hover:bg-amber-600' },
                    { href: '/admin/banners', label: '+ Add Banner', color: 'bg-blue-500 hover:bg-blue-600' },
                    { href: '/admin/vouchers', label: '+ Add Voucher', color: 'bg-green-500 hover:bg-green-600' },
                    { href: '/admin/orders', label: 'View All Orders', color: 'bg-purple-500 hover:bg-purple-600' },
                ].map(a => (
                    <Link key={a.href} href={a.href} className={`${a.color} text-white text-sm font-semibold px-4 py-3 rounded-xl text-center transition-colors`}>
                        {a.label}
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white border rounded-xl shadow-sm">
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="font-bold text-lg text-slate-800">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left">Order</th>
                                <th className="px-5 py-3 text-left">Customer</th>
                                <th className="px-5 py-3 text-left">Date</th>
                                <th className="px-5 py-3 text-left">Total</th>
                                <th className="px-5 py-3 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentOrders?.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 font-mono font-semibold text-xs">{order.id.split('-')[0].toUpperCase()}</td>
                                    <td className="px-5 py-3">
                                        <p className="font-medium">{order.profiles?.first_name} {order.profiles?.last_name}</p>
                                        <p className="text-xs text-slate-400">{order.profiles?.email}</p>
                                    </td>
                                    <td className="px-5 py-3 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td className="px-5 py-3 font-bold">RM{order.total_amount.toFixed(2)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!recentOrders?.length && (
                                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No orders yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
