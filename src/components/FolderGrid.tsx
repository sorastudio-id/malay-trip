'use client'

import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Folder } from '@/lib/constants'
import FileUploader from './FileUploader'
import FileList from './FileList'

interface FolderGridProps {
  folders: Folder[]
  basePath: string
}

export default function FolderGrid({ folders, basePath }: FolderGridProps) {
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null)

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
          <span className="text-4xl">{selectedFolder.emoji}</span>
          <h2 className="text-2xl font-bold">{selectedFolder.name}</h2>
        </div>

        <FileUploader 
          folderPath={`${basePath}/${selectedFolder.slug}`}
          folderName={selectedFolder.name}
        />

        <FileList 
          folderPath={`${basePath}/${selectedFolder.slug}`}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {folders.map((folder) => (
        <Card
          key={folder.id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setSelectedFolder(folder)}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{folder.emoji}</span>
              <div>
                <h3 className="font-semibold text-lg">{folder.name}</h3>
                <p className="text-sm text-muted-foreground">Klik untuk buka</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
