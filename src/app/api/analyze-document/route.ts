import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const geminiApiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(geminiApiKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const documentText = body?.text

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } })

    const prompt = `Analyze the following travel document and classify it.

Possible document types: BOARDING_PASS, FERRY_TICKET, AIRBNB_BOOKING, HOTEL_VOUCHER, MDAC, PASSPORT, OTHER.
Possible owners: IHSAN, LISZA, TAUFIQ, AHSAN, ATHAYA, GROUP.

Respond strictly with JSON in this format:
{
  "documentType": "BOARDING_PASS",
  "owner": "AHSAN"
}

Document text:
${documentText.slice(0, 2000)}
`

    const result = await model.generateContent(prompt)
    const classification = (result.response?.text() || '').trim()

    return NextResponse.json({ success: true, category: classification })
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
