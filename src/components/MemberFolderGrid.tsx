'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Folder } from '@/lib/constants'
import { listFiles } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'
import FileUploader from './FileUploader'
import FileList from './FileList'
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react'

interface MemberFolderGridProps {
  folders: Folder[]
  basePath: string
}

export default function MemberFolderGrid({ folders, basePath }: MemberFolderGridProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [stats, setStats] = useState<Record<string, { count: number; lastUpload: string | null }>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [basePath, refreshKey])

  const loadStats = async () => {
    try {
      setLoading(true)
      const entries = await Promise.all(
        folders.map(async (folder) => {
          try {
            const files = await listFiles(`${basePath}/${folder.slug}`)
            if (!files || files.length === 0) {
              return [folder.slug, { count: 0, lastUpload: null }]
            }
            const latest = files.reduce((latestFile, file) => {
              if (!latestFile) return file
              return new Date(file.created_at || '').getTime() > new Date(latestFile.created_at || '').getTime()
                ? file
                : latestFile
            }, files[0])
            return [folder.slug, { count: files.length, lastUpload: latest?.created_at || null }]
          } catch (error) {
            console.error(`Error loading ${basePath}/${folder.slug}:`, error)
            return [folder.slug, { count: 0, lastUpload: null }]
          }
        })
      )
      setStats(Object.fromEntries(entries))
    } finally {
      setLoading(false)
    }
  }

  const totalFiles = Object.values(stats).reduce((sum, entry) => sum + entry.count, 0)
  const filledFolders = folders.filter((folder) => (stats[folder.slug]?.count || 0) > 0).length
  const totalFolders = folders.length

  if (selectedFolder) {
    const folderStats = stats[selectedFolder.slug]
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedFolder(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke daftar folder
        </button>

        <div className="flex items-center gap-3">
          <div className="text-4xl">{selectedFolder.emoji}</div>
          <div>
            <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
            <p className="text-sm text-muted-foreground">
              {folderStats?.count || 0} file tersedia
            </p>
          </div>
        </div>

        <FileUploader
          folderPath={`${basePath}/${selectedFolder.slug}`}
          folderName={selectedFolder.name}
          onUploadComplete={() => setRefreshKey((prev) => prev + 1)}
        />

        <FileList
          folderPath={`${basePath}/${selectedFolder.slug}`}
          key={`${selectedFolder.slug}-${refreshKey}`}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full">
              <div>
                <p className="text-sm text-muted-foreground">Total File</p>
                <p className="text-3xl font-bold">{totalFiles}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Folder Terisi</p>
                <p className="text-3xl font-bold">{filledFolders}/{totalFolders}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Folder Kosong</p>
                <p className="text-3xl font-bold">{Math.max(totalFolders - filledFolders, 0)}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {loading ? 'Memuat...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {folders.map((folder) => {
          const folderStats = stats[folder.slug]
          const count = folderStats?.count || 0
          return (
            <Card key={folder.id} className="h-full">
              <CardContent className="p-6 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{folder.emoji}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{folder.name}</h3>
                    <p className="text-sm text-muted-foreground">Folder pribadi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {count === 0 ? (
                    <Badge variant="destructive">Belum ada file</Badge>
                  ) : (
                    <Badge variant="secondary">{count} file tersedia</Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {folderStats?.lastUpload ? `Update ${formatDate(folderStats.lastUpload)}` : 'Belum ada data'}
                  </span>
                </div>
                <div className="mt-auto">
                  <Button className="w-full" variant="outline" onClick={() => setSelectedFolder(folder)}>
                    Buka Folder
                    <ArrowRight className="h-4 w-4 ml-2" />
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
