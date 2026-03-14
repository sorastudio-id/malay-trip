'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import MemberCard from '@/components/MemberCard'
import { MEMBERS } from '@/lib/constants'
import { isAuthenticated } from '@/lib/utils'
import { countGroupFiles } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [groupFileCount, setGroupFileCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
    loadGroupFiles()
  }, [router, refreshKey])

  const loadGroupFiles = async () => {
    try {
      const count = await countGroupFiles()
      setGroupFileCount(count)
    } catch (error) {
      console.error('Error loading group files:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Trip Malaysia</h1>
          <p className="text-muted-foreground">
            Kelola semua dokumen perjalanan dalam satu tempat
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">👥 Anggota Trip</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEMBERS.map((member) => (
            <MemberCard key={member.id} member={member} onRefresh={refreshKey} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">📁 Dokumen Grup</h2>
        <Link href="/group">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <FolderOpen className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Dokumen Bersama</h3>
                  <p className="text-sm text-muted-foreground">
                    {groupFileCount} file tersimpan
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
