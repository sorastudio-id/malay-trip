'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, ArrowRight, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import MemberCard from '@/components/MemberCard'
import { GROUP_FOLDERS, MEMBERS, MEMBER_FOLDERS } from '@/lib/constants'
import { countGroupFiles, listFiles } from '@/lib/supabase'
import { MemberCardSkeleton } from '@/components/LoadingSkeleton'
import CurrencyWidget from '@/components/CurrencyWidget'
import WeatherWidget from '@/components/WeatherWidget'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [groupFileCount, setGroupFileCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({})
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'finished'
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const TRIP_START = new Date('2026-03-16T00:00:00+08:00')
  const TRIP_END = new Date('2026-03-23T23:59:59+08:00')
  const TRIP_REMINDER = new Date('2026-03-15T09:00:00+08:00')

  const globalShortcuts = [
    {
      id: 'shortcut-passports',
      emoji: '🛂',
      title: 'Semua Paspor',
      description: 'Lihat paspor seluruh anggota',
      href: '/global-files/paspor',
      accent: '#1A3A6B'
    },
    {
      id: 'shortcut-mdac',
      emoji: '📋',
      title: 'Semua MDAC',
      description: 'Lihat MDAC seluruh anggota',
      href: '/global-files/mdac',
      accent: '#E07B2A'
    }
  ]

  const handleEnableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Browser tidak mendukung notifikasi')
      return
    }

    if (Notification.permission === 'granted') {
      localStorage.setItem('trip-notifications-enabled', 'true')
      setNotificationsEnabled(true)
      toast.success('Notifikasi aktif')
      return
    }

    const result = await Notification.requestPermission()
    if (result === 'granted') {
      localStorage.setItem('trip-notifications-enabled', 'true')
      setNotificationsEnabled(true)
      toast.success('Notifikasi aktif')
    } else {
      toast.error('Notifikasi tidak diizinkan')
    }
  }

  const showLocalNotification = async (title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    try {
      const registration = await navigator.serviceWorker?.ready
      if (registration?.showNotification) {
        registration.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        })
      } else {
        new Notification(title, { body })
      }
    } catch (error) {
      console.error('Unable to show notification', error)
    }
  }

  const checkIncompleteDocuments = async () => {
    if (typeof window === 'undefined') return
    const flagKey = 'notif-missing-documents'
    if (localStorage.getItem(flagKey)) return

    try {
      const results = await Promise.all(
        MEMBERS.map(async (member) => {
          const statuses = await Promise.all(
            MEMBER_FOLDERS.map(async (folder) => {
              const files = await listFiles(`${member.slug}/${folder.slug}`)
              return files.length > 0
            })
          )
          return statuses.some((filled) => !filled)
        })
      )

      if (results.some(Boolean)) {
        await showLocalNotification('Lengkapi dokumenmu 📋', 'Masih ada dokumen yang belum diupload. Yuk lengkapi!')
        localStorage.setItem(flagKey, new Date().toISOString())
      }
    } catch (error) {
      console.error('Error checking documents pending:', error)
    }
  }

  useEffect(() => {
    loadGroupFiles()
  }, [refreshKey])

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const saved = localStorage.getItem('trip-notifications-enabled') === 'true'
    setNotificationsEnabled(saved)
  }, [])

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()

      if (now < TRIP_START) {
        const diff = TRIP_START.getTime() - now.getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)

        setCountdown({ days, hours, minutes, seconds, status: 'upcoming' })
        return
      }

      if (now >= TRIP_START && now <= TRIP_END) {
        setCountdown((prev) => ({ ...prev, status: 'ongoing' }))
        return
      }

      setCountdown((prev) => ({ ...prev, status: 'finished' }))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!notificationsEnabled || typeof window === 'undefined' || !('Notification' in window)) return

    const reminderKey = 'trip-reminder-sent'
    const scheduleReminder = () => {
      const now = new Date()
      const hasSent = localStorage.getItem(reminderKey)
      const sendReminder = () => {
        showLocalNotification('Besok berangkat! ✈️', 'Besok berangkat! Cek dokumen kamu 📋')
        localStorage.setItem(reminderKey, new Date().toISOString())
      }

      if (now >= TRIP_REMINDER && now <= TRIP_START) {
        if (!hasSent) sendReminder()
        return null
      }

      const diff = TRIP_REMINDER.getTime() - now.getTime()
      if (diff > 0 && diff <= 24 * 60 * 60 * 1000 && !hasSent) {
        const timer = window.setTimeout(sendReminder, diff)
        return () => window.clearTimeout(timer)
      }
      return null
    }

    const cleanup = scheduleReminder()
    return () => {
      if (cleanup) cleanup()
    }
  }, [notificationsEnabled])

  useEffect(() => {
    if (!notificationsEnabled) return
    checkIncompleteDocuments()
  }, [notificationsEnabled, refreshKey])

  const loadGroupFiles = async () => {
    try {
      setLoading(true)
      const count = await countGroupFiles()
      setGroupFileCount(count)

      const entries = await Promise.all(
        GROUP_FOLDERS.map(async (folder) => {
          try {
            const files = await listFiles(`grup/${folder.slug}`)
            return [folder.slug, files.length] as const
          } catch (error) {
            console.error(`Error loading grup/${folder.slug}:`, error)
            return [folder.slug, 0] as const
          }
        })
      )
      setFolderCounts(Object.fromEntries(entries))
    } catch (error) {
      console.error('Error loading group files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const firstRowMembers = MEMBERS.slice(0, 3)
  const secondRowMembers = MEMBERS.slice(3)

  return (
    <div className="page-container py-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Trip Malaysia</h1>
          <p className="text-muted-foreground">
            Kelola semua dokumen perjalanan dalam satu tempat
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border border-primary/10 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10">
        <CardContent className="p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Countdown Hari H</p>
            {countdown.status === 'upcoming' ? (
              <div className="mt-2 text-2xl md:text-3xl font-semibold">
                {countdown.days} hari {countdown.hours} jam {countdown.minutes} menit {countdown.seconds} detik
              </div>
            ) : countdown.status === 'ongoing' ? (
              <div className="mt-2 text-2xl md:text-3xl font-semibold text-green-600">
                Trip sedang berlangsung! 🇲🇾
              </div>
            ) : (
              <div className="mt-2 text-2xl md:text-3xl font-semibold text-muted-foreground">
                Trip sudah selesai! 🎉
              </div>
            )}
          </div>
          {countdown.status === 'upcoming' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[['Hari', countdown.days], ['Jam', countdown.hours], ['Menit', countdown.minutes], ['Detik', countdown.seconds]].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="text-3xl font-bold">{value}</div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-blue-200/30 bg-blue-50/40 dark:bg-blue-950/30">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-5">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">Notifikasi Perjalanan</p>
            <p className="text-base font-semibold">Terima pengingat penting langsung di device kamu</p>
            <p className="text-sm text-muted-foreground">Pengingat H-1 & dokumen yang belum lengkap</p>
          </div>
          <Button
            variant={notificationsEnabled ? 'outline' : 'default'}
            onClick={handleEnableNotifications}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            {notificationsEnabled ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <CurrencyWidget condensed />
        <WeatherWidget condensed />
      </div>

      <div
        className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#0F1B3D] via-[#152452] to-[#2C1E52] p-6 text-white shadow-lg"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="text-4xl" aria-hidden>
              🤖
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-200/80">Baru!</p>
              <h2 className="text-2xl font-semibold">Upload Cerdas AI</h2>
              <p className="text-sm text-blue-100/90">
                Upload PDF, AI otomatis deteksi & simpan ke folder yang benar
              </p>
            </div>
          </div>
          <Link href="/upload-ai" className="md:ml-8">
            <Button
              size="lg"
              className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Mulai Upload →
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {(loading ? firstRowMembers : firstRowMembers).map((member, index) => (
                  loading ? (
                    <MemberCardSkeleton key={member.id ?? index} />
                  ) : (
                    <MemberCard key={member.id} member={member} onRefresh={refreshKey} />
                  )
                ))}
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                {(loading ? secondRowMembers : secondRowMembers).map((member, index) => (
                  loading ? (
                    <MemberCardSkeleton key={member.id ?? index} />
                  ) : (
                    <MemberCard key={member.id} member={member} onRefresh={refreshKey} />
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm uppercase text-muted-foreground tracking-wide">📂 Lihat Semua Dokumen Per Kategori</p>
              <p className="text-muted-foreground">Lihat dokumen dari semua anggota dalam satu halaman</p>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {globalShortcuts.map((shortcut) => (
                <Link key={shortcut.id} href={shortcut.href}>
                  <Card
                    className="hover:shadow-lg transition-shadow h-full"
                    style={{ borderColor: shortcut.accent + '33', backgroundColor: shortcut.accent + '08' }}
                  >
                    <CardContent className="p-6 h-full flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl" style={{ color: shortcut.accent }}>{shortcut.emoji}</div>
                        <div>
                          <h3 className="text-xl font-semibold" style={{ color: shortcut.accent }}>{shortcut.title}</h3>
                          <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button variant="outline" className="w-full">
                          Buka Halaman
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase text-muted-foreground tracking-wide">File Bersama</p>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Semua tiket & dokumen grup</h2>
                  <p className="text-muted-foreground mt-1">
                    {GROUP_FOLDERS.length} folder • {groupFileCount} file tersimpan untuk seluruh anggota.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {GROUP_FOLDERS.map((folder) => {
                const count = folderCounts[folder.slug] ?? 0
                return (
                  <Card key={folder.id} className="h-full">
                    <CardContent className="p-6 flex flex-col gap-4 h-full">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{folder.emoji}</div>
                        <div>
                          <h3 className="text-xl font-semibold">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">{folder.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {count === 0 ? 'Belum ada file' : `${count} file tersimpan`}
                        </span>
                        <span>{folder.items?.join(' • ')}</span>
                      </div>
                      <div className="mt-auto">
                        <Link href={`/group/${folder.slug}`}>
                          <Button className="w-full" variant="outline">
                            Buka Folder
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
