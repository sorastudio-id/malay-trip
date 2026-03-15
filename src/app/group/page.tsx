'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, FolderOpen } from 'lucide-react'
import { GROUP_FOLDERS } from '@/lib/constants'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function GroupPage() {
  const router = useRouter()

  const handleNavigate = (slug: string) => {
    router.push(`/group/${slug}`)
  }

  return (
    <div className="container py-8 space-y-8">
      <nav className="text-sm text-muted-foreground flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <span>›</span>
        <span className="text-foreground font-medium">Dokumen Grup</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
          📁
        </div>
        <div>
          <h1 className="text-3xl font-bold">Dokumen Grup</h1>
          <p className="text-muted-foreground">Kelola semua folder bersama dari satu tempat</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {GROUP_FOLDERS.map((folder) => (
          <Card
            key={folder.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleNavigate(folder.slug)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{folder.emoji}</div>
                <div>
                  <h2 className="text-2xl font-semibold">{folder.name}</h2>
                  <p className="text-muted-foreground text-sm">{folder.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {folder.items?.map((item) => (
                  <span key={item} className="px-2 py-1 rounded-full bg-muted">
                    {item}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="px-6 pb-6">
              <Button
                variant="ghost"
                className="flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNavigate(folder.slug)
                }}
              >
                <FolderOpen className="h-4 w-4" />
                Buka Folder
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
