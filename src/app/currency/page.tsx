import CurrencyWidget from '@/components/CurrencyWidget'
import WeatherWidget from '@/components/WeatherWidget'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Kurs & Cuaca | Malaysia Trip'
}

export default function CurrencyPage() {
  return (
    <div className="page-container py-10 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Kurs & Cuaca</p>
          <h1 className="text-3xl font-bold">Pantau Kurs MYR dan Cuaca KL</h1>
          <p className="text-muted-foreground max-w-2xl">
            Lihat kurs MYR → IDR terbaru, konversi cepat, serta kondisi cuaca Kuala Lumpur sebelum perjalanan.
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CurrencyWidget />
        <WeatherWidget />
      </div>
    </div>
  )
}
