'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, Home, ArrowLeft, BarChart3, FileText } from 'lucide-react'
import { Button } from './ui/button'
import { clearAuth } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useNavigationHistory } from '@/hooks/useNavigationHistory'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const { goBack } = useNavigationHistory()

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    setTheme(savedTheme)
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const handleBack = () => {
    goBack()
  }

  if (pathname === '/') return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🇲🇾</span>
            <span className="font-bold text-lg hidden sm:inline">Malaysia Trip</span>
          </Link>
          
          {pathname !== '/dashboard' && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
              
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          <Link href="/statistics">
            <Button variant="ghost" size="icon" title="Statistics">
              <BarChart3 className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href="/global-files/paspor">
            <Button variant="ghost" size="icon" title="Global Files">
              <FileText className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/itinerary">
            <Button variant="ghost" size="icon" title="Itinerary">
              <span role="img" aria-label="Itinerary" className="text-base">🗓️</span>
            </Button>
          </Link>

          <Link href="/emergency">
            <Button variant="ghost" size="icon" title="Kontak Darurat">
              <span role="img" aria-label="Emergency" className="text-base">🚨</span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
