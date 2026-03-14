'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-muted/20">
          <h2 className="text-2xl font-semibold">Terjadi kesalahan global</h2>
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  )
}
