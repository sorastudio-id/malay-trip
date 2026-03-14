'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Progress } from './ui/progress'
import { uploadFile } from '@/lib/supabase'
import { toast } from 'sonner'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

interface BulkFileUploaderProps {
  folderPath: string
  folderName: string
  onUploadComplete?: () => void
}

interface FileItem {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  progress?: number
}

export default function BulkFileUploader({ folderPath, folderName, onUploadComplete }: BulkFileUploaderProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'File type not supported. Only PDF, JPG, and PNG are allowed.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB.'
    }
    return null
  }

  const handleFiles = useCallback((newFiles: FileList) => {
    const validFiles: FileItem[] = []
    
    Array.from(newFiles).forEach(file => {
      const error = validateFile(file)
      if (error) {
        toast.error(`${file.name}: ${error}`)
        return
      }
      
      // Check for duplicates
      if (files.some(f => f.file.name === file.name)) {
        toast.error(`${file.name}: File already added.`)
        return
      }
      
      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending'
      })
    })
    
    setFiles(prev => [...prev, ...validFiles])
  }, [files])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return
    
    setIsUploading(true)
    const uploadPromises: Promise<void>[] = []

    files.forEach((fileItem) => {
      const uploadPromise = new Promise<void>(async (resolve) => {
        try {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
          ))

          // Simulate progress
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => {
              if (f.id === fileItem.id && f.status === 'uploading') {
                const newProgress = Math.min((f.progress || 0) + 10, 90)
                return { ...f, progress: newProgress }
              }
              return f
            }))
          }, 200)

          await uploadFile(`${folderPath}/${fileItem.file.name}`, fileItem.file)
          
          clearInterval(progressInterval)
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'success', progress: 100 } : f
          ))
          
          resolve()
        } catch (error) {
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          ))
          resolve()
        }
      })

      uploadPromises.push(uploadPromise)
    })

    await Promise.all(uploadPromises)
    setIsUploading(false)

    // Check results
    const successCount = files.filter(f => f.status === 'success').length
    const errorCount = files.filter(f => f.status === 'error').length

    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully!`)
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} file(s) failed to upload.`)
    }

    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const clearFiles = () => {
    setFiles([])
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragging ? 'Drop files here' : 'Upload Multiple Files'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select
            </p>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              Select Files
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{files.length} file(s) selected</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFiles}>
                    Clear All
                  </Button>
                  <Button 
                    onClick={uploadFiles} 
                    disabled={isUploading || files.length === 0}
                    size="sm"
                  >
                    {isUploading ? 'Uploading...' : 'Upload All'}
                  </Button>
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((fileItem) => (
                  <div key={fileItem.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    {getFileIcon(fileItem.file)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {fileItem.file.name}
                        </span>
                        {getStatusIcon(fileItem.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                      {fileItem.status === 'uploading' && fileItem.progress !== undefined && (
                        <Progress value={fileItem.progress} className="h-1 mt-1" />
                      )}
                      {fileItem.status === 'error' && fileItem.error && (
                        <div className="text-xs text-red-500 mt-1">{fileItem.error}</div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
