# 🇲🇾 Malaysia Trip Document Manager

Aplikasi web modern untuk mengelola dokumen perjalanan ke Malaysia. Dibangun dengan Next.js 14, Supabase Storage, dan Tailwind CSS.

## ✨ Fitur Utama

- 🔐 **Autentikasi Sederhana** - Password bersama untuk akses cepat
- 👥 **Multi-User** - Kelola dokumen untuk 5 anggota trip
- 📁 **Folder Terorganisir** - 7 kategori dokumen per anggota
- 📤 **Upload & Preview** - Drag & drop, preview PDF & gambar
- 🌙 **Dark Mode** - Toggle tema terang/gelap
- 📱 **PWA Ready** - Install sebagai aplikasi mobile
- 🔄 **Offline Support** - Akses dokumen yang sudah dibuka secara offline
- 🎨 **Modern UI** - Design clean dengan Tailwind CSS & shadcn/ui

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Storage**: Supabase Storage (tanpa database)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **PWA**: @next/pwa
- **Language**: TypeScript

## 📦 Instalasi

1. Clone repository:
```bash
git clone <repository-url>
cd malaysia-trip-app
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
Buat file `.env.local` dengan isi:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_PASSWORD=your_password
```

4. Jalankan development server:
```bash
npm run dev
```

5. Buka [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment ke Vercel

### 1. Setup Supabase Storage

1. Buat project di [Supabase](https://supabase.com)
2. Buka **Storage** → Buat bucket baru:
   - Name: `trip-documents`
   - Public: **false** (private)
3. Setup Storage Policies:
   - Buka bucket `trip-documents` → Policies
   - Tambahkan policy untuk **SELECT** (read):
     ```sql
     CREATE POLICY "Allow authenticated read"
     ON storage.objects FOR SELECT
     TO authenticated
     USING (bucket_id = 'trip-documents');
     ```
   - Tambahkan policy untuk **INSERT** (upload):
     ```sql
     CREATE POLICY "Allow authenticated upload"
     ON storage.objects FOR INSERT
     TO authenticated
     WITH CHECK (bucket_id = 'trip-documents');
     ```
   - Tambahkan policy untuk **DELETE**:
     ```sql
     CREATE POLICY "Allow authenticated delete"
     ON storage.objects FOR DELETE
     TO authenticated
     USING (bucket_id = 'trip-documents');
     ```

### 2. Deploy ke Vercel

1. Push code ke GitHub repository
2. Buka [Vercel](https://vercel.com) dan import project
3. Tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL Supabase project
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon/Public key dari Supabase
   - `NEXT_PUBLIC_APP_PASSWORD`: Password untuk login
4. Deploy!

### 3. Setup PWA Icons

Buat icon untuk PWA (192x192 dan 512x512):
- Simpan sebagai `public/icon-192.png`
- Simpan sebagai `public/icon-512.png`

Atau gunakan tool online seperti [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

## 📁 Struktur Folder Storage

```
trip-documents/
├── ihsan/
│   ├── paspor/
│   ├── mdac/
│   ├── tiket-pesawat/
│   ├── tiket-ferry/
│   ├── voucher-hotel/
│   ├── tiket-wisata/
│   └── lainnya/
├── lisza/
├── taufiq/
├── ahsan/
├── athaya/
└── grup/
    ├── itinerary/
    ├── booking-airbnb/
    ├── panduan-perjalanan/
    └── info-keuangan/
```

## 👥 Anggota Trip

1. Ihsan Eka Putra
2. Lisza Herawati
3. Taufiqurrahman
4. Ahsan Ramadan
5. Athaya Rizqullah

## 📝 Catatan

- Tidak menggunakan database SQL sama sekali
- Semua metadata file diambil dari Supabase Storage API
- File maksimal 10MB
- Format yang didukung: PDF, JPG, PNG
- Session login berlaku 7 hari

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT License - bebas digunakan untuk keperluan pribadi atau komersial.
