import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KK Rotan Commerce',
  description: 'Premium Rattan Supplier and Furniture – Malaysia\'s Trusted Rattan Brand',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
