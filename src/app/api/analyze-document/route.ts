import OpenAI from 'openai'
import { NextResponse } from 'next/server'
import { normalizeDocumentTypeKey, normalizeOwnerName } from '@/lib/folderMapping'
import { requireServerAuth } from '@/lib/serverAuth'

const ALLOWED_OWNER_SLUGS = new Set(['ihsan', 'lisza', 'taufiq', 'ahsan', 'athaya', 'grup'])

const openrouterApiKey = process.env.OPENROUTER_API_KEY || ''
const openrouterModel = process.env.OPENROUTER_MODEL || 'openrouter/healer-alpha'
const openrouter = openrouterApiKey
  ? new OpenAI({
      apiKey: openrouterApiKey,
      baseURL: 'https://openrouter.ai/api/v1'
    })
  : null

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) return codeBlockMatch[1].trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) return jsonMatch[0].trim()
  return text.trim()
}

export async function POST(request: Request) {
  try {
    await requireServerAuth()
    if (!openrouter) {
      console.error('OpenRouter API key is missing')
      return NextResponse.json(
        { error: 'Gagal menganalisis dokumen. Coba lagi nanti.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const documentText = body?.text

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const text = documentText.slice(0, 4000)
    const prompt = `
You MUST respond with ONLY a raw JSON object. No markdown, no code blocks, no explanation text whatsoever. Just the JSON object starting with { and ending with }.

Analisis teks dokumen PDF berikut.

RULES FOR DETERMINING "owner":
- Jika dokumen MILIK SATU orang (passport, MDAC, tiket personal) → owner = nama depan mereka dalam huruf kecil: "ihsan", "lisza", "taufiq", "ahsan", atau "athaya" saja.
- ONLY gunakan "grup" jika dokumen jelas berlaku UNTUK SEMUA 5 ORANG sekaligus (contoh: booking Airbnb bersama, itinerary grup, dokumen finansial bersama).
- Jika ada nama satu orang pada dokumen → owner = orang tersebut, BUKAN "grup".
- Dokumen MDAC SELALU personal → owner harus nama orang tersebut.
- Dokumen Paspor SELALU personal → owner harus nama orang tersebut.

KNOWN MEMBERS AND OWNER VALUES:
- IHSAN EKA PUTRA → "ihsan"
- LISZA HERAWATI → "lisza"
- TAUFIQURRAHMAN → "taufiq"
- AHSAN RAMADAN → "ahsan"
- ATHAYA RIZQULLAH → "athaya"

JENIS DOKUMEN:
- BOARDING_PASS: ada "Boarding Pass", "AK 428", "PKU→KUL", seat number
- FERRY_TICKET: ada "INDOMAL", "OBJM9URZ", "Melaka", "Dumai", "Fast Ferry"  
- AIRBNB: ada "Airbnb", "HMYWWNEAZ8", "Liv'in", "Regalia"
- HOTEL_VOUCHER_TRIPLE: ada "Hotel Hong" DAN ("Triple" ATAU "1336021316")
- HOTEL_VOUCHER_DOUBLE: ada "Hotel Hong" DAN ("Double" ATAU "1336023748")
- MDAC: ada "Malaysia Digital Arrival Card" atau "MDAC" atau "imigresen"
- PASSPORT: ada "Passport No" atau "Paspor" atau nomor paspor format huruf+angka

Balas HANYA JSON valid:
{
  "documentType": "BOARDING_PASS",
  "owner": "ahsan", 
  "confidence": 0.95,
  "detectedInfo": "Boarding pass AirAsia AK428 atas nama AHSAN RAMADAN"
}

Teks dokumen:
${text}
`

    const response = await openrouter.chat.completions.create({
      model: openrouterModel,
      temperature: 0,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    const choice = response.choices?.[0]
    const messageContent = choice?.message?.content
    let classificationText = ''

    if (typeof messageContent === 'string') {
      classificationText = messageContent.trim()
    } else if (Array.isArray(messageContent)) {
      const contentArray = messageContent as Array<{ type: string; text?: string }>
      const textPart = contentArray.find((part) => part.type === 'text')
      classificationText = (textPart?.text || '').trim()
    }

    try {
      const parsed = JSON.parse(extractJSON(classificationText))
      const normalizedDocumentType = normalizeDocumentTypeKey(parsed?.documentType)
      const normalizedOwner = normalizeOwnerName(parsed?.owner)

      if (normalizedOwner === 'UNKNOWN') {
        return NextResponse.json(
          { error: 'Pemilik dokumen tidak valid. Silakan upload manual.' },
          { status: 400 }
        )
      }

      const ownerSlug = normalizedOwner === 'GROUP' ? 'grup' : normalizedOwner.toLowerCase()

      if (!ALLOWED_OWNER_SLUGS.has(ownerSlug)) {
        return NextResponse.json(
          { error: 'Pemilik dokumen tidak dikenali. Silakan upload manual.' },
          { status: 400 }
        )
      }

      return NextResponse.json({
        ...parsed,
        documentType: normalizedDocumentType,
        owner: ownerSlug
      })
    } catch (parseError) {
      console.error('Failed to parse OpenRouter JSON:', classificationText)
      return NextResponse.json(
        { error: 'Gagal menganalisis dokumen. Coba lagi.' },
        { status: 500 }
      )
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('OpenRouter API Error:', error)
    return NextResponse.json(
      {
        error: 'Gagal menganalisis dokumen. Coba lagi.'
      },
      { status: 500 }
    )
  }
}
