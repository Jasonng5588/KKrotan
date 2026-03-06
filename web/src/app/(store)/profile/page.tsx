import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfileEditForm } from '@/components/profile/ProfileEditForm'

export const revalidate = 0

export default async function ProfilePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)
    const { count: wishlistCount } = await supabase.from('wishlists').select('*', { count: 'exact', head: true }).eq('profile_id', user.id)

    const initials = [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || user.email?.[0]?.toUpperCase() || '?'

    return (
        <div className="container mx-auto px-4 py-10 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-foreground">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left: Profile Edit */}
                <div className="md:col-span-2 space-y-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary border-2 border-primary/20">
                            {initials}
                        </div>
                        <div>
                            <p className="font-bold text-lg">{[profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || 'Your Account'}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase mt-1">
                                {profile?.role || 'customer'}
                            </span>
                        </div>
                    </div>

                    <ProfileEditForm
                        profile={{
                            id: user.id,
                            email: user.email || '',
                            first_name: profile?.first_name,
                            last_name: profile?.last_name,
                            phone: profile?.phone,
                        }}
                    />
                </div>

                {/* Right: Quick Links */}
                <div className="space-y-3">
                    <div className="bg-card border rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold text-base mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link href="/profile/orders" className="block">
                                <Button variant="outline" className="w-full justify-between">
                                    <span>📦 My Orders</span>
                                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">{ordersCount || 0}</span>
                                </Button>
                            </Link>
                            <Link href="/profile/wishlist" className="block">
                                <Button variant="outline" className="w-full justify-between">
                                    <span>♡ Wishlist</span>
                                    <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs font-bold">{wishlistCount || 0}</span>
                                </Button>
                            </Link>
                            <Link href="/cart" className="block">
                                <Button variant="outline" className="w-full">🛒 Shopping Cart</Button>
                            </Link>
                            <Link href="/b2b" className="block">
                                <Button variant="outline" className="w-full">📋 B2B Quote</Button>
                            </Link>
                            <Link href="/admin" className="block">
                                <Button className="w-full">🔐 Admin Panel</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
