import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1A3A6B',
}

export const metadata: Metadata = {
  title: '🇲🇾 Malaysia Trip Manager',
  description: 'Kelola dokumen perjalanan Malaysia dengan mudah',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icon-192-new.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MY Trip'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} bg-background text-foreground`}>
        <Navbar />
        <main className="min-h-screen w-full">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
