const SESSION_COOKIE_NAME = 'trip-session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required for authentication checks')
  }
  return secret
}

function bufferToHex(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function sha256(input: string) {
  if (globalThis.crypto?.subtle) {
    const encoded = new TextEncoder().encode(input)
    const hash = await globalThis.crypto.subtle.digest('SHA-256', encoded)
    return bufferToHex(hash)
  }

  const { createHash } = await import('crypto')
  return createHash('sha256').update(input).digest('hex')
}

export async function createSessionToken() {
  const secret = getAuthSecret()
  const issuedAt = Date.now().toString()
  const signature = await sha256(`${issuedAt}.${secret}`)
  return `${issuedAt}.${signature}`
}

export async function verifySessionToken(token?: string | null) {
  if (!token) return false
  const [issuedAt, signature] = token.split('.')
  if (!issuedAt || !signature) return false

  const secret = getAuthSecret()
  const expectedSignature = await sha256(`${issuedAt}.${secret}`)
  if (expectedSignature !== signature) return false

  const age = Date.now() - Number(issuedAt)
  if (!Number.isFinite(age) || age > SESSION_MAX_AGE_SECONDS * 1000) {
    return false
  }

  return true
}

export async function verifySessionCookie(token?: string | null) {
  return verifySessionToken(token)
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS }
