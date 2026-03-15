'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

function LoginContent() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          throw new Error(data?.error || 'Password salah')
        }

        toast.success('Login berhasil!')
        const redirectPath = searchParams.get('redirect') || '/dashboard'
        router.replace(redirectPath)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Login gagal'
        setError(message)
        toast.error(message)
        setLoading(false)
      })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1920&q=80')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md mx-4 rounded-2xl border border-white/20 bg-white/10 text-white shadow-2xl backdrop-blur-md animate-in fade-in duration-700">
          <CardHeader className="space-y-4 text-center pb-0">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-500/30">
              MY
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-white">Malaysia Trip Manager</CardTitle>
              <p className="text-sm text-white/70">16 – 23 Maret 2026</p>
              <p className="text-xs text-white/70 tracking-wide">Ihsan • Lisza • Taufiq • Ahsan • Athaya</p>
            </div>
            <p className="text-sm text-white/80">
              Masukkan password untuk mengakses dokumen perjalanan
            </p>
          </CardHeader>

          <CardContent className="space-y-6 pt-0">
            <div className="border-t border-white/20" />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/30 bg-white/10 px-10 py-3 text-white placeholder:text-white/50 focus:border-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Masukkan password"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition-colors hover:text-white"
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
              {error && <p className="text-sm text-red-300">{error}</p>}

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:from-blue-400 hover:to-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
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
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
