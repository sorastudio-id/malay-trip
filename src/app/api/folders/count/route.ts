import { NextRequest, NextResponse } from 'next/server'
import { countFolderFiles } from '@/lib/supabase'
import { requireServerAuth } from '@/lib/serverAuth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await requireServerAuth()
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }
    
    const count = await countFolderFiles(path)
    
    return NextResponse.json({ count })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error counting folder files:', error)
    return NextResponse.json({ error: 'Failed to count files' }, { status: 500 })
  }
}
