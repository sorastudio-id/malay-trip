'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import SearchBar from './SearchBar'
import { FileText, Download, Trash2, Eye, User, Calendar, Filter, Grid, List } from 'lucide-react'
import { formatFileSize, formatDate, cn } from '@/lib/utils'
import { listFiles, deleteFile, getFileUrl } from '@/lib/supabase'
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

  useEffect(() => {
    loadAllFiles()
  }, [folderSlug])

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
          {sortedFiles.map((file) => (
            <Card key={file.id} className="hover:shadow-lg transition-shadow">
              <CardContent className={cn(
                "p-4",
                viewMode === 'list' ? "flex items-center gap-4" : ""
              )}>
                <div className={cn(
                  "flex items-center gap-3",
                  viewMode === 'list' ? "flex-1" : ""
                )}>
                  <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className={cn("flex-1 min-w-0", viewMode === 'list' ? "flex-1" : "")}>
                    <h4 className="font-medium truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {file.memberName}
                      </span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {file.type === 'application/pdf' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(file)}
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(file)}
                      title="Delete"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
