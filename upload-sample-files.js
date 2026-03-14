const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus diisi di .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const BUCKET_NAME = 'trip-documents'

// Mapping file ke folder tujuan
const fileMapping = [
  // Boarding Pass - Tiket Pesawat
  {
    file: 'BoardingPass_GCY6HZ_AHSAN_1424274032(PKU-KUL)_1773113637320.pdf',
    destination: 'ahsan/tiket-pesawat/Boarding-Pass-PKU-KUL.pdf'
  },
  {
    file: 'BoardingPass_GCY6HZ_ATHAYA_1424274033(PKU-KUL)_1773113712433.pdf',
    destination: 'athaya/tiket-pesawat/Boarding-Pass-PKU-KUL.pdf'
  },
  {
    file: 'BoardingPass_GCY6HZ_LISZA_1424274030(PKU-KUL)_1773113360805.pdf',
    destination: 'lisza/tiket-pesawat/Boarding-Pass-PKU-KUL.pdf'
  },
  {
    file: 'BoardingPass_GCY6HZ_TAUFIQURRAHMAN_1424274031(PKU-KUL)_1773113558362.pdf',
    destination: 'taufiq/tiket-pesawat/Boarding-Pass-PKU-KUL.pdf'
  },
  
  // Itinerary - Dokumen Grup
  {
    file: 'Itinerary Receipt (2).pdf',
    destination: 'grup/itinerary/Itinerary-Receipt.pdf'
  },
  
  // Airbnb Reservation - Dokumen Grup
  {
    file: 'Reservation Details - HMYWWNEAZ8.pdf',
    destination: 'grup/booking-airbnb/Reservation-Details-HMYWWNEAZ8.pdf'
  },
  
  // Hotel Booking - Ihsan
  {
    file: 'ihsan eka-1336021316-Hotel Hong @ Jonker Street Melaka-HOTEL_STANDALONE.pdf',
    destination: 'ihsan/voucher-hotel/Hotel-Hong-Jonker-Street-Melaka.pdf'
  }
]

async function ensureAuth() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    console.log('🔐 Signing in anonymously...')
    const { error } = await supabase.auth.signInAnonymously()
    if (error) {
      console.error('❌ Error signing in:', error.message)
      throw error
    }
    console.log('✅ Signed in successfully')
  }
}

async function uploadFile(sourceFile, destinationPath) {
  try {
    const filePath = path.join(__dirname, sourceFile)
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File tidak ditemukan: ${sourceFile}`)
      return false
    }

    const fileBuffer = fs.readFileSync(filePath)
    const fileSize = (fileBuffer.length / 1024).toFixed(2)

    console.log(`📤 Uploading: ${sourceFile} (${fileSize} KB)`)
    console.log(`   → ${destinationPath}`)

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(destinationPath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: true // Overwrite jika sudah ada
      })

    if (error) {
      console.error(`   ❌ Error: ${error.message}`)
      return false
    }

    console.log(`   ✅ Success!`)
    return true
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Starting file upload to Supabase Storage...\n')
  
  try {
    await ensureAuth()
    
    let successCount = 0
    let failCount = 0

    for (const mapping of fileMapping) {
      const success = await uploadFile(mapping.file, mapping.destination)
      if (success) {
        successCount++
      } else {
        failCount++
      }
      console.log('') // Empty line for readability
    }

    console.log('📊 Upload Summary:')
    console.log(`   ✅ Success: ${successCount}`)
    console.log(`   ❌ Failed: ${failCount}`)
    console.log(`   📁 Total: ${fileMapping.length}`)
    console.log('\n🎉 Upload selesai!')
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    process.exit(1)
  }
}

main()
