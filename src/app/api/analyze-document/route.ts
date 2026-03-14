import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

const geminiApiKey = process.env.GEMINI_API_KEY || ''
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
const ai = new GoogleGenAI({ apiKey: geminiApiKey })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const documentText = body?.text

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const text = documentText.slice(0, 4000)
    const prompt = `
Analisis teks dokumen PDF berikut.

ATURAN PENTING:
- Jika dokumen adalah hotel/penginapan/ferry/airbnb 
  yang berlaku untuk BANYAK orang → owner = GROUP
- Jika dokumen adalah boarding pass PERSONAL 
  milik 1 orang → owner = nama orang tersebut
- Nama dalam booking hotel BUKAN berarti 
  dokumen itu milik orang tersebut secara pribadi

JENIS DOKUMEN:
- BOARDING_PASS: ada "Boarding Pass", "AK 428", "PKU→KUL", seat number
- FERRY_TICKET: ada "INDOMAL", "OBJM9URZ", "Melaka", "Dumai", "Fast Ferry"  
- AIRBNB: ada "Airbnb", "HMYWWNEAZ8", "Liv'in", "Regalia"
- HOTEL_VOUCHER_TRIPLE: ada "Hotel Hong" DAN ("Triple" ATAU "1336021316")
- HOTEL_VOUCHER_DOUBLE: ada "Hotel Hong" DAN ("Double" ATAU "1336023748")
- MDAC: ada "Malaysia Digital Arrival Card" atau "MDAC" atau "imigresen"
- PASSPORT: ada "Passport No" atau "Paspor" atau nomor paspor format huruf+angka

PEMILIK:
- BOARDING_PASS → cari nama penumpang di dokumen:
  IHSAN/ihsan → IHSAN
  LISZA/lisza → LISZA
  TAUFIQ/taufiq/Taufiqurrahman → TAUFIQ
  AHSAN/ahsan → AHSAN
  ATHAYA/athaya → ATHAYA
- FERRY_TICKET → selalu GROUP (untuk 5 orang)
- AIRBNB → selalu GROUP
- HOTEL_VOUCHER_TRIPLE → selalu GROUP
- HOTEL_VOUCHER_DOUBLE → selalu GROUP
- MDAC → cari nama orang yang mendaftar
- PASSPORT → cari nama di paspor

Balas HANYA JSON valid:
{
  "documentType": "BOARDING_PASS",
  "owner": "AHSAN", 
  "confidence": 0.95,
  "detectedInfo": "Boarding pass AirAsia AK428 atas nama AHSAN RAMADAN"
}

Teks dokumen:
${text}
`

    const response = await ai.models.generateContent({
      model: geminiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    })
    const classificationText = (response.text || '').trim()

    try {
      const parsed = JSON.parse(classificationText)
      return NextResponse.json(parsed)
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', classificationText)
      return NextResponse.json({ error: 'Invalid AI response format' }, { status: 500 })
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
