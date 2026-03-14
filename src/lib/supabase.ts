import { createClient } from '@supabase/supabase-js'
import { MEMBER_FOLDERS, GROUP_FOLDERS } from '@/lib/constants'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const BUCKET_NAME = 'trip-documents'

// Sign in anonymously untuk akses storage
export async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }
}

// Upload file ke storage
export async function uploadFile(path: string, file: File) {
  await ensureAuth()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error
  return data
}

// List files di folder tertentu
export async function listFiles(folderPath: string) {
  await ensureAuth()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(folderPath, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' }
    })

  if (error) throw error
  return data || []
}

// Get signed URL untuk preview/download (untuk private bucket)
export async function getFileUrl(path: string, expiresIn = 3600) {
  await ensureAuth()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    console.error('Error creating signed URL:', error)
    return ''
  }
  
  return data.signedUrl
}

// Download file
export async function downloadFile(path: string) {
  await ensureAuth()
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(path)

  if (error) throw error
  return data
}

// Delete file
export async function deleteFile(path: string) {
  await ensureAuth()
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) throw error
}

// Count files untuk member tertentu
export async function countMemberFiles(memberSlug: string) {
  await ensureAuth()
  
  const folderSlugs = MEMBER_FOLDERS.map(folder => folder.slug)
  let totalFiles = 0

  for (const slug of folderSlugs) {
    const files = await listFiles(`${memberSlug}/${slug}`)
    totalFiles += files.length
  }

  return totalFiles
}

// Count files untuk grup
export async function countGroupFiles() {
  await ensureAuth()
  
  const folderSlugs = GROUP_FOLDERS.map(folder => folder.slug)
  let totalFiles = 0

  for (const slug of folderSlugs) {
    const files = await listFiles(`grup/${slug}`)
    totalFiles += files.length
  }

  return totalFiles
}

// Count files di folder tertentu
export async function countFolderFiles(folderPath: string) {
  await ensureAuth()
  
  try {
    const files = await listFiles(folderPath)
    return files.length
  } catch (error) {
    console.error('Error counting files:', error)
    return 0
  }
}
