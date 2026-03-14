'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Folder, FolderSection } from '@/lib/constants'
import { listFiles } from '@/lib/supabase'
import { cn, formatDate } from '@/lib/utils'
import FileUploader from './FileUploader'
import FileList from './FileList'
import { FileText, Upload, ArrowRight, RefreshCw } from 'lucide-react'

interface FolderGridProps {
  folders: Folder[]
  basePath: string
  sections?: FolderSection[]
}

export default function FolderGrid({ folders, basePath, sections }: FolderGridProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [selectedSection, setSelectedSection] = useState<FolderSection | null>(null)
  const [folderStats, setFolderStats] = useState<Record<string, { count: number; lastUpload: string | null }>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFolderCounts()
  }, [basePath, refreshKey, sections])

  const loadFolderCounts = async () => {
    try {
      setLoading(true)
      const stats: Record<string, { count: number; lastUpload: string | null }> = {}
      const targetFolders = sections ? sections.flatMap((section) => section.folders) : folders
      for (const folder of targetFolders) {
        const files = await listFiles(`${basePath}/${folder.slug}`)
        if (!files || files.length === 0) {
          stats[folder.slug] = { count: 0, lastUpload: null }
          continue
        }

        const latest = files.reduce((latestFile, file) => {
          if (!latestFile) return file
          return new Date(file.created_at || '').getTime() > new Date(latestFile.created_at || '').getTime()
            ? file
            : latestFile
        }, files[0])

        stats[folder.slug] = {
          count: files.length,
          lastUpload: latest?.created_at || null
        }
      }
      setFolderStats(stats)
    } catch (error) {
      console.error('Error loading folder stats', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1)
  }

  const effectiveFolders = sections ? sections.flatMap((section) => section.folders) : folders
  const totalFiles = Object.values(folderStats).reduce((sum, stat) => sum + stat.count, 0)
  const completedFolders = effectiveFolders.filter((folder) => (folderStats[folder.slug]?.count || 0) > 0).length

  if (selectedFolder) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedFolder(null)}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
        >
          ← Kembali ke semua folder
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">{selectedFolder.emoji}</div>
          <div>
            <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
            <p className="text-sm text-muted-foreground">
              {(folderStats[selectedFolder.slug]?.count || 0)} file bersama
            </p>
          </div>
        </div>

        <FileUploader 
          folderPath={`${basePath}/${selectedFolder.slug}`}
          folderName={selectedFolder.name}
          onUploadComplete={handleUploadComplete}
        />

        <FileList 
          folderPath={`${basePath}/${selectedFolder.slug}`}
          key={refreshKey}
        />
      </div>
    )
  }

  if (selectedSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedSection(null)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            ← Kembali ke File Bersama
          </button>
          <Button variant="ghost" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {loading ? 'Memuat...' : 'Refresh data'}
          </Button>
        </div>

        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">{selectedSection.title}</h2>
          {selectedSection.description && (
            <p className="text-muted-foreground mt-2">{selectedSection.description}</p>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dokumen</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Update Terakhir</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {selectedSection.folders.map((folder) => {
                    const stats = folderStats[folder.slug]
                    const count = stats?.count ?? 0
                    const lastUpload = stats?.lastUpload

                    return (
                      <tr key={folder.id} className="hover:bg-muted/20">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{folder.emoji}</div>
                            <div>
                              <p className="font-semibold">{folder.name}</p>
                              <p className="text-xs text-muted-foreground">File bersama seluruh anggota</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {count === 0 ? (
                            <Badge variant="destructive">Belum ada file</Badge>
                          ) : (
                            <Badge variant="secondary">{count} file</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {lastUpload ? formatDate(lastUpload) : 'Belum ada data'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFolder(folder)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Lihat
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedFolder(folder)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total File Bersama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalFiles}</div>
            <p className="text-xs text-muted-foreground">Semua file untuk seluruh anggota</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Folder Terisi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedFolders}/{effectiveFolders.length}</div>
            <p className="text-xs text-muted-foreground">Folder yang sudah ada minimal 1 file</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Folder Kosong</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{effectiveFolders.length - completedFolders}</div>
            <p className="text-xs text-muted-foreground">Folder yang belum diisi file</p>
          </CardContent>
        </Card>
      </div>

      {sections ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((section) => {
            const totalDocs = section.folders.length
            const fileCount = section.folders.reduce(
              (sum, folder) => sum + (folderStats[folder.slug]?.count || 0),
              0
            )
            const filledFolders = section.folders.filter(
              (folder) => (folderStats[folder.slug]?.count || 0) > 0
            ).length

            return (
              <Card
                key={section.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedSection(section)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{section.title}</h3>
                      {section.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{totalDocs} dokumen</span>
                    <span>{fileCount} file tersimpan</span>
                    <span>{filledFolders}/{totalDocs} folder terisi</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Dokumen</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Update Terakhir</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {folders.map((folder) => {
                    const stats = folderStats[folder.slug]
                    const count = stats?.count ?? 0
                    const lastUpload = stats?.lastUpload

                    return (
                      <tr key={folder.id} className="hover:bg-muted/20">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{folder.emoji}</div>
                            <div>
                              <p className="font-semibold">{folder.name}</p>
                              <p className="text-xs text-muted-foreground">File bersama seluruh anggota</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {count === 0 ? (
                            <Badge variant="destructive">Belum ada file</Badge>
                          ) : (
                            <Badge variant="secondary">{count} file</Badge>
                          )}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {lastUpload ? formatDate(lastUpload) : 'Belum ada data'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFolder(folder)}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Lihat
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedFolder(folder)}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={() => setRefreshKey((prev) => prev + 1)} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? 'Memuat...' : 'Refresh data'}
        </Button>
      </div>
    </div>
  )
}
