'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GROUP_FOLDERS } from '@/lib/constants'
import { isAuthenticated } from '@/lib/utils'
import FolderGrid from '@/components/FolderGrid'

export default function GroupPage() {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
    }
  }, [router])

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
          📁
        </div>
        <div>
          <h1 className="text-3xl font-bold">Dokumen Grup</h1>
          <p className="text-muted-foreground">Dokumen bersama untuk semua anggota trip</p>
        </div>
      </div>

      <FolderGrid folders={GROUP_FOLDERS} basePath="grup" />
    </div>
  )
}
