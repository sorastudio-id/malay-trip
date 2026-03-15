import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, createSessionToken } from '@/lib/auth'

const isProduction = process.env.NODE_ENV === 'production'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const password: string = body?.password || ''
  const expectedPassword = process.env.APP_PASSWORD

  if (!expectedPassword) {
    return NextResponse.json({ error: 'Server misconfiguration: APP_PASSWORD missing' }, { status: 500 })
  }

  if (!password) {
    return NextResponse.json({ error: 'Password wajib diisi' }, { status: 400 })
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 })
  }

  const token = await createSessionToken()
  const response = NextResponse.json({ success: true })

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProduction,
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS
  })

  return response
}
