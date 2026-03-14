'use client'

import { useState, useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'

interface SimplePDFViewerProps {
  url: string
  fileName: string
  onClose: () => void
}

export default function SimplePDFViewer({ url, fileName, onClose }: SimplePDFViewerProps) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    window.open(url, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900 truncate max-w-md">{fileName}</h3>
            {loading && (
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Loading...
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenNewTab} title="Open in New Tab">
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} title="Download">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} title="Close (Esc)">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Content - Full Screen Embed */}
      <div className="flex-1 bg-white">
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          onError={() => {
            console.error('Failed to load PDF iframe')
            setLoading(false)
          }}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-3 shadow-lg">
        <div className="text-center text-xs text-gray-600">
          If PDF doesn't load properly, use "Open in New Tab" or "Download" buttons above
        </div>
      </div>
    </div>
  )
}
