'use client'

import { useState } from 'react'
import { EMERGENCY_CONTACTS } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const CARD_STYLES = {
  critical: 'border-red-200 bg-red-50/80 text-red-900 shadow-red-100/60',
  standard: 'border-blue-200 bg-blue-50/80 text-blue-900 shadow-blue-100/60'
}

const BUTTON_VARIANTS = {
  critical: {
    primary: 'bg-red-600 hover:bg-red-500 text-white',
    secondary: 'border-red-200 text-red-700 hover:bg-red-100'
  },
  standard: {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'border-blue-200 text-blue-700 hover:bg-blue-100'
  }
}

export default function EmergencyPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      setCopiedId(id)
      toast.success('Nomor tersalin')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy phone number', error)
      toast.error('Gagal menyalin nomor')
    }
  }

  const formatTelHref = (phone: string) => {
    return `tel:${phone.replace(/[^+\d]/g, '')}`
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-orange-500 flex items-center gap-2">
          <span className="text-xl">🚨</span>
          Kontak Darurat Perjalanan
        </p>
        <h1 className="text-3xl font-bold">Emergency & Layanan Penting</h1>
        <p className="text-muted-foreground max-w-2xl">
          Simpan nomor-nomor berikut untuk keadaan darurat selama perjalanan. Tombol telepon akan langsung men-dial dari perangkat Anda, sementara tombol salin memudahkan berbagi ke anggota tim.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {EMERGENCY_CONTACTS.map((contact) => {
          const tone = contact.priority === 'critical' ? 'critical' : 'standard'
          return (
            <Card
              key={contact.id}
              className={`border shadow-sm ${CARD_STYLES[tone]}`}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl" aria-hidden>
                    {contact.emoji}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      {contact.name}
                      {tone === 'critical' && (
                        <span className="rounded-full bg-red-100 px-3 py-0.5 text-xs font-semibold text-red-700">
                          DARURAT
                        </span>
                      )}
                    </h2>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                    <p className="text-2xl font-bold tracking-wide">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    className={`${BUTTON_VARIANTS[tone].primary} flex-1 min-w-[140px] flex items-center justify-center gap-2`}
                    onClick={() => {
                      window.location.href = formatTelHref(contact.phone)
                    }}
                  >
                    <span>📞</span>
                    Telepon
                  </Button>
                  <Button
                    variant="outline"
                    className={`${BUTTON_VARIANTS[tone].secondary} flex-1 min-w-[140px]`}
                    onClick={() => handleCopy(contact.id, contact.phone)}
                  >
                    {copiedId === contact.id ? '✅ Tersalin!' : 'Salin Nomor'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
