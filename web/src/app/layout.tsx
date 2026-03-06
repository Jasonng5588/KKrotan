import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KK Rotan Commerce',
  description: 'Premium Rattan Supplier and Furniture – Malaysia\'s Trusted Rattan Brand',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = headers()
  const pathname = headersList.get('x-pathname') || ''
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        {!isAdminRoute && <Navbar />}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        {!isAdminRoute && <Footer />}
      </body>
    </html>
  )
}
