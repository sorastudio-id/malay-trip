'use client'

import { useCallback, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'
import { uploadFile, listFiles } from '@/lib/supabase'
import { buildStoragePath, normalizeDocumentTypeKey, normalizeOwnerSlug } from '@/lib/folderMapping'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader2, CheckCircle2, AlertCircle, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

const STEP_CONFIG = [
  { key: 'extract', label: 'Step 1 · Extract PDF' },
  { key: 'analyze', label: 'Step 2 · Kirim ke Gemini' },
  { key: 'detect', label: 'Step 3 · Hasil Deteksi' },
  { key: 'upload', label: 'Step 4 · Upload ke Supabase' },
  { key: 'complete', label: 'Step 5 · Tampilkan Hasil' }
] as const

type StepKey = (typeof STEP_CONFIG)[number]['key']
type StepStatus = 'pending' | 'running' | 'success' | 'error'

type AnalysisResult = {
  documentType: string
  owner: string
  confidence?: number
  detectedInfo?: string
}

type ProcessRecord = {
  id: string
  file: File
  name: string
  size: number
  steps: Record<StepKey, StepStatus>
  textPreview?: string
  result?: AnalysisResult
  finalPath?: string
  error?: string
  duplicate?: boolean
  duplicateMessage?: string
  skipped?: boolean
}

const formatBytes = (bytes: number) => {
  if (!Number.isFinite(bytes)) return '0 KB'
  if (bytes === 0) return '0 KB'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`
}

const createInitialSteps = (): Record<StepKey, StepStatus> => {
  return STEP_CONFIG.reduce((acc, step) => {
    acc[step.key] = 'pending'
    return acc
  }, {} as Record<StepKey, StepStatus>)
}

const buildFileName = (documentType: string, owner?: string, originalName?: string) => {
  const ext = originalName?.split('.').pop() || 'pdf'
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
  const safeOwner = normalizeOwnerSlug(owner)
  const safeDoc = normalizeDocumentTypeKey(documentType).toLowerCase()
  return `${safeDoc}-${safeOwner}-${timestamp}.${ext}`
}

const normalizeFolderKey = (path: string) => path.replace(/^\/+/, '').replace(/\/+$/, '')

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

async function extractTextFromPdf(file: File) {
  if (!(file instanceof File)) {
    throw new Error('Invalid file input')
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    let fullText = ''
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => (item && typeof item === 'object' && 'str' in item ? item.str || '' : ''))
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText.trim()
  } catch (error) {
    console.error('PDF extraction failed', error)
    throw new Error('Gagal membaca konten PDF')
  }
}

export default function UploadAiPage() {
  const [processes, setProcesses] = useState<ProcessRecord[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const folderCacheRef = useRef<Record<string, string[]>>({})

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const accepted: ProcessRecord[] = []

    Array.from(fileList).forEach((file) => {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} bukan PDF`)
        return
      }

      accepted.push({
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        steps: createInitialSteps()
      })
    })

    if (accepted.length) {
      setProcesses((prev) => [...prev, ...accepted])
    }
  }, [])

  const removeProcess = (id: string) => {
    if (processing) return
    setProcesses((prev) => prev.filter((proc) => proc.id !== id))
  }

  const updateStep = (id: string, step: StepKey, status: StepStatus) => {
    setProcesses((prev) =>
      prev.map((proc) => (proc.id === id ? { ...proc, steps: { ...proc.steps, [step]: status } } : proc))
    )
  }

  const updateProcess = (id: string, patch: Partial<ProcessRecord>) => {
    setProcesses((prev) => prev.map((proc) => (proc.id === id ? { ...proc, ...patch } : proc)))
  }

  const getFolderFiles = useCallback(async (folderPath: string) => {
    const key = normalizeFolderKey(folderPath)
    if (folderCacheRef.current[key]) {
      return folderCacheRef.current[key]
    }

    const files = await listFiles(key)
    const names = files
      .map((file) => (file.name ? file.name.toLowerCase() : null))
      .filter(Boolean) as string[]

    folderCacheRef.current[key] = names
    return names
  }, [])

  const analyzeDocument = async (text: string): Promise<AnalysisResult> => {
    const response = await fetch('/api/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Gagal memanggil Gemini API')
    }

    return response.json()
  }

  const resolvePath = (documentType: string, owner?: string) => {
    return buildStoragePath(documentType, owner).replace(/\/+/g, '/').replace(/\/+$/, '/')
  }

  const runPipeline = async (record: ProcessRecord): Promise<'uploaded' | 'skipped' | 'error'> => {
    const { id, file } = record
    let currentStep: StepKey | null = null

    try {
      currentStep = 'extract'
      updateStep(id, currentStep, 'running')
      const text = await extractTextFromPdf(file)
      updateProcess(id, { textPreview: text.slice(0, 280) })
      updateStep(id, 'extract', 'success')

      currentStep = 'analyze'
      updateStep(id, currentStep, 'running')
      const analysis = await analyzeDocument(text)
      updateStep(id, 'analyze', 'success')

      currentStep = 'detect'
      updateStep(id, currentStep, 'running')
      updateProcess(id, { result: analysis })
      updateStep(id, 'detect', 'success')

      currentStep = 'upload'
      updateStep(id, currentStep, 'running')
      const folder = resolvePath(analysis.documentType, analysis.owner)
      const autoName = buildFileName(analysis.documentType, analysis.owner, file.name)
      const renamedFile = new File([file], autoName, { type: file.type })

      const folderKey = normalizeFolderKey(folder)
      const existingNames = await getFolderFiles(folderKey)
      const targetName = autoName.toLowerCase()
      const isDuplicate = existingNames.some((name) => name === targetName)

      if (isDuplicate) {
        const message = `File '${record.name}' sudah ada di folder ini. Hapus file lama terlebih dahulu jika ingin menggantinya.`
        updateProcess(id, {
          duplicate: true,
          duplicateMessage: message,
          skipped: true,
          error: message
        })
        updateStep(id, 'upload', 'error')
        toast.warning('File sudah ada', { description: message })
        return 'skipped'
      }

      await uploadFile(`${folder}${autoName}`, renamedFile)
      folderCacheRef.current[folderKey] = [...(existingNames || []), targetName]
      updateProcess(id, { finalPath: `${folder}${autoName}` })
      updateStep(id, 'upload', 'success')

      currentStep = 'complete'
      updateStep(id, currentStep, 'running')
      updateStep(id, currentStep, 'success')
      toast.success(`${file.name} selesai diunggah`)
      return 'uploaded'
    } catch (error) {
      console.error('Pipeline failed', error)
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan'
      updateProcess(id, { error: message })
      if (currentStep) {
        updateStep(id, currentStep, 'error')
      }
      toast.error(`${record.name}: ${message}`)
      return 'error'
    }
  }

  const startProcessing = async () => {
    if (!processes.length || processing) return
    setProcessing(true)

    let uploadedCount = 0
    let skippedCount = 0
    const skippedNames: string[] = []

    for (const record of processes) {
      const alreadyDone = record.steps.complete === 'success' || record.skipped
      if (alreadyDone) continue
      const result = await runPipeline(record)
      if (result === 'uploaded') uploadedCount += 1
      if (result === 'skipped') {
        skippedCount += 1
        skippedNames.push(record.name)
      }
    }

    setProcessing(false)

    if (uploadedCount > 0) {
      toast.success(`${uploadedCount} file berhasil diupload`)
    }

    if (skippedNames.length > 0) {
      const summary = `${skippedNames.length} file dilewati karena sudah ada: ${skippedNames.join(', ')}`
      toast.warning('File sudah ada', { description: summary })
    }
  }

  const dropProps = {
    onDragOver: (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      setIsDragging(true)
    },
    onDragLeave: () => setIsDragging(false),
    onDrop: (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    }
  }

  const readyToAnalyze = processes.length > 0

  return (
    <div className="container py-12 space-y-8">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <span className="text-xl">🤖</span>
          Upload Cerdas
        </p>
        <h1 className="text-4xl font-bold tracking-tight">Upload Cerdas 🤖</h1>
        <p className="max-w-2xl text-muted-foreground text-lg">
          Upload beberapa PDF sekaligus, biarkan AI mendeteksi jenis dokumen serta pemiliknya secara otomatis, lalu unggah ke folder Supabase yang benar tanpa repot.
        </p>
      </header>

      <section className="rounded-2xl border border-dashed bg-muted/40 p-8">
        <label
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-primary/40 bg-white/80 p-10 text-center transition',
            isDragging && 'border-primary bg-primary/5 shadow-lg'
          )}
          {...dropProps}
        >
          <UploadCloud className="h-12 w-12 text-primary" />
          <div>
            <p className="text-xl font-semibold">Tarik & letakkan PDF kamu di sini</p>
            <p className="text-sm text-muted-foreground">
              Mendukung banyak file sekaligus · Maksimum 10 MB per file
            </p>
          </div>
          <input
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
          <Button type="button" variant="secondary" onClick={(event) => (event.currentTarget.previousElementSibling as HTMLInputElement)?.click()}>
            Pilih File PDF
          </Button>
        </label>
      </section>

      {processes.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">{processes.length} file siap dianalisis</p>
          <Button size="lg" disabled={!readyToAnalyze || processing} onClick={startProcessing}>
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analisis & Upload Otomatis
          </Button>
        </div>
      )}

      <section className="space-y-4">
        {processes.map((record) => (
          <div
            key={record.id}
            className={cn(
              'rounded-2xl border bg-white/80 p-6 shadow-sm',
              record.duplicate && 'border-red-300 bg-red-50/80'
            )}
          >
            <div className="flex flex-wrap items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{record.name}</h3>
                <p className="text-sm text-muted-foreground">{formatBytes(record.size)}</p>
              </div>
              {record.skipped && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                  Dilewati (duplikat)
                </span>
              )}
              {!processing && (
                <Button variant="ghost" size="icon" onClick={() => removeProcess(record.id)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-5">
              {STEP_CONFIG.map((step) => {
                const status = record.steps[step.key]
                return (
                  <div key={step.key} className="rounded-xl border p-3">
                    <p className="text-xs font-medium text-muted-foreground">{step.label}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      {status === 'pending' && <span className="h-2 w-2 rounded-full bg-muted" />}
                      {status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                      {status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                      {status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className={cn('font-medium', status === 'error' && 'text-red-600')}>{status}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {record.result && (
              <div className="mt-6 grid gap-4 rounded-xl border bg-primary/5 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">Dokumen</p>
                  <p className="text-lg font-semibold">{record.result.documentType}</p>
                  <p className="text-sm text-muted-foreground">
                    Pemilik: <span className="font-semibold text-primary">{record.result.owner}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">Confidence</p>
                  <p className="text-lg font-semibold">
                    {record.result.confidence ? `${(record.result.confidence * 100).toFixed(1)}%` : '—'}
                  </p>
                  {record.result.detectedInfo && <p className="text-sm text-muted-foreground">{record.result.detectedInfo}</p>}
                </div>
              </div>
            )}

            {record.finalPath && (
              <div className="mt-4 rounded-xl border border-green-200 bg-green-50/80 p-4 text-sm text-green-800">
                ✅ Disimpan ke <span className="font-semibold">{record.finalPath}</span>
              </div>
            )}

            {record.error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700">
                ❌ {record.error}
              </div>
            )}

            {record.textPreview && (
              <details className="mt-4 rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                <summary className="cursor-pointer font-semibold text-foreground">Cuplikan teks</summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">{record.textPreview}...</pre>
              </details>
            )}
          </div>
        ))}

        {processes.length === 0 && (
          <div className="rounded-2xl border border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center text-muted-foreground">
            Belum ada file. Mulai dengan drag & drop PDF pada area di atas.
          </div>
        )}
      </section>
    </div>
  )
}
