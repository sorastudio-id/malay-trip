'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Trash2, Eye, Image as ImageIcon, Calendar, X, Share2, Copy, Pencil, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { formatFileSize, formatDate, getDisplayFileName } from '@/lib/utils'
import { listFiles, deleteFile, getFileUrl, renameFile } from '@/lib/supabase'
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

const INVALID_NAME_REGEX = /[\/\\:*?"<>|]/
const MAX_FILE_NAME_LENGTH = 100

function splitFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex === -1) {
    return { base: fileName, extension: '' }
  }
  return {
    base: fileName.slice(0, dotIndex),
    extension: fileName.slice(dotIndex)
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
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [editingExtension, setEditingExtension] = useState('')
  const [renameError, setRenameError] = useState('')
  const [renameLoadingId, setRenameLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadFiles()
  }, [folderPath])

  useEffect(() => {
    setEditingFileId(null)
    setRenameValue('')
    setEditingExtension('')
    setRenameError('')
    setRenameLoadingId(null)
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

  const startRenaming = (file: FileObject) => {
    const { base, extension } = splitFileName(file.name)
    setEditingFileId(file.id)
    setRenameValue(base)
    setEditingExtension(extension)
    setRenameError('')
  }

  const cancelRenaming = () => {
    setEditingFileId(null)
    setRenameValue('')
    setEditingExtension('')
    setRenameError('')
    setRenameLoadingId(null)
  }

  const validateRename = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      return 'Nama file tidak boleh kosong'
    }

    if (INVALID_NAME_REGEX.test(trimmed)) {
      return 'Nama file mengandung karakter terlarang'
    }

    if (trimmed.length + editingExtension.length > MAX_FILE_NAME_LENGTH) {
      return 'Nama file terlalu panjang (maks 100 karakter)'
    }

    return ''
  }

  const submitRename = async () => {
    if (!editingFileId) return
    const targetFile = files.find((file) => file.id === editingFileId)
    if (!targetFile) return

    let trimmed = renameValue.trim()
    if (editingExtension && trimmed.toLowerCase().endsWith(editingExtension.toLowerCase())) {
      trimmed = trimmed.slice(0, -editingExtension.length)
    }

    const validationMessage = validateRename(trimmed)
    if (validationMessage) {
      setRenameError(validationMessage)
      return
    }

    const finalName = `${trimmed}${editingExtension}`

    if (finalName === targetFile.name) {
      cancelRenaming()
      return
    }

    const duplicate = files.some(
      (file) => file.name.toLowerCase() === finalName.toLowerCase() && file.id !== editingFileId
    )

    if (duplicate) {
      setRenameError('Nama file sudah digunakan')
      return
    }

    const oldPath = `${folderPath}/${targetFile.name}`
    const newPath = `${folderPath}/${finalName}`

    setRenameLoadingId(editingFileId)
    try {
      await renameFile(oldPath, newPath)
      toast.success('File berhasil diubah namanya')
      cancelRenaming()
      loadFiles()
    } catch (error) {
      console.error('Error renaming file:', error)
      toast.error('Gagal mengubah nama file')
      setRenameLoadingId(null)
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
          const isEditing = editingFileId === file.id
          const currentExtension = isEditing ? editingExtension : splitFileName(file.name).extension

          return (
            <Card
              key={file.id}
              className="h-full transition-shadow border border-transparent hover:border-primary/20 hover:shadow-md"
            >
              <CardContent className="p-5 sm:p-6 h-full flex flex-col gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      {isImage ? (
                        <ImageIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {isEditing ? (
                        <div className="space-y-2 w-full">
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2 w-full">
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => {
                                  setRenameValue(e.target.value)
                                  setRenameError('')
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    submitRename()
                                  }
                                  if (e.key === 'Escape') {
                                    e.preventDefault()
                                    cancelRenaming()
                                  }
                                }}
                                className="flex-1 min-w-0 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                autoFocus
                                disabled={renameLoadingId === file.id}
                              />
                              {currentExtension && (
                                <span className="text-sm text-muted-foreground whitespace-nowrap">{currentExtension}</span>
                              )}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                              <Button
                                onClick={submitRename}
                                disabled={renameLoadingId === file.id}
                                className="h-9 w-full justify-center gap-2"
                                title="Simpan"
                              >
                                <Check className="h-4 w-4" />
                                Simpan
                              </Button>
                              <Button
                                variant="outline"
                                onClick={cancelRenaming}
                                disabled={renameLoadingId === file.id}
                                className="h-9 w-full justify-center gap-2"
                                title="Batal"
                              >
                                <X className="h-4 w-4" />
                                Batal
                              </Button>
                            </div>
                          </div>

                          {renameError && <p className="text-xs text-red-500">{renameError}</p>}
                        </div>
                      ) : (
                        <div
                          className="text-sm font-medium leading-snug text-gray-900 dark:text-gray-100 truncate max-w-[60%] sm:max-w-none"
                          title={needsTooltip ? originalName : undefined}
                        >
                          {visibleName}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(file.created_at)}
                        </span>
                        <span className="text-muted-foreground/70">•</span>
                        <span>{formatFileSize(file.metadata?.size || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:justify-end">
                    {(isPDF || isImage) && !isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(file.name, file.metadata?.mimetype)}
                        title="Preview"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(file.name)}
                        title="Bagikan"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(file.name)}
                        title="Download"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startRenaming(file)}
                        title="Ubah nama"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}

                    {!isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(file.name)}
                        title="Hapus"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl mx-auto max-h-[90vh] overflow-hidden rounded-lg">
            <button
              onClick={() => setPreviewFile(null)}
              className="absolute top-3 right-3 text-white hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
            {previewFile.type.startsWith('image/') ? (
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="bg-white p-6 rounded-lg text-center space-y-4">
                <p className="text-gray-600 text-sm">Preview not available for this file type</p>
                <Button onClick={() => window.open(previewFile.url, '_blank')} className="w-full sm:w-auto">
                  Open File
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {shareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="w-full max-w-sm mx-4 sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-4"
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
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={shareTarget.url || ''}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm truncate"
                />
                <Button
                  onClick={handleCopyShare}
                  disabled={!shareTarget.url || shareLoading}
                  className="min-w-[140px] whitespace-nowrap flex items-center justify-center gap-2"
                >
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
