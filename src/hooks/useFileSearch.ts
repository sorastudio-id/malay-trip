'use client'

import { useState, useEffect, useMemo } from 'react'
import { listFiles } from '@/lib/supabase'

export function useFileSearch(folderPath: string) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allFiles, setAllFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [folderPath])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const files = await listFiles(folderPath)
      setAllFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
      setAllFiles([])
    } finally {
      setLoading(false)
    }
  }

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return allFiles
    
    const query = searchQuery.toLowerCase()
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(query)
    )
  }, [allFiles, searchQuery])

  const refreshFiles = () => {
    loadFiles()
  }

  return {
    searchQuery,
    setSearchQuery,
    allFiles,
    filteredFiles,
    loading,
    refreshFiles
  }
}
