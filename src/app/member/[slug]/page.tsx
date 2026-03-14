'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MEMBERS, MEMBER_FOLDERS } from '@/lib/constants'
import { isAuthenticated } from '@/lib/utils'
import MemberFolderGrid from '@/components/MemberFolderGrid'

export default function MemberPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const member = MEMBERS.find(m => m.slug === slug)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/')
      return
    }

    if (!member) {
      router.push('/dashboard')
    }
  }, [router, member])

  if (!member) return null

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${member.color}`}>
          {member.initials}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{member.name}</h1>
          <p className="text-muted-foreground">Dokumen perjalanan pribadi</p>
        </div>
      </div>

      <MemberFolderGrid folders={MEMBER_FOLDERS} basePath={member.slug} />
    </div>
  )
}
