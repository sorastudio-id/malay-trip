'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/lib/utils'
import { useStatistics } from '@/hooks/useStatistics'
import StatisticsDashboard from '@/components/StatisticsDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StatisticsPage() {
  const router = useRouter()
  const { memberStats, groupStats, overallStats, loading, refreshStats } = useStatistics()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
  }, [router])

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of trip document management
          </p>
        </div>
        <Button onClick={refreshStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <StatisticsDashboard 
        memberStats={memberStats}
        groupStats={groupStats}
        overallStats={overallStats}
        loading={loading}
      />
    </div>
  )
}
