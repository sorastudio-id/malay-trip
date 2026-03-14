'use client'

import { useState, useEffect } from 'react'
import { MEMBERS } from '@/lib/constants'
import { countMemberFiles, countGroupFiles, listFiles } from '@/lib/supabase'
import { formatFileSize } from '@/lib/utils'

export interface MemberStats {
  id: string
  name: string
  slug: string
  fileCount: number
  totalSize: number
  foldersCompleted: number
  totalFolders: number
  lastUpload?: string
}

export interface GroupStats {
  fileCount: number
  totalSize: number
  foldersCompleted: number
  totalFolders: number
}

export interface OverallStats {
  totalFiles: number
  totalSize: number
  totalMembers: number
  averageFilesPerMember: number
  completionPercentage: number
}

export function useStatistics() {
  const [memberStats, setMemberStats] = useState<MemberStats[]>([])
  const [groupStats, setGroupStats] = useState<GroupStats | null>(null)
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)

      // Load member statistics - OPTIMIZED
      const memberData: MemberStats[] = []
      let totalFiles = 0
      let totalSize = 0

      // Use Promise.all for parallel processing
      const memberPromises = MEMBERS.map(async (member) => {
        const fileCount = await countMemberFiles(member.slug)
        
        // Only load detailed stats if user has files
        let memberSize = 0
        let foldersCompleted = 0
        let lastUpload: string | undefined

        if (fileCount > 0) {
          const folders = ['paspor', 'mdac']
          
          // Use Promise.all for folder loading
          const folderPromises = folders.map(async (folder) => {
            try {
              const files = await listFiles(`${member.slug}/${folder}`)
              const hasFiles = files.length > 0
              
              if (hasFiles) {
                foldersCompleted++
                // Find latest upload
                const latestFile = files.sort((a, b) => {
                  const dateA = new Date(a.created_at || '').getTime()
                  const dateB = new Date(b.created_at || '').getTime()
                  return dateB - dateA
                })[0]
                if (latestFile && latestFile.created_at) {
                  if (!lastUpload || new Date(latestFile.created_at) > new Date(lastUpload)) {
                    lastUpload = latestFile.created_at
                  }
                }
              }
              
              // Calculate size
              const folderSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
              return folderSize
            } catch (error) {
              console.error(`Error loading ${member.slug}/${folder}:`, error)
              return 0
            }
          })

          const folderSizes = await Promise.all(folderPromises)
          memberSize = folderSizes.reduce((sum, size) => sum + size, 0)
        }

        return {
          id: member.id,
          name: member.name,
          slug: member.slug,
          fileCount,
          totalSize: memberSize,
          foldersCompleted,
          totalFolders: 2, // Updated to 2 folders per member
          lastUpload
        }
      })

      const resolvedMembers = await Promise.all(memberPromises)
      memberData.push(...resolvedMembers)

      // Calculate totals
      totalFiles = memberData.reduce((sum, m) => sum + m.fileCount, 0)
      totalSize = memberData.reduce((sum, m) => sum + m.totalSize, 0)

      // Load group statistics - OPTIMIZED
      const groupFileCount = await countGroupFiles()
      let groupSize = 0
      let groupFoldersCompleted = 0

      if (groupFileCount > 0) {
        const groupFolders = ['tiket-airasia-grup', 'itinerary-ferry', 'airbnb-kl', 'voucher-hotel-triple', 'voucher-hotel-double', 'tiket-kl-tower', 'tiket-genting', 'tiket-bus', 'trip-plan', 'checklist']
        
        const groupFolderPromises = groupFolders.map(async (folder) => {
          try {
            const files = await listFiles(`grup/${folder}`)
            const hasFiles = files.length > 0
            if (hasFiles) {
              groupFoldersCompleted++
            }
            return files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0)
          } catch (error) {
            console.error(`Error loading grup/${folder}:`, error)
            return 0
          }
        })

        const groupFolderSizes = await Promise.all(groupFolderPromises)
        groupSize = groupFolderSizes.reduce((sum, size) => sum + size, 0)
      }

      const groupData: GroupStats = {
        fileCount: groupFileCount,
        totalSize: groupSize,
        foldersCompleted: groupFoldersCompleted,
        totalFolders: 10 // Updated to 10 group folders
      }

      // Calculate overall statistics
      const totalPossibleFolders = (MEMBERS.length * 2) + 10 // Updated: 2 per member + 10 group folders
      const completedFolders = memberData.reduce((sum, m) => sum + m.foldersCompleted, 0) + groupFoldersCompleted
      const completionPercentage = Math.round((completedFolders / totalPossibleFolders) * 100)

      const overallData: OverallStats = {
        totalFiles: totalFiles + groupFileCount,
        totalSize: totalSize + groupSize,
        totalMembers: MEMBERS.length,
        averageFilesPerMember: MEMBERS.length > 0 ? Math.round(totalFiles / MEMBERS.length) : 0,
        completionPercentage
      }

      setMemberStats(memberData)
      setGroupStats(groupData)
      setOverallStats(overallData)

    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    loadStatistics()
  }

  return {
    memberStats,
    groupStats,
    overallStats,
    loading,
    refreshStats
  }
}
