import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth'
import { requireServerAuth } from '@/lib/serverAuth'

const isProduction = process.env.NODE_ENV === 'production'

export async function POST() {
  try {
    await requireServerAuth()
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: 0
  })
  return response
}
