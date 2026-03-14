'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Eye, Image as ImageIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { listFiles, deleteFile, getFileUrl } from '@/lib/supabase'
import { formatFileSize, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import FilePreview from './FilePreview'

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

  const handlePreview = (fileName: string, mimetype: string) => {
    const url = getFileUrl(`${folderPath}/${fileName}`)
    setPreviewFile({ name: fileName, url, type: mimetype })
  }

  const handleDownload = (fileName: string) => {
    const url = getFileUrl(`${folderPath}/${fileName}`)
    window.open(url, '_blank')
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
          const isPDF = file.metadata?.mimetype === 'application/pdf'
          const isImage = file.metadata?.mimetype?.startsWith('image/')

          return (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                    {isImage ? (
                      <ImageIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{file.name}</h4>
                    <p className="text-sm text-muted-foreground">
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

      {previewFile && (
        <FilePreview
          fileName={previewFile.name}
          fileUrl={previewFile.url}
          fileType={previewFile.type}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  )
}
