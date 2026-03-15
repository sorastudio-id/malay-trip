'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MEMBERS, MEMBER_FOLDERS } from '@/lib/constants'
import { listFiles } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import FileUploader from '@/components/FileUploader'
import FileList from '@/components/FileList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export default function MemberFolderPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const folderSlug = params.folder as string

  const member = MEMBERS.find((item) => item.slug === slug)
  const folder = MEMBER_FOLDERS.find((item) => item.slug === folderSlug)
  const storagePath = useMemo(() => (member && folder ? `${member.slug}/${folder.slug}` : ''), [member, folder])

  const [refreshKey, setRefreshKey] = useState(0)
  const [folderStats, setFolderStats] = useState<{ count: number; lastUpload: string | null }>({ count: 0, lastUpload: null })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!member) {
      router.push('/dashboard')
    }
  }, [member, router])

  useEffect(() => {
    if (member && !folder) {
      router.push(`/member/${member.slug}`)
    }
  }, [member, folder, router])

  useEffect(() => {
    if (!storagePath) return

    const loadFolderStats = async () => {
      try {
        setLoadingStats(true)
        const files = await listFiles(storagePath)
        if (!files || files.length === 0) {
          setFolderStats({ count: 0, lastUpload: null })
          return
        }

        const latestFile = files.reduce((latest, file) => {
          if (!latest) return file
          const latestTime = new Date(latest.created_at || '').getTime()
          const fileTime = new Date(file.created_at || '').getTime()
          return fileTime > latestTime ? file : latest
        })

        setFolderStats({ count: files.length, lastUpload: latestFile?.created_at || null })
      } catch (error) {
        console.error(`Failed to load files for ${storagePath}:`, error)
        setFolderStats({ count: 0, lastUpload: null })
      } finally {
        setLoadingStats(false)
      }
    }

    loadFolderStats()
  }, [storagePath, refreshKey])

  if (!member || !folder) {
    return null
  }

  const handleRefresh = () => setRefreshKey((prev) => prev + 1)

  return (
    <div className="page-container py-8 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => router.push(`/member/${member.slug}`)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar folder
        </button>

        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {loadingStats ? 'Memuat...' : 'Refresh' }
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{folder.emoji}</div>
          <div>
            <p className="text-sm text-muted-foreground">{member.name}</p>
            <h1 className="text-3xl font-bold">{folder.name}</h1>
            <p className="text-sm text-muted-foreground">Folder pribadi</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant={folderStats.count === 0 ? 'destructive' : 'secondary'}>
            {folderStats.count} file tersedia
          </Badge>
          <span className="text-sm text-muted-foreground">
            {folderStats.lastUpload ? `Update ${formatDate(folderStats.lastUpload)}` : 'Belum ada data'}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-6 py-6">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Upload dokumen baru</h2>
              <p className="text-sm text-muted-foreground">PDF, JPG, atau PNG maksimal 10MB per file.</p>
            </div>
            <FileUploader
              folderPath={storagePath}
              folderName={`${member.name} - ${folder.name}`}
              onUploadComplete={handleRefresh}
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">File di folder ini</h2>
                <p className="text-sm text-muted-foreground">Preview, download, atau hapus dokumen yang sudah diunggah.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loadingStats}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Muat ulang
              </Button>
            </div>
            <FileList key={refreshKey} folderPath={storagePath} />
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
