'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Eye, Image as ImageIcon, Calendar, X, Share2, Copy } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { formatFileSize, formatDate, getDisplayFileName } from '@/lib/utils'
import { listFiles, deleteFile, getFileUrl } from '@/lib/supabase'
import { toast } from 'sonner'
import SimplePDFViewer from './SimplePDFViewer'
import BulkFileUploader from './BulkFileUploader'

interface FileListProps {
  folderPath: string
}

interface FileObject {
  name: string
  id: string
  updated_at: string
  created_at: string
  last_accessed_at: string
  metadata: {
    size: number
    mimetype: string
  }
}

export default function FileList({ folderPath }: FileListProps) {
  const [files, setFiles] = useState<FileObject[]>([])
  const [loading, setLoading] = useState(true)
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null)
  const [pdfViewer, setPdfViewer] = useState<{ url: string; fileName: string } | null>(null)
  const [shareTarget, setShareTarget] = useState<{ name: string; path: string; url: string | null }>({ name: '', path: '', url: null })
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)

  useEffect(() => {
    loadFiles()
  }, [folderPath])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const fileList = await listFiles(folderPath)
      setFiles(fileList as FileObject[])
    } catch (error) {
      console.error('Error loading files:', error)
      toast.error('Gagal memuat file')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!confirm(`Hapus file "${fileName}"?`)) return

    try {
      await deleteFile(`${folderPath}/${fileName}`)
      toast.success('File berhasil dihapus')
      loadFiles()
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Gagal menghapus file')
    }
  }

  const handlePreview = async (fileName: string, mimetype: string) => {
    if (mimetype === 'application/pdf') {
      const url = await getFileUrl(`${folderPath}/${fileName}`)
      if (url) {
        setPdfViewer({ url, fileName })
      }
    } else {
      const url = await getFileUrl(`${folderPath}/${fileName}`)
      if (url) {
        setPreviewFile({ name: fileName, url, type: mimetype })
      }
    }
  }

  const handleDownload = async (fileName: string) => {
    const url = await getFileUrl(`${folderPath}/${fileName}`)
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleShare = async (fileName: string) => {
    setShareModalOpen(true)
    setCopySuccess(false)
    setShareLoading(true)
    setShareTarget({ name: fileName, path: `${folderPath}/${fileName}`, url: null })
    const url = await getFileUrl(`${folderPath}/${fileName}`, 86400)
    setShareTarget({ name: fileName, path: `${folderPath}/${fileName}`, url })
    setShareLoading(false)
  }

  const handleCopyShare = async () => {
    if (!shareTarget.url) return
    try {
      await navigator.clipboard.writeText(shareTarget.url)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('Gagal menyalin link')
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Belum ada file</h3>
          <p className="text-sm text-muted-foreground">
            Upload file pertama Anda menggunakan form di atas
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => {
          const { displayName, needsTooltip, originalName } = getDisplayFileName(file.name)
          const visibleName = displayName.replace(/-\d{10,15}(?=\.[^.]+$)/, '')
          const isPDF = file.metadata?.mimetype === 'application/pdf'
          const isImage = file.metadata?.mimetype?.startsWith('image/')

          return (
            <Card key={file.id} className="min-h-[100px]">
              <CardContent className="p-4 h-full">
                <div className="flex h-full items-center gap-4">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    {isImage ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4
                      className="text-sm font-medium truncate max-w-[240px]"
                      title={needsTooltip ? originalName : undefined}
                    >
                      {visibleName}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.metadata?.size || 0)} • {formatDate(file.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {(isPDF || isImage) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(file.name, file.metadata?.mimetype)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(file.name)}
                      title="Bagikan"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.name)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file.name)}
                      title="Hapus"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {pdfViewer && (
        <SimplePDFViewer
          url={pdfViewer.url}
          fileName={pdfViewer.fileName}
          onClose={() => setPdfViewer(null)}
        />
      )}

      {previewFile && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-8">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            {previewFile.type.startsWith('image/') ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="bg-white p-8 rounded-lg text-center">
                <p className="text-gray-600">Preview not available for this file type</p>
                <Button onClick={() => window.open(previewFile.url, '_blank')} className="mt-4">
                  Open File
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setShareModalOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bagikan file</p>
                <h3 className="text-lg font-semibold text-gray-900">{shareTarget.name}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShareModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Link berlaku 24 jam</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareTarget.url || ''}
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm"
                />
                <Button onClick={handleCopyShare} disabled={!shareTarget.url || shareLoading} className="min-w-[120px] flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  {copySuccess ? '✅ Tersalin!' : 'Salin Link'}
                </Button>
              </div>
              {shareLoading && <p className="text-xs text-gray-400">Menyiapkan link...</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
