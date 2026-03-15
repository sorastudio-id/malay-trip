"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface FrankfurterResponse {
  date: string
  rates: {
    IDR: number
  }
}

const formatIdr = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)

export default function CurrencyWidget({ condensed = false }: { condensed?: boolean }) {
  const [rate, setRate] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>('')
  const [myrValue, setMyrValue] = useState('1')
  const [idrValue, setIdrValue] = useState('')

  const fetchRate = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('https://api.frankfurter.app/latest?from=MYR&to=IDR')
      if (!res.ok) throw new Error('Gagal mengambil kurs')
      const data: FrankfurterResponse = await res.json()
      const currentRate = data.rates.IDR
      setRate(currentRate)
      setUpdatedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
      setIdrValue(formatIdr(Number(myrValue || '0') * currentRate))
    } catch (err) {
      console.error(err)
      setError('Tidak bisa memuat kurs saat ini')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRate()
    const interval = setInterval(fetchRate, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!rate) return
    const amount = Number(myrValue || '0')
    if (isNaN(amount)) return
    setIdrValue(formatIdr(amount * rate))
  }, [myrValue, rate])

  const onIdrChange = (value: string) => {
    if (!rate) return
    const numeric = Number(value.replace(/[^0-9]/g, ''))
    const myr = numeric / rate
    setMyrValue(Number.isFinite(myr) ? myr.toFixed(2) : '0')
    setIdrValue(formatIdr(numeric))
  }

  const titleSize = condensed ? 'text-lg' : 'text-2xl'

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className={titleSize}>Kurs MYR → IDR</CardTitle>
        {updatedAt && !loading && (
          <p className="text-sm text-muted-foreground">Diperbarui: {updatedAt}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <Skeleton className="h-16 w-full" />
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        ) : rate ? (
          <div className="space-y-4">
            <p className="text-lg font-semibold">1 MYR = {formatIdr(rate)}</p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">MYR</label>
                <div className="relative">
                  <Input
                    value={myrValue}
                    onChange={(e) => setMyrValue(e.target.value)}
                    className="pl-12"
                    inputMode="decimal"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">RM</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">IDR</label>
                <div className="relative">
                  <Input
                    value={idrValue}
                    onChange={(e) => onIdrChange(e.target.value)}
                    className="pl-12"
                    inputMode="numeric"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">Rp</span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
