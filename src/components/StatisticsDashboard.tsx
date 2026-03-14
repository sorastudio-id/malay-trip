'use client'

import { BarChart3, Users, FileText, HardDrive, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { formatFileSize, formatDate } from '@/lib/utils'
import { MemberStats, GroupStats, OverallStats } from '@/hooks/useStatistics'

interface StatisticsDashboardProps {
  memberStats: MemberStats[]
  groupStats: GroupStats | null
  overallStats: OverallStats | null
  loading: boolean
}

export default function StatisticsDashboard({ memberStats, groupStats, overallStats, loading }: StatisticsDashboardProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-12 bg-muted rounded"></div>
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
      {/* Overall Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats?.totalFiles || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all members and groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(overallStats?.totalSize || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total storage consumption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Files/Member</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats?.averageFilesPerMember || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per member average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallStats?.completionPercentage || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Folders completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Member Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberStats.map((member) => {
              const progress = (member.foldersCompleted / member.totalFolders) * 100
              return (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted-foreground">
                      {member.foldersCompleted}/{member.totalFolders} folders
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{member.fileCount} files • {formatFileSize(member.totalSize)}</span>
                    {member.lastUpload && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(member.lastUpload)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Group Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupStats && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Group Progress</span>
                    <span className="text-muted-foreground">
                      {groupStats.foldersCompleted}/{groupStats.totalFolders} folders
                    </span>
                  </div>
                  <Progress value={(groupStats.foldersCompleted / groupStats.totalFolders) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    {groupStats.fileCount} files • {formatFileSize(groupStats.totalSize)}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {memberStats.reduce((sum, m) => sum + m.fileCount, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Member Files</div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {groupStats.fileCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Group Files</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
