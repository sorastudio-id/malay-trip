"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'

interface ExchangeRateResponse {
  result: string
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
  const [myrValue, setMyrValue] = useState('')
  const [idrValue, setIdrValue] = useState('')

  const fetchRate = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('https://open.er-api.com/v6/latest/MYR')
      if (!res.ok) throw new Error('Gagal mengambil kurs')
      const data: ExchangeRateResponse = await res.json()
      const currentRate = data.rates.IDR
      setRate(currentRate)
      setUpdatedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
      if (myrValue) {
        setIdrValue(formatIdr(parseFloat(myrValue) * currentRate))
      } else {
        setIdrValue('')
      }
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
    if (myrValue) {
      const amount = parseFloat(myrValue)
      if (!isNaN(amount)) {
        setIdrValue(formatIdr(amount * rate))
      }
    } else {
      setIdrValue('')
    }
  }, [myrValue, rate])

  const handleMyrChange = (value: string) => {
    setMyrValue(value)
    if (rate && value) {
      const numeric = parseFloat(value)
      if (!isNaN(numeric)) {
        setIdrValue(formatIdr(numeric * rate))
      }
    } else {
      setIdrValue('')
    }
  }

  const handleIdrChange = (value: string) => {
    setIdrValue(value)
    if (rate && value) {
      const numeric = parseFloat(value.replace(/[^0-9]/g, ''))
      if (!isNaN(numeric)) {
        setMyrValue((numeric / rate).toFixed(2))
      }
    } else {
      setMyrValue('')
    }
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
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm text-muted-foreground">MYR</label>
                <div className="relative">
                  <Input
                    value={myrValue}
                    onChange={(e) => handleMyrChange(e.target.value)}
                    className="pl-12"
                    inputMode="decimal"
                    placeholder="0.00 MYR"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold">RM</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm text-muted-foreground">IDR</label>
                <div className="relative">
                  <Input
                    value={idrValue}
                    onChange={(e) => handleIdrChange(e.target.value)}
                    className="pl-12"
                    inputMode="numeric"
                    placeholder="0 IDR"
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
