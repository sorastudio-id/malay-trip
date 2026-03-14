'use client'

import { X } from 'lucide-react'
import { Button } from './ui/button'
import { getDisplayFileName } from '@/lib/utils'

interface FilePreviewProps {
  fileName: string
  fileUrl: string
  fileType: string
  onClose: () => void
}

export default function FilePreview({ fileName, fileUrl, fileType, onClose }: FilePreviewProps) {
  const { displayName, needsTooltip } = getDisplayFileName(fileName)
  const isPDF = fileType === 'application/pdf'
  const isImage = fileType.startsWith('image/')

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-background border rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold flex-1" title={needsTooltip ? fileName : undefined}>
            {displayName}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isPDF && (
            <iframe
              src={fileUrl}
              className="w-full h-full rounded border"
              title={fileName}
            />
          )}

          {isImage && (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
