import Link from 'next/link'

export function Footer() {
    return (
        <footer className="border-t bg-slate-900 text-slate-300 mt-auto">
            <div className="container mx-auto py-12 px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <p className="font-bold text-xl text-white mb-2">🌿 KK Rotan</p>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Malaysia's premier rattan supplier since decades. Quality raw rattan, semi-processed materials, and premium handcrafted furniture.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Shop</p>
                        <div className="space-y-2 text-sm">
                            <Link href="/products" className="block hover:text-white transition-colors">All Products</Link>
                            <Link href="/products?category=raw-rattan" className="block hover:text-white transition-colors">Raw Rattan</Link>
                            <Link href="/products?category=rattan-furniture" className="block hover:text-white transition-colors">Furniture</Link>
                            <Link href="/products?category=baskets-decor" className="block hover:text-white transition-colors">Baskets & Decor</Link>
                            <Link href="/b2b" className="block hover:text-white transition-colors">B2B Wholesale</Link>
                        </div>
                    </div>

                    {/* Company */}
                    <div>
                        <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Company</p>
                        <div className="space-y-2 text-sm">
                            <Link href="/about" className="block hover:text-white transition-colors">About Us</Link>
                            <Link href="/gallery" className="block hover:text-white transition-colors">Gallery</Link>
                            <Link href="/contact" className="block hover:text-white transition-colors">Contact</Link>
                            <Link href="/terms" className="block hover:text-white transition-colors">Terms of Service</Link>
                            <Link href="/privacy" className="block hover:text-white transition-colors">Privacy Policy</Link>
                        </div>
                    </div>

                    {/* App Download */}
                    <div>
                        <p className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Mobile App</p>
                        <p className="text-sm text-slate-400 mb-4">Shop on the go with our KK Rotan mobile app.</p>
                        <a
                            href="/downloads/kkrotan.apk"
                            download
                            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-amber-500/25 text-sm"
                        >
                            <span className="text-xl">📱</span>
                            <div className="text-left">
                                <p className="text-xs opacity-80 font-normal">Download for Android</p>
                                <p className="font-bold">KK Rotan APK</p>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        © {new Date().getFullYear()} KK Rotan. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                        <span>Made with ❤️ in Malaysia</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
