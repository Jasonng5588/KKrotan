'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { logout } from '@/app/login/actions'

interface NavbarClientProps {
    isLoggedIn: boolean
}

export function NavbarClient({ isLoggedIn }: NavbarClientProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const pathname = usePathname()

    // Close menu on route change
    useEffect(() => { setMenuOpen(false) }, [pathname])

    const navLinks = [
        { href: '/products', label: 'Products' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/b2b', label: 'B2B Wholesale' },
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
    ]

    const authLinks = isLoggedIn
        ? [
            { href: '/cart', label: '🛒 Cart' },
            { href: '/profile/wishlist', label: '♡ Wishlist' },
            { href: '/profile/orders', label: 'My Orders' },
            { href: '/profile', label: 'Profile' },
        ]
        : [
            { href: '/login', label: 'Login' },
            { href: '/register', label: 'Register' },
        ]

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setMenuOpen(false)}>
                    <span className="font-bold text-xl text-primary tracking-tight whitespace-nowrap">🌿 KK Rotan</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    {navLinks.map(l => (
                        <Link key={l.href} href={l.href} className="transition-colors hover:text-primary whitespace-nowrap">{l.label}</Link>
                    ))}
                </nav>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center space-x-2">
                    {isLoggedIn ? (
                        <>
                            <Link href="/cart"><Button variant="ghost" size="sm">🛒 Cart</Button></Link>
                            <Link href="/profile/wishlist"><Button variant="ghost" size="sm">♡ Wishlist</Button></Link>
                            <Link href="/profile/orders"><Button variant="ghost" size="sm">My Orders</Button></Link>
                            <form action={logout}><Button variant="outline" size="sm" type="submit">Logout</Button></form>
                        </>
                    ) : (
                        <>
                            <Link href="/login"><Button variant="ghost" size="sm">Login</Button></Link>
                            <Link href="/register"><Button size="sm">Register</Button></Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-foreground transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-foreground my-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-6 h-0.5 bg-foreground transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {menuOpen && (
                <div className="md:hidden border-t bg-background/98 backdrop-blur shadow-lg">
                    <div className="container mx-auto px-4 py-4 space-y-1">
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3 px-2">Menu</p>
                        {navLinks.map(l => (
                            <Link
                                key={l.href}
                                href={l.href}
                                className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                            >
                                {l.label}
                            </Link>
                        ))}
                        <div className="border-t my-3" />
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-3 px-2">Account</p>
                        {isLoggedIn ? (
                            <>
                                <Link href="/cart" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">🛒 Cart</Link>
                                <Link href="/profile/wishlist" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">♡ Wishlist</Link>
                                <Link href="/profile/orders" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">📦 My Orders</Link>
                                <Link href="/profile" className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">👤 Profile</Link>
                                <div className="px-3 pt-2">
                                    <form action={logout}>
                                        <Button variant="outline" size="sm" type="submit" className="w-full">Logout</Button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="px-3 flex gap-3">
                                <Link href="/login" className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                                </Link>
                                <Link href="/register" className="flex-1">
                                    <Button size="sm" className="w-full">Register</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}
