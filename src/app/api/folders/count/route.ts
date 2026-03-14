import { NextRequest, NextResponse } from 'next/server'
import { countFolderFiles } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    
    if (!path) {
      return NextResponse.json({ error: 'Path parameter is required' }, { status: 400 })
    }
    
    const count = await countFolderFiles(path)
    
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error counting folder files:', error)
    return NextResponse.json({ error: 'Failed to count files' }, { status: 500 })
  }
}
