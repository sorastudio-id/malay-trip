'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Folder, Search, Grid, List, ArrowLeft, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import FileUploader from './FileUploader'
import FileList from './FileList'
import BulkFileUploader from './BulkFileUploader'
import SearchBar from './SearchBar'

interface Folder {
  id: string
  name: string
  emoji: string
  slug: string
}

interface ImprovedFolderGridProps {
  folders: Folder[]
  basePath: string
  title?: string
}

export default function ImprovedFolderGrid({ folders, basePath, title = "Folders" }: ImprovedFolderGridProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadFolderCounts()
  }, [basePath, refreshKey])

  const loadFolderCounts = async () => {
    try {
      const counts: Record<string, number> = {}
      // Use Promise.all for parallel loading
      const countPromises = folders.map(async (folder) => {
        try {
          const response = await fetch(`/api/folders/count?path=${encodeURIComponent(`${basePath}/${folder.slug}`)}`)
          if (response.ok) {
            const data = await response.json()
            return { slug: folder.slug, count: data.count }
          }
          return { slug: folder.slug, count: 0 }
        } catch (error) {
          console.error(`Error loading ${folder.slug}:`, error)
          return { slug: folder.slug, count: 0 }
        }
      })

      const results = await Promise.all(countPromises)
      results.forEach(({ slug, count }) => {
        counts[slug] = count
      })
      setFolderCounts(counts)
    } catch (error) {
      console.error('Error loading folder counts:', error)
    }
  }

  const handleUploadComplete = () => {
    setRefreshKey(prev => prev + 1)
  }

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getFolderStatus = (count: number) => {
    if (count === 0) return { color: 'text-red-500', label: 'Empty', bgColor: 'bg-red-50' }
    if (count < 3) return { color: 'text-orange-500', label: 'Few', bgColor: 'bg-orange-50' }
    return { color: 'text-green-500', label: 'Ready', bgColor: 'bg-green-50' }
  }

  if (selectedFolder) {
    const status = getFolderStatus(folderCounts[selectedFolder.slug] || 0)
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFolder(null)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {title}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="text-4xl">{selectedFolder.emoji}</div>
              <div>
                <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs px-2 py-1 rounded-full", status.bgColor, status.color)}>
                    {status.label}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {folderCounts[selectedFolder.slug] || 0} files
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showBulkUpload ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBulkUpload(!showBulkUpload)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {showBulkUpload ? 'Single Upload' : 'Bulk Upload'}
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        {showBulkUpload ? (
          <BulkFileUploader
            folderPath={`${basePath}/${selectedFolder.slug}`}
            folderName={selectedFolder.name}
            onUploadComplete={handleUploadComplete}
          />
        ) : (
          <FileUploader 
            folderPath={`${basePath}/${selectedFolder.slug}`}
            folderName={selectedFolder.name}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {/* File List */}
        <FileList 
          folderPath={`${basePath}/${selectedFolder.slug}`}
          key={refreshKey}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">
            {filteredFolders.length} of {folders.length} folders
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            placeholder="Search folders..."
          />
          
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
        </div>
      </div>

      {/* Folder Grid/List */}
      {filteredFolders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No folders found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'No folders available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        )}>
          {filteredFolders.map((folder) => {
            const count = folderCounts[folder.slug] || 0
            const status = getFolderStatus(count)
            
            return (
              <Card
                key={folder.id}
                className={cn(
                  "hover:shadow-lg transition-all cursor-pointer border-2",
                  viewMode === 'list' ? "flex-row" : "",
                  count === 0 ? "border-red-200" : "border-transparent"
                )}
                onClick={() => setSelectedFolder(folder)}
              >
                <CardContent className={cn(
                  "p-6",
                  viewMode === 'list' ? "flex items-center gap-4 w-full" : ""
                )}>
                  <div className={cn(
                    "flex items-center gap-4",
                    viewMode === 'list' ? "flex-1" : ""
                  )}>
                    <div className={cn(
                      "flex items-center justify-center rounded-lg",
                      status.bgColor,
                      viewMode === 'list' ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl"
                    )}>
                      {folder.emoji}
                    </div>
                    
                    <div className={cn("flex-1", viewMode === 'list' ? "flex-1" : "")}>
                      <h3 className="font-semibold text-lg mb-1">{folder.name}</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-sm">
                          <FileText className="h-3 w-3" />
                          <span className={cn("font-medium", status.color)}>
                            {count === 0 ? "No files" : `${count} file${count !== 1 ? 's' : ''}`}
                          </span>
                        </div>
                        
                        <span className={cn("text-xs px-2 py-1 rounded-full", status.bgColor, status.color)}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
