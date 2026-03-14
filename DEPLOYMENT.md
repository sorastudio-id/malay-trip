# 🚀 Panduan Deployment Malaysia Trip App

## 📋 Persiapan

### 1. Setup Supabase Project

1. **Buat Project Baru**
   - Buka [https://supabase.com](https://supabase.com)
   - Klik "New Project"
   - Isi nama project: `malay-trip`
   - Pilih region terdekat (Singapore untuk performa terbaik)
   - Set database password (simpan dengan aman)
   - Tunggu project selesai dibuat (~2 menit)

2. **Buat Storage Bucket**
   - Buka menu **Storage** di sidebar
   - Klik **"New bucket"**
   - Bucket name: `trip-documents`
   - **Public bucket**: OFF (harus private!)
   - Klik **"Create bucket"**

3. **Setup Storage Policies**
   
   Buka bucket `trip-documents` → klik **"Policies"** → **"New Policy"**
   
   **Policy 1: Allow Read**
   ```sql
   CREATE POLICY "Allow authenticated read"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'trip-documents');
   ```
   
   **Policy 2: Allow Upload**
   ```sql
   CREATE POLICY "Allow authenticated upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'trip-documents');
   ```
   
   **Policy 3: Allow Delete**
   ```sql
   CREATE POLICY "Allow authenticated delete"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'trip-documents');
   ```

4. **Dapatkan API Keys**
   - Buka **Settings** → **API**
   - Copy **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - Copy **anon/public key** (key yang panjang)

### 2. Setup Vercel Project

1. **Push ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Malaysia Trip App"
   git branch -M main
   git remote add origin https://github.com/username/malaysia-trip-app.git
   git push -u origin main
   ```

2. **Import ke Vercel**
   - Buka [https://vercel.com](https://vercel.com)
   - Klik **"Add New"** → **"Project"**
   - Import repository dari GitHub
   - Framework Preset: **Next.js** (auto-detect)

3. **Configure Environment Variables**
   
   Di halaman deployment Vercel, tambahkan environment variables:
   
   | Name | Value | Example |
   |------|-------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase project | `https://xxxxx.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dari Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
   | `NEXT_PUBLIC_APP_PASSWORD` | Password untuk login app | `keranjangibu1` |

4. **Deploy**
   - Klik **"Deploy"**
   - Tunggu build selesai (~2-3 menit)
   - Aplikasi siap digunakan! 🎉

### 3. Setup PWA Icons

Untuk pengalaman PWA yang sempurna, buat icon aplikasi:

1. **Buat Icon 512x512**
   - Gunakan Canva atau Figma
   - Design icon dengan emoji 🇲🇾 atau logo trip
   - Export sebagai PNG 512x512px
   - Simpan sebagai `public/icon-512.png`

2. **Buat Icon 192x192**
   - Resize icon yang sama ke 192x192px
   - Simpan sebagai `public/icon-192.png`

3. **Re-deploy**
   ```bash
   git add public/icon-*.png
   git commit -m "Add PWA icons"
   git push
   ```

## 🔧 Instalasi Lokal

Untuk development di komputer lokal:

```bash
# 1. Clone repository
git clone https://github.com/username/malaysia-trip-app.git
cd malaysia-trip-app

# 2. Install dependencies
npm install

# 3. Setup environment variables
# Buat file .env.local dengan isi:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_PASSWORD=keranjangibu1

# 4. Run development server
npm run dev

# 5. Buka http://localhost:3000
```

## 📱 Install sebagai PWA

### Di Android:
1. Buka aplikasi di Chrome
2. Tap menu (⋮) → **"Add to Home screen"**
3. Konfirmasi → Icon muncul di home screen
4. Buka dari home screen untuk pengalaman fullscreen

### Di iOS:
1. Buka aplikasi di Safari
2. Tap tombol Share (⬆️)
3. Scroll → **"Add to Home Screen"**
4. Konfirmasi → Icon muncul di home screen

## 🔐 Keamanan

### Ganti Password Default

**PENTING**: Ganti password default sebelum digunakan!

1. Buka Vercel Dashboard → Project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_APP_PASSWORD`
3. Masukkan password baru yang kuat
4. Klik **"Save"**
5. Redeploy aplikasi

### Tips Keamanan:
- ✅ Gunakan password yang kuat (min 12 karakter)
- ✅ Jangan share password di grup chat
- ✅ Ganti password secara berkala
- ✅ Bucket storage harus **private** (bukan public)
- ✅ Aktifkan 2FA di akun Supabase & Vercel

## 🐛 Troubleshooting

### Error: "Failed to upload file"
**Solusi**: 
- Cek storage policies sudah benar
- Pastikan file < 10MB
- Cek format file (hanya PDF, JPG, PNG)

### Error: "Authentication required"
**Solusi**:
- Cek environment variables sudah benar
- Pastikan Supabase URL & anon key valid
- Coba clear localStorage browser

### PWA tidak bisa di-install
**Solusi**:
- Pastikan menggunakan HTTPS (Vercel auto HTTPS)
- Cek file `manifest.json` ada di `/public`
- Cek icon 192x192 dan 512x512 ada
- Buka di Chrome/Safari (bukan browser lain)

### File tidak muncul setelah upload
**Solusi**:
- Refresh halaman
- Cek di Supabase Storage → bucket → folder
- Pastikan tidak ada error di browser console

## 📊 Monitoring

### Cek Usage Supabase:
1. Buka Supabase Dashboard
2. Menu **Settings** → **Usage**
3. Monitor storage usage (free tier: 1GB)

### Cek Deployment Vercel:
1. Buka Vercel Dashboard
2. Pilih project
3. Tab **Analytics** untuk melihat traffic
4. Tab **Logs** untuk debugging

## 🔄 Update Aplikasi

Untuk update fitur atau fix bug:

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make changes
# Edit files...

# 3. Test locally
npm run dev

# 4. Commit & push
git add .
git commit -m "Update: deskripsi perubahan"
git push

# 5. Vercel auto-deploy! ✨
```

## 💰 Biaya

### Supabase Free Tier:
- ✅ 500MB database (tidak dipakai)
- ✅ 1GB storage (cukup untuk ~100-200 file)
- ✅ 50GB bandwidth/bulan
- ✅ Unlimited API requests

### Vercel Free Tier:
- ✅ 100GB bandwidth/bulan
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domain (opsional)

**Total biaya: Rp 0 / bulan** 🎉

## 🆘 Bantuan

Jika ada masalah:
1. Cek dokumentasi di `README.md`
2. Lihat error di browser console (F12)
3. Cek logs di Vercel Dashboard
4. Hubungi developer

---

**Selamat menggunakan Malaysia Trip Manager!** 🇲🇾✈️
