'use client'

import { useEffect, useMemo, useState } from 'react'
import { ITINERARY_DAYS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function compareTimes(date: string, hour: string) {
  const target = new Date(`${date}T${hour}:00`)
  const now = new Date()
  if (now.getTime() > target.getTime()) return 1
  return -1
}

export default function ItineraryPage() {
  const todayIndex = useMemo(() => {
    const now = new Date()
    return ITINERARY_DAYS.findIndex((day) => {
      const currentDayStart = new Date(`${day.date}T00:00:00`)
      return (
        now.getUTCFullYear() === currentDayStart.getUTCFullYear() &&
        now.getUTCMonth() === currentDayStart.getUTCMonth() &&
        now.getUTCDate() === currentDayStart.getUTCDate()
      )
    })
  }, [])

  const [activeDay, setActiveDay] = useState(() => (todayIndex >= 0 ? todayIndex : 0))

  useEffect(() => {
    if (todayIndex >= 0) {
      setActiveDay(todayIndex)
      const section = document.getElementById(`itinerary-day-${todayIndex}`)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [todayIndex])

  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-orange-500 flex items-center gap-2">
          <span className="text-xl">🗓️</span>
          Rencana Perjalanan 16 – 23 Maret 2026
        </p>
        <h1 className="text-3xl font-bold">Itinerary Malaysia Trip</h1>
        <p className="text-muted-foreground max-w-2xl">
          Lihat rundown perjalanan per hari lengkap dengan waktu, lokasi, dan estimasi biaya. Tab ditandai "HARI INI"
          saat sesuai dengan tanggal berjalan.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2">
        {ITINERARY_DAYS.map((day, index) => {
          const isActive = index === activeDay
          const isToday = index === todayIndex
          return (
            <Button
              key={day.id}
              variant={isActive ? 'default' : 'outline'}
              className={cn('whitespace-nowrap flex items-center gap-2', isToday && 'border-orange-500 text-orange-600')}
              onClick={() => setActiveDay(index)}
            >
              <span className="font-semibold">Day {day.id}</span>
              {isToday && <span className="text-xs rounded-full bg-orange-100 px-2 py-0.5 text-orange-600">HARI INI</span>}
            </Button>
          )
        })}
      </div>

      <div className="space-y-8">
        {ITINERARY_DAYS.map((day, index) => (
          <section
            id={`itinerary-day-${index}`}
            key={day.id}
            className={cn(
              'rounded-2xl border p-6 space-y-6 transition-all',
              index === activeDay ? 'border-[#1A3A6B] shadow-lg' : 'border-border bg-muted/40'
            )}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="text-left">
                <h2 className="text-2xl font-semibold">
                  Day {day.id} · {day.label}
                </h2>
                <p className="text-muted-foreground">{day.theme}</p>
                <p className="text-sm text-muted-foreground">{day.description}</p>
              </div>
              {index === todayIndex && (
                <span className="rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-600">Sedang Berlangsung</span>
              )}
            </div>

            {(() => {
              const highlightIndex = (() => {
                if (index !== todayIndex) return -1
                const firstUpcoming = day.items.findIndex((entry) => compareTimes(day.date, entry.timeValue) === -1)
                if (firstUpcoming >= 0) return firstUpcoming
                return day.items.length - 1
              })()

              return (
                <div className="relative border-l-2 border-muted pl-6 space-y-6">
                  {day.items.map((item, itemIdx) => {
                    const isPast = compareTimes(day.date, item.timeValue) === 1
                    const isHighlight = index === todayIndex && itemIdx === highlightIndex

                    return (
                      <div
                        key={`${day.id}-${itemIdx}`}
                        className={cn(
                          'relative',
                          isPast && 'opacity-60',
                          isHighlight && 'border-l-4 border-[#E07B2A] -ml-2 pl-2'
                        )}
                      >
                        <div className="absolute -left-7 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#E07B2A] shadow" />
                        <div className="flex flex-wrap items-start gap-4">
                          <div className="min-w-[120px]">
                            <p className="font-semibold text-[#E07B2A]">{item.timeLabel}</p>
                            {item.timezone && <span className="text-xs text-muted-foreground">Zona {item.timezone}</span>}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xl" aria-hidden>
                                {item.emoji}
                              </span>
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                {item.title}
                                {item.priceTag && (
                                  <span
                                    className={cn(
                                      'text-xs rounded-full px-2 py-0.5',
                                      item.priceTag.toLowerCase().includes('gratis')
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    )}
                                  >
                                    {item.priceTag}
                                  </span>
                                )}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            {item.mapsUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={() => window.open(item.mapsUrl!, '_blank')}
                              >
                                Lihat di Maps
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </section>
        ))}
      </div>
    </div>
  )
}
