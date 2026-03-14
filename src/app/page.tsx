'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isAuthenticated, setAuth } from '@/lib/utils'
import { toast } from 'sonner'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const correctPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || 'keranjangibu1'

    if (password === correctPassword) {
      setAuth()
      toast.success('Login berhasil!')
      router.push('/dashboard')
    } else {
      toast.error('Password salah!')
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-[#1A3A6B] via-[#244876] to-[#E07B2A]">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_45%)]" />
      <Card className="w-full max-w-md bg-white text-gray-900 rounded-2xl shadow-[0_25px_50px_rgba(26,58,107,0.25)] border border-white/40 relative">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#1A3A6B] rounded-full flex items-center justify-center shadow-lg shadow-[#1A3A6B]/30">
            <span className="text-3xl">🇲🇾</span>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-gray-900">Malaysia Trip Manager</CardTitle>
            <p className="text-sm text-gray-600">16 – 23 Maret 2026</p>
            <p className="text-xs text-gray-600 tracking-wide">Ihsan • Lisza • Taufiq • Ahsan • Athaya</p>
          </div>
          <p className="text-sm text-gray-600">
            Masukkan password untuk mengakses dokumen perjalanan
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1A3A6B]"
                  placeholder="Masukkan password"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#1A3A6B] hover:bg-[#162a4a] transition-all duration-200 shadow-lg shadow-[#1A3A6B]/30"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                'Masuk'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
