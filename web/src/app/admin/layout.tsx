import { redirect } from 'next/navigation'
import Link from 'next/link'
import { headers } from 'next/headers'
import { isAdminAuthenticated } from './auth-utils'
import { adminLogout } from './auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const headersList = headers()
    const pathname = headersList.get('x-pathname') || ''

    // Don't check auth on the login page — prevents infinite redirect loop
    const isLoginPage = pathname === '/admin/login' || pathname.startsWith('/admin/login')
    if (!isLoginPage) {
        const isAdmin = isAdminAuthenticated()
        if (!isAdmin) {
            redirect('/admin/login')
        }
    }

    // Render login page without sidebar
    if (isLoginPage) {
        return <>{children}</>
    }

    const navItems = [
        { href: '/admin', label: '📊 Dashboard' },
        { href: '/admin/products', label: '📦 Products' },
        { href: '/admin/categories', label: '🗂 Categories' },
        { href: '/admin/orders', label: '🛒 Orders' },
        { href: '/admin/customers', label: '👥 Customers' },
        { href: '/admin/banners', label: '🖼 Banners' },
        { href: '/admin/vouchers', label: '🎟 Vouchers' },
        { href: '/admin/quotes', label: '📋 B2B Quotes' },
        { href: '/admin/reviews', label: '⭐ Reviews' },
    ]

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl flex-shrink-0 min-h-screen">
                <div className="p-6 border-b border-white/10">
                    <p className="font-bold text-xl text-white">🌿 KK Rotan</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Admin Panel</p>
                </div>
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10 space-y-2">
                    <Link href="/" className="block text-xs text-slate-400 hover:text-white transition-colors">← View Store</Link>
                    <form action={adminLogout}>
                        <button type="submit" className="w-full text-left text-xs text-red-400 hover:text-red-300 transition-colors py-1">
                            Logout Admin
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto bg-slate-50">
                {children}
            </main>
        </div>
    )
}
