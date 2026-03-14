export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-muted/20">
      <h2 className="text-2xl font-semibold">404 - Halaman tidak ditemukan</h2>
      <a href="/dashboard" className="text-blue-600 underline">
        Kembali ke Dashboard
      </a>
    </div>
  )
}
