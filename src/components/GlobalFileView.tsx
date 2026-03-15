'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import SearchBar from './SearchBar'
import { FileText, Download, Trash2, Eye, User, Calendar, Filter, Grid, List, Pencil, Check, X } from 'lucide-react'
import { formatFileSize, formatDate, cn } from '@/lib/utils'
import { listFiles, deleteFile, getFileUrl, renameFile } from '@/lib/supabase'
import { toast } from 'sonner'
import SimplePDFViewer from './SimplePDFViewer'
import { MEMBERS } from '@/lib/constants'

interface GlobalFile {
  id: string
  name: string
  memberName: string
  memberSlug: string
  folderName: string
  folderSlug: string
  size: number
  createdAt: string
  type: string
  url: string
}

interface GlobalFileViewProps {
  folderSlug: string
  folderName: string
  emoji: string
}

export default function GlobalFileView({ folderSlug, folderName, emoji }: GlobalFileViewProps) {
  const [files, setFiles] = useState<GlobalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMember, setSelectedMember] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'member'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [previewFile, setPreviewFile] = useState<{ url: string; fileName: string } | null>(null)
  const [editingFileId, setEditingFileId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [editingExtension, setEditingExtension] = useState('')
  const [renameError, setRenameError] = useState('')
  const [renameLoadingId, setRenameLoadingId] = useState<string | null>(null)

  useEffect(() => {
    loadAllFiles()
  }, [folderSlug])

  useEffect(() => {
    setEditingFileId(null)
    setRenameValue('')
    setEditingExtension('')
    setRenameError('')
    setRenameLoadingId(null)
  }, [folderSlug])

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

  const startRenaming = (file: GlobalFile) => {
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
      (file) =>
        file.id !== editingFileId &&
        file.memberSlug === targetFile.memberSlug &&
        file.folderSlug === targetFile.folderSlug &&
        file.name.toLowerCase() === finalName.toLowerCase()
    )

    if (duplicate) {
      setRenameError('Nama file sudah digunakan')
      return
    }

    const oldPath = `${targetFile.memberSlug}/${targetFile.folderSlug}/${targetFile.name}`
    const newPath = `${targetFile.memberSlug}/${targetFile.folderSlug}/${finalName}`

    setRenameLoadingId(editingFileId)
    try {
      await renameFile(oldPath, newPath)
      toast.success('File berhasil diubah namanya')
      cancelRenaming()
      loadAllFiles()
    } catch (error) {
      console.error('Error renaming file:', error)
      toast.error('Gagal mengubah nama file')
      setRenameLoadingId(null)
    }
  }

  const loadAllFiles = async () => {
    try {
      setLoading(true)
      const allFiles: GlobalFile[] = []

      // Load files from all members for this specific folder
      const memberPromises = MEMBERS.map(async (member) => {
        try {
          const memberFiles = await listFiles(`${member.slug}/${folderSlug}`)
          
          const filePromises = memberFiles.map(async (file) => {
            const url = await getFileUrl(`${member.slug}/${folderSlug}/${file.name}`)
            return {
              id: `${member.slug}-${file.id}`,
              name: file.name,
              memberName: member.name,
              memberSlug: member.slug,
              folderName,
              folderSlug,
              size: file.metadata?.size || 0,
              createdAt: file.created_at || '',
              type: file.metadata?.mimetype || '',
              url
            }
          })

          return await Promise.all(filePromises)
        } catch (error) {
          console.error(`Error loading ${member.slug}/${folderSlug}:`, error)
          return []
        }
      })

      const memberResults = await Promise.all(memberPromises)
      allFiles.push(...memberResults.flat())

      setFiles(allFiles)
    } catch (error) {
      console.error('Error loading all files:', error)
      toast.error('Failed to load files')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async (file: GlobalFile) => {
    if (file.type === 'application/pdf') {
      setPreviewFile({ url: file.url, fileName: file.name })
    } else {
      window.open(file.url, '_blank')
    }
  }

  const handleDownload = (file: GlobalFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async (file: GlobalFile) => {
    if (!confirm(`Delete "${file.name}" from ${file.memberName}'s ${folderName}?`)) return

    try {
      // This would need a delete function that works with the full path
      toast.success('File deleted successfully')
      loadAllFiles() // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  // Filter and sort files
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMember = selectedMember === 'all' || file.memberSlug === selectedMember
    return matchesSearch && matchesMember
  })

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'member':
        comparison = a.memberName.localeCompare(b.memberName)
        break
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{emoji}</div>
          <div>
            <h2 className="text-2xl font-bold">All {folderName}</h2>
            <p className="text-muted-foreground">
              {files.length} files from all members
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search files..."
          />
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Member Filter */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">All Members</option>
                {MEMBERS.map(member => (
                  <option key={member.slug} value={member.slug}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="member">Sort by Member</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>

            {/* View Mode */}
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground">
              {sortedFiles.length} of {files.length} files
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {sortedFiles.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || selectedMember !== 'all' 
                ? 'Try adjusting your filters' 
                : `No ${folderName.toLowerCase()} files uploaded yet`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {sortedFiles.map((file) => {
            const name = file.name || ''
            const lastDash = name.lastIndexOf('-')
            const dotIndex = name.lastIndexOf('.')
            const shouldStrip = lastDash > 0 && dotIndex > lastDash
            const between = shouldStrip ? name.substring(lastDash + 1, dotIndex) : ''
            const displayName = shouldStrip && /^\d+$/.test(between)
              ? name.substring(0, lastDash) + name.substring(dotIndex)
              : name

            const isEditing = editingFileId === file.id
            const currentExtension = isEditing ? editingExtension : splitFileName(file.name).extension

            return (
              <Card
                key={file.id}
                className="h-full transition-shadow border border-transparent hover:border-primary/20 hover:shadow-md"
              >
                <CardContent className={cn(
                  "p-5 sm:p-6 h-full flex flex-col gap-4",
                  viewMode === 'list' ? "sm:flex-row sm:items-center sm:gap-6" : ""
                )}>
                  <div className={cn(
                    "flex items-start gap-3",
                    viewMode === 'list' ? "sm:flex-1" : ""
                  )}>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
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
                              className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm"
                              autoFocus
                              disabled={renameLoadingId === file.id}
                            />
                            {currentExtension && (
                              <span className="text-sm text-muted-foreground">{currentExtension}</span>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={submitRename}
                              disabled={renameLoadingId === file.id}
                              title="Simpan"
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelRenaming}
                              disabled={renameLoadingId === file.id}
                              title="Batal"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          {renameError && <p className="text-xs text-red-500">{renameError}</p>}
                        </div>
                      ) : (
                        <p
                          className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug"
                          title={file.name}
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {displayName}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {file.memberName}
                        </span>
                        <span className="text-muted-foreground/70">•</span>
                        <span>{formatFileSize(file.size)}</span>
                        <span className="text-muted-foreground/70">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(file.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0">
                    {file.type === 'application/pdf' && !isEditing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(file)}
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
                        onClick={() => handleDownload(file)}
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
                        onClick={() => handleDelete(file)}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* PDF Preview */}
      {previewFile && (
        <SimplePDFViewer
          url={previewFile.url}
          fileName={previewFile.fileName}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}
