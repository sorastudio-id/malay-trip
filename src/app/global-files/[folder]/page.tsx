'use client'

import { useRouter } from 'next/navigation'
import { isAuthenticated } from '@/lib/utils'
import { MEMBER_FOLDERS, GROUP_FOLDERS } from '@/lib/constants'
import GlobalFileView from '@/components/GlobalFileView'
import { useEffect } from 'react'

export default function GlobalFilesPage({ params }: { params: { folder: string } }) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
  }, [router])

  const folderSlug = params.folder
  
  // Find folder info
  const allFolders = [...MEMBER_FOLDERS, ...GROUP_FOLDERS]
  const folderInfo = allFolders.find(f => f.slug === folderSlug)
  
  if (!folderInfo) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Folder Not Found</h1>
          <p className="text-muted-foreground">The requested folder does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <GlobalFileView 
        folderSlug={folderSlug}
        folderName={folderInfo.name}
        emoji={folderInfo.emoji}
      />
    </div>
  )
}
