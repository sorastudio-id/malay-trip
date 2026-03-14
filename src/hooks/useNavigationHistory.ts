'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function useNavigationHistory() {
  const router = useRouter()
  const pathname = usePathname()
  const historyRef = useRef<string[]>([])

  useEffect(() => {
    // Add current path to history if it's different from the last one
    if (historyRef.current[historyRef.current.length - 1] !== pathname) {
      historyRef.current.push(pathname)
      
      // Keep only last 10 entries
      if (historyRef.current.length > 10) {
        historyRef.current = historyRef.current.slice(-10)
      }
    }
  }, [pathname])

  const goBack = () => {
    if (historyRef.current.length > 1) {
      // Remove current path from history
      historyRef.current.pop()
      
      // Get the previous path
      const previousPath = historyRef.current[historyRef.current.length - 1]
      
      // Navigate to previous path
      router.push(previousPath)
    } else {
      // If no history, go to dashboard
      router.push('/dashboard')
    }
  }

  return { goBack }
}
