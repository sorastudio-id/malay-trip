'use client'

import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download, ExternalLink } from 'lucide-react'
import { Button } from './ui/button'

interface PDFViewerProps {
  url: string
  fileName: string
  onClose: () => void
}

export default function PDFViewer({ url, fileName, onClose }: PDFViewerProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === '+' || e.key === '=') handleZoomIn()
      if (e.key === '-' || e.key === '_') handleZoomOut()
      if (e.key === 'r' || e.key === 'R') handleRotate()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleDownload = () => {
    // Create download link
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

  const resetView = () => {
    setScale(1)
    setRotation(0)
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <h3 className="font-semibold text-gray-900 truncate max-w-md">{fileName}</h3>
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {Math.round(scale * 100)}% • {rotation}°
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In (+)">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out (-)">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate} title="Rotate (R)">
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView} title="Reset View">
              <span className="text-xs font-medium">Reset</span>
            </Button>
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

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
        <div 
          className="relative bg-white shadow-2xl"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
            width: '100%',
            maxWidth: '900px',
            height: '1200px'
          }}
        >
          {/* Use object tag instead of iframe */}
          <object
            data={url}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ border: 'none' }}
          >
            <div className="flex flex-col items-center justify-center h-full p-8">
              <p className="text-gray-600 mb-4">PDF cannot be displayed in this viewer</p>
              <div className="flex gap-2">
                <Button onClick={handleOpenNewTab}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Browser
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </object>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="bg-white border-t p-3 shadow-lg">
        <div className="text-center text-xs text-gray-600">
          Use mouse wheel to zoom • Click to reset • ESC to close • + - to zoom • R to rotate
        </div>
      </div>
    </div>
  )
}
