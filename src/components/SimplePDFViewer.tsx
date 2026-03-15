'use client'

import { X } from 'lucide-react'
import { Button } from './ui/button'

interface SimplePDFViewerProps {
  url: string
  fileName: string
  onClose: () => void
}

export default function SimplePDFViewer({ url, fileName, onClose }: SimplePDFViewerProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl border">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold text-sm sm:text-base truncate mr-3">{fileName}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup PDF">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="w-full overflow-hidden rounded-lg border">
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-[70vh]"
              title={fileName}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
