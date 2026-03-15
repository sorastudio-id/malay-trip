'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Wind, Droplets } from 'lucide-react'

interface WeatherResponse {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    weather_code: number
    wind_speed_10m: number
    time: string
  }
}

const weatherDescriptions: Record<number, { label: string; emoji: string }> = {
  0: { label: 'Cerah', emoji: '☀️' },
  1: { label: 'Cerah Berawan', emoji: '🌤️' },
  2: { label: 'Berawan', emoji: '⛅' },
  3: { label: 'Mendung', emoji: '☁️' },
  45: { label: 'Berkabut', emoji: '🌫️' },
  48: { label: 'Kabut Beku', emoji: '🌫️' },
  51: { label: 'Gerimis Ringan', emoji: '🌦️' },
  53: { label: 'Gerimis', emoji: '🌦️' },
  55: { label: 'Gerimis Tebal', emoji: '🌧️' },
  61: { label: 'Hujan Ringan', emoji: '🌧️' },
  63: { label: 'Hujan Sedang', emoji: '🌧️' },
  65: { label: 'Hujan Lebat', emoji: '🌧️' },
  80: { label: 'Hujan Lokal', emoji: '🌦️' },
  81: { label: 'Hujan Sporadis', emoji: '🌧️' },
  82: { label: 'Hujan Badai', emoji: '⛈️' },
  95: { label: 'Badai Petir', emoji: '⛈️' },
  96: { label: 'Badai Petir', emoji: '⛈️' },
  99: { label: 'Badai Petir Hebat', emoji: '🌩️' }
}

const getWeatherInfo = (code: number) => {
  return weatherDescriptions[code] || { label: 'Cuaca tidak diketahui', emoji: '🌈' }
}

export default function WeatherWidget({ condensed = false }: { condensed?: boolean }) {
  const [data, setData] = useState<WeatherResponse['current'] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatedAt, setUpdatedAt] = useState<string>('')

  const fetchWeather = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=3.1390&longitude=101.6869&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Kuala_Lumpur')
      if (!res.ok) throw new Error('Gagal mengambil cuaca')
      const json: WeatherResponse = await res.json()
      setData(json.current)
      setUpdatedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    } catch (err) {
      console.error(err)
      setError('Tidak bisa memuat data cuaca')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
    const interval = setInterval(fetchWeather, 600_000)
    return () => clearInterval(interval)
  }, [])

  const titleSize = condensed ? 'text-lg' : 'text-2xl'

  const weatherInfo = data ? getWeatherInfo(data.weather_code) : null

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className={titleSize}>Cuaca Kuala Lumpur</CardTitle>
        {updatedAt && !loading && (
          <p className="text-sm text-muted-foreground">Diperbarui: {updatedAt}</p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive text-sm">
            {error}
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl" aria-hidden>{weatherInfo?.emoji}</span>
              <div>
                <p className="text-lg font-semibold">{weatherInfo?.label}</p>
                <p className="text-sm text-muted-foreground">Suhu {data.temperature_2m}°C</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Kelembaban</p>
                <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                  <Droplets className="h-4 w-4" />
                  {data.relative_humidity_2m}%
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Angin</p>
                <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                  <Wind className="h-4 w-4" />
                  {data.wind_speed_10m} km/j
                </div>
              </div>
              <div className="rounded-xl border p-3">
                <p className="text-xs text-muted-foreground">Kode</p>
                <div className="text-lg font-semibold">{data.weather_code}</div>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
