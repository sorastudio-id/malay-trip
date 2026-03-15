'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FileUploader from '@/components/FileUploader'
import FileList from '@/components/FileList'

const folderConfig = {
  'tiket-transportasi': {
    label: 'Tiket & Transportasi',
    emoji: '🎫',
    color: 'blue',
    description: 'E-tiket pesawat, ferry, dan bus'
  },
  akomodasi: {
    label: 'Akomodasi',
    emoji: '🏨',
    color: 'green',
    description: 'Konfirmasi Airbnb dan voucher hotel'
  },
  'tiket-wisata': {
    label: 'Tiket Wisata',
    emoji: '🎡',
    color: 'orange',
    description: 'Tiket KL Tower dan Genting SkyWorlds'
  },
  'dokumen-panduan': {
    label: 'Dokumen Panduan',
    emoji: '📋',
    color: 'purple',
    description: 'Trip plan dan checklist perjalanan'
  }
} as const

type FolderSlug = keyof typeof folderConfig

type ColorTheme = {
  badge: string
  pill: string
  border: string
  glow: string
}

const colorThemes: Record<string, ColorTheme> = {
  blue: {
    badge: 'bg-blue-500/15 text-blue-600',
    pill: 'bg-blue-100 text-blue-700',
    border: 'border-blue-200/60',
    glow: 'shadow-blue-100/60'
  },
  green: {
    badge: 'bg-emerald-500/15 text-emerald-600',
    pill: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-200/60',
    glow: 'shadow-emerald-100/60'
  },
  orange: {
    badge: 'bg-orange-500/15 text-orange-600',
    pill: 'bg-orange-100 text-orange-700',
    border: 'border-orange-200/60',
    glow: 'shadow-orange-100/60'
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-600',
    pill: 'bg-purple-100 text-purple-700',
    border: 'border-purple-200/60',
    glow: 'shadow-purple-100/60'
  }
}

export default function GroupFolderPage() {
  const router = useRouter()
  const params = useParams()
  const folderSlug = params.folder as FolderSlug | undefined
  const config = folderSlug ? folderConfig[folderSlug] : undefined
  const [ready, setReady] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!config) {
      router.replace('/group')
      return
    }

    setReady(true)
  }, [router, config])

  if (!config || !ready || !folderSlug) {
    return (
      <div className="container py-8 space-y-4">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  const theme = colorThemes[config.color] || colorThemes.blue
  const storagePath = `grup/${folderSlug}`

  return (
    <div className="container py-8 space-y-6">
      <nav className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>›</span>
        <Link href="/group" className="hover:text-foreground">Dokumen Grup</Link>
        <span>›</span>
        <span className="text-foreground font-medium">{config.label}</span>
      </nav>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${theme.badge}`}>
            {config.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{config.label}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/group')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dokumen Grup
        </Button>
      </div>

      <div className={`rounded-2xl border ${theme.border} bg-background/80 backdrop-blur-sm ${theme.glow}`}>
        <div className="flex flex-col gap-3 border-b border-border/60 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Folder aktif</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${theme.pill}`}>
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground">{storagePath}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh daftar
          </Button>
        </div>

        <div className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">Upload dokumen</h2>
                <p className="text-sm text-muted-foreground">PDF, JPG, atau PNG maksimal 10MB per file.</p>
              </div>
            </div>
            <FileUploader
              folderPath={storagePath}
              folderName={config.label}
              onUploadComplete={() => setRefreshKey((prev) => prev + 1)}
            />
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">File di folder ini</h2>
                <p className="text-sm text-muted-foreground">Preview, download, atau hapus dokumen yang sudah diunggah.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Muat ulang
                </Button>
              </div>
            </div>
            <FileList key={refreshKey} folderPath={storagePath} />
          </section>
        </div>
      </div>
    </div>
  )
}
