'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from './ui/card'
import { Progress } from './ui/progress'
import { cn } from '@/lib/utils'
import { countMemberFiles } from '@/lib/supabase'
import { Member } from '@/lib/constants'
import { FileText } from 'lucide-react'

interface MemberCardProps {
  member: Member
  onRefresh?: number
}

export default function MemberCard({ member, onRefresh }: MemberCardProps) {
  const [fileCount, setFileCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const totalFolders = 7
  const progress = (fileCount / totalFolders) * 100

  useEffect(() => {
    loadFileCount()
  }, [member.slug, onRefresh])

  const loadFileCount = async () => {
    try {
      setLoading(true)
      const count = await countMemberFiles(member.slug)
      setFileCount(count)
    } catch (error) {
      console.error('Error loading file count:', error)
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
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
