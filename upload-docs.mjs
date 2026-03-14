import fs from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'

const require = createRequire(import.meta.url)
const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Environment variables NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const BUCKET = 'trip-documents'
const UPLOAD_DIR = path.resolve(__dirname, 'uploads')

const passengerMappings = [
  { keyword: 'AHSAN RAMADAN', folderPath: 'ahsan/tiket-pesawat/', fileName: 'boarding-pass-ahsan-AK428.pdf' },
  { keyword: 'LISZA HERAWATI', folderPath: 'lisza/tiket-pesawat/', fileName: 'boarding-pass-lisza-AK428.pdf' },
  { keyword: 'TAUFIQURRAHMAN', folderPath: 'taufiq/tiket-pesawat/', fileName: 'boarding-pass-taufiq-AK428.pdf' },
  { keyword: 'ATHAYA RIZQULLAH', folderPath: 'athaya/tiket-pesawat/', fileName: 'boarding-pass-athaya-AK428.pdf' },
  { keyword: 'IHSAN EKA PUTRA', folderPath: 'ihsan/tiket-pesawat/', fileName: 'boarding-pass-ihsan-AK428.pdf' }
]

const keywordRules = [
  {
    keywords: ['OBJM9URZ', 'INDOMAL'],
    result: { folderPath: 'grup/tiket-transportasi/', fileName: 'itinerary-ferry-indomal-OBJM9URZ.pdf' }
  },
  {
    keywords: ['HMYWWNEAZ8', "LIV'IN", 'LIV’IN'],
    result: { folderPath: 'grup/akomodasi/', fileName: 'konfirmasi-airbnb-KL-HMYWWNEAZ8.pdf' }
  },
  {
    keywords: ['1336021316', 'TRIPLE'],
    result: { folderPath: 'grup/akomodasi/', fileName: 'voucher-hotel-hong-triple-1336021316.pdf' }
  },
  {
    keywords: ['1336023748', 'DOUBLE'],
    result: { folderPath: 'grup/akomodasi/', fileName: 'voucher-hotel-hong-double-1336023748.pdf' }
  }
]

const stats = {
  success: 0,
  failed: 0,
  unknown: 0
}

function normalizeText(text = '') {
  return text.toUpperCase()
}

function detectDocument(text) {
  const normalized = normalizeText(text)

  if (normalized.includes('E-BOARDING PASS') && normalized.includes('AK 428')) {
    const passenger = passengerMappings.find(({ keyword }) => normalized.includes(keyword))
    if (passenger) {
      return { ...passenger }
    }
  }

  for (const rule of keywordRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return { ...rule.result }
    }
  }

  return null
}

async function extractTextFromPDF(filePath) {
  const data = new Uint8Array(readFileSync(filePath))
  const pdf = await getDocument({ data, useWorker: false }).promise
  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map((item) => item.str).join(' ')
  }

  return text
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch (error) {
    return false
  }
}

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch (error) {
    console.error('Folder ./uploads/ tidak ditemukan. Buat folder tersebut dan letakkan file PDF di dalamnya.')
    process.exit(1)
  }
}

async function processFile(fileName) {
  const originalPath = path.join(UPLOAD_DIR, fileName)
  const buffer = await fs.readFile(originalPath)
  const extractedText = await extractTextFromPDF(originalPath)
  const detection = detectDocument(extractedText || '')

  if (!detection) {
    stats.unknown += 1
    console.log(`⚠️ ${fileName} → tidak terdeteksi, dilewati`)
    return
  }

  const { folderPath, fileName: targetName } = detection
  const storageKey = `${folderPath}${targetName}`
  const renamedPath = path.join(UPLOAD_DIR, targetName)

  if (targetName !== fileName) {
    if (await pathExists(renamedPath)) {
      await fs.unlink(renamedPath)
    }
    await fs.rename(originalPath, renamedPath)
  }

  const fileBuffer = targetName === fileName ? buffer : await fs.readFile(renamedPath)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storageKey, fileBuffer, { contentType: 'application/pdf', upsert: true })

  if (error) {
    throw new Error(error.message)
  }

  await fs.unlink(renamedPath)

  stats.success += 1
  console.log(`✅ ${fileName} → ${storageKey} (upload berhasil, file dihapus)`)
}

async function main() {
  await ensureUploadsDir()

  const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true })
  const pdfFiles = entries.filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.pdf'))

  if (pdfFiles.length === 0) {
    console.log('Tidak ada file PDF di ./uploads/.')
    return
  }

  for (const entry of pdfFiles) {
    const fileName = entry.name
    try {
      await processFile(fileName)
    } catch (error) {
      stats.failed += 1
      console.error(`❌ ${fileName} → error: ${error.message}`)
    }
  }

  console.log('\nSummary:')
  console.log(`✅ Berhasil        : ${stats.success}`)
  console.log(`❌ Gagal           : ${stats.failed}`)
  console.log(`⚠️ Tidak terdeteksi: ${stats.unknown}`)
}

main().catch((error) => {
  console.error('Script gagal dieksekusi:', error)
  process.exit(1)
})
