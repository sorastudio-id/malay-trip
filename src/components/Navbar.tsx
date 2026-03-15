'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, Home, ArrowLeft, BarChart3, FileText, Menu, X, DollarSign } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [menuOpen, setMenuOpen] = useState(false)

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      router.push('/')
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (pathname === '/') return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="page-container py-3 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
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
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden md:flex items-center gap-2">
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
            <Link href="/currency">
              <Button variant="ghost" size="icon" title="Kurs & Cuaca">
                <DollarSign className="h-5 w-5" />
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
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="page-container py-4 space-y-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1" onClick={toggleTheme}>
                {theme === 'light' ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" /> Mode Gelap
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" /> Mode Terang
                  </>
                )}
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
            <div className="grid gap-2">
              <Link href="/statistics" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" /> Statistik
                </Button>
              </Link>
              <Link href="/currency" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" /> Kurs & Cuaca
                </Button>
              </Link>
              <Link href="/global-files/paspor" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" /> Global Files
                </Button>
              </Link>
              <Link href="/itinerary" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  🗓️ <span className="ml-2">Itinerary</span>
                </Button>
              </Link>
              <Link href="/emergency" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  🚨 <span className="ml-2">Kontak Darurat</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
