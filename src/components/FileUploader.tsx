'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { listFiles, uploadFile } from '@/lib/supabase'
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants'
import { toast } from 'sonner'

interface FileUploaderProps {
  folderPath: string
  folderName: string
  onUploadComplete?: () => void
}

export default function FileUploader({ folderPath, folderName, onUploadComplete }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File terlalu besar. Maksimal 10MB'
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Tipe file tidak didukung. Hanya PDF, JPG, dan PNG'
    }
    return null
  }

  const handleFileSelect = (file: File) => {
    const error = validateFile(file)
    if (error) {
      toast.error(error)
      return
    }
    setSelectedFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      setProgress(0)

      const uniqueName = await getUniqueFileName(selectedFile)
      const fileToUpload =
        uniqueName === selectedFile.name
          ? selectedFile
          : new File([selectedFile], uniqueName, { type: selectedFile.type })

      const filePath = `${folderPath}/${fileToUpload.name}`

      const progressTimer = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev
          return prev + 5
        })
      }, 200)

      await uploadFile(filePath, fileToUpload)

      window.clearInterval(progressTimer)
      setProgress(100)

      toast.success('File berhasil diupload!')
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
      onUploadComplete?.()
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Gagal upload file')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 400)
    }
  }

  const getUniqueFileName = async (file: File) => {
    try {
      const files = await listFiles(folderPath)
      const existingNames = new Set(files.map((item) => item.name))
      if (!existingNames.has(file.name)) return file.name

      const extension = file.name.includes('.') ? `.${file.name.split('.').pop()}` : ''
      const baseName = extension ? file.name.replace(new RegExp(`${extension}$`), '') : file.name
      let candidate = ''

      do {
        candidate = `${baseName}-${Date.now()}${extension}`
      } while (existingNames.has(candidate))

      return candidate
    } catch (error) {
      console.error('Error checking file names:', error)
      return file.name
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-medium">{selectedFile.name}</span>
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                  className="text-destructive hover:text-destructive/80"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {uploading ? 'Mengunggah...' : 'Upload File'}
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop file atau klik untuk pilih
              </p>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                Pilih File
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                PDF, JPG, PNG (Max 10MB)
              </p>
            </>
          )}
        </div>

        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Mengunggah...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
