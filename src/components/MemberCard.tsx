'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from './ui/card'
import { Progress } from './ui/progress'
import { cn } from '@/lib/utils'
import { listFiles } from '@/lib/supabase'
import { Member, MEMBER_FOLDERS } from '@/lib/constants'
import { FileText } from 'lucide-react'

interface MemberCardProps {
  member: Member
  onRefresh?: number
}

export default function MemberCard({ member, onRefresh }: MemberCardProps) {
  const [filledFolders, setFilledFolders] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const totalFolders = MEMBER_FOLDERS.length
  const progress = totalFolders === 0 ? 0 : Math.min((filledFolders / totalFolders) * 100, 100)

  useEffect(() => {
    loadFolderProgress()
  }, [member.slug, onRefresh])

  const loadFolderProgress = async () => {
    try {
      setLoading(true)
      const results = await Promise.all(
        MEMBER_FOLDERS.map(async (folder) => {
          const files = await listFiles(`${member.slug}/${folder.slug}`)
          return files.length > 0
        })
      )
      const filled = results.filter(Boolean).length
      setFilledFolders(filled)
    } catch (error) {
      console.error('Error loading folder progress:', error)
      setFilledFolders(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Link href={`/member/${member.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg",
              member.color
            )}>
              {member.initials}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span className={cn(
                    "font-medium",
                    filledFolders === 0
                      ? "text-red-500"
                      : filledFolders < totalFolders
                        ? "text-orange-500"
                        : "text-green-500"
                  )}>
                    {filledFolders === 0
                      ? 'Belum ada folder terisi'
                      : `${filledFolders}/${totalFolders} folder terisi`}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
