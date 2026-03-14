'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import MemberCard from '@/components/MemberCard'
import { GROUP_FOLDERS, MEMBERS } from '@/lib/constants'
import { isAuthenticated } from '@/lib/utils'
import { countGroupFiles, listFiles } from '@/lib/supabase'
import { MemberCardSkeleton } from '@/components/LoadingSkeleton'

export default function DashboardPage() {
  const router = useRouter()
  const [refreshKey, setRefreshKey] = useState(0)
  const [groupFileCount, setGroupFileCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({})

  const globalShortcuts = [
    {
      id: 'shortcut-passports',
      emoji: '🛂',
      title: 'Semua Paspor',
      description: 'Lihat paspor seluruh anggota',
      href: '/global-files/paspor',
      accent: '#1A3A6B'
    },
    {
      id: 'shortcut-mdac',
      emoji: '📋',
      title: 'Semua MDAC',
      description: 'Lihat MDAC seluruh anggota',
      href: '/global-files/mdac',
      accent: '#E07B2A'
    }
  ]

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }
    loadGroupFiles()
  }, [router, refreshKey])

  const loadGroupFiles = async () => {
    try {
      setLoading(true)
      const count = await countGroupFiles()
      setGroupFileCount(count)

      const entries = await Promise.all(
        GROUP_FOLDERS.map(async (folder) => {
          try {
            const files = await listFiles(`grup/${folder.slug}`)
            return [folder.slug, files.length] as const
          } catch (error) {
            console.error(`Error loading grup/${folder.slug}:`, error)
            return [folder.slug, 0] as const
          }
        })
      )
      setFolderCounts(Object.fromEntries(entries))
    } catch (error) {
      console.error('Error loading group files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const firstRowMembers = MEMBERS.slice(0, 3)
  const secondRowMembers = MEMBERS.slice(3)

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

      <div
        className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#0F1B3D] via-[#152452] to-[#2C1E52] p-6 text-white shadow-lg"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="text-4xl" aria-hidden>
              🤖
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-200/80">Baru!</p>
              <h2 className="text-2xl font-semibold">Upload Cerdas AI</h2>
              <p className="text-sm text-blue-100/90">
                Upload PDF, AI otomatis deteksi & simpan ke folder yang benar
              </p>
            </div>
          </div>
          <Link href="/upload-ai" className="md:ml-8">
            <Button
              size="lg"
              className="w-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              Mulai Upload →
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
                {(loading ? firstRowMembers : firstRowMembers).map((member, index) => (
                  loading ? (
                    <MemberCardSkeleton key={member.id ?? index} />
                  ) : (
                    <MemberCard key={member.id} member={member} onRefresh={refreshKey} />
                  )
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 lg:max-w-4xl lg:mx-auto">
                {(loading ? secondRowMembers : secondRowMembers).map((member, index) => (
                  loading ? (
                    <MemberCardSkeleton key={member.id ?? index} />
                  ) : (
                    <MemberCard key={member.id} member={member} onRefresh={refreshKey} />
                  )
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-sm uppercase text-muted-foreground tracking-wide">📂 Lihat Semua Dokumen Per Kategori</p>
              <p className="text-muted-foreground">Lihat dokumen dari semua anggota dalam satu halaman</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              {globalShortcuts.map((shortcut) => (
                <Link key={shortcut.id} href={shortcut.href}>
                  <Card
                    className="hover:shadow-lg transition-shadow h-full"
                    style={{ borderColor: shortcut.accent + '33', backgroundColor: shortcut.accent + '08' }}
                  >
                    <CardContent className="p-6 h-full flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl" style={{ color: shortcut.accent }}>{shortcut.emoji}</div>
                        <div>
                          <h3 className="text-xl font-semibold" style={{ color: shortcut.accent }}>{shortcut.title}</h3>
                          <p className="text-sm text-muted-foreground">{shortcut.description}</p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <Button variant="outline" className="w-full">
                          Buka Halaman
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm uppercase text-muted-foreground tracking-wide">File Bersama</p>
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Semua tiket & dokumen grup</h2>
                  <p className="text-muted-foreground mt-1">
                    {GROUP_FOLDERS.length} folder • {groupFileCount} file tersimpan untuk seluruh anggota.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {GROUP_FOLDERS.map((folder) => {
                const count = folderCounts[folder.slug] ?? 0
                return (
                  <Card key={folder.id} className="h-full">
                    <CardContent className="p-6 flex flex-col gap-4 h-full">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{folder.emoji}</div>
                        <div>
                          <h3 className="text-xl font-semibold">{folder.name}</h3>
                          <p className="text-sm text-muted-foreground">{folder.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {count === 0 ? 'Belum ada file' : `${count} file tersimpan`}
                        </span>
                        <span>{folder.items?.join(' • ')}</span>
                      </div>
                      <div className="mt-auto">
                        <Link href={`/group/${folder.slug}`}>
                          <Button className="w-full" variant="outline">
                            Buka Folder
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
