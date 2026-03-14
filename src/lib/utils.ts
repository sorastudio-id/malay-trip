import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const TIMESTAMP_SUFFIX_REGEX = /-\d{10,15}(?=\.[^.]+$)/
const TIMESTAMP_SUFFIX_NO_EXT_REGEX = /-\d{10,15}$/

export function getDisplayFileName(name: string, maxLength = 30) {
  if (!name) {
    return { displayName: '', needsTooltip: false, originalName: '' }
  }

  const cleanedName = name
    .replace(TIMESTAMP_SUFFIX_REGEX, '')
    .replace(TIMESTAMP_SUFFIX_NO_EXT_REGEX, '')
  const shouldTruncate = cleanedName.length > maxLength

  return {
    displayName: shouldTruncate ? `${cleanedName.slice(0, maxLength)}...` : cleanedName,
    needsTooltip: shouldTruncate || cleanedName !== name,
    originalName: name
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  
  const authData = localStorage.getItem('trip-auth')
  if (!authData) return false

  try {
    const { timestamp } = JSON.parse(authData)
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    return Date.now() - timestamp < sevenDays
  } catch {
    return false
  }
}

export function setAuth() {
  localStorage.setItem('trip-auth', JSON.stringify({ timestamp: Date.now() }))
}

export function clearAuth() {
  localStorage.removeItem('trip-auth')
}
