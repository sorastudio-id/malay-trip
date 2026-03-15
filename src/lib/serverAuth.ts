import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

export async function isServerAuthenticated() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export async function requireServerAuth() {
  const authenticated = await isServerAuthenticated()
  if (!authenticated) {
    throw new Error('UNAUTHORIZED')
  }
}
