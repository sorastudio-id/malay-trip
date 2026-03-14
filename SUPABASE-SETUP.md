# 🔧 Setup Supabase untuk Malaysia Trip App

## 1️⃣ Buat Project Supabase

1. Buka [https://supabase.com](https://supabase.com)
2. Login atau Sign Up
3. Klik **"New Project"**
4. Isi form:
   - **Name**: `malay-trip`
   - **Database Password**: Buat password kuat (simpan!)
   - **Region**: Singapore (Southeast Asia)
5. Klik **"Create new project"**
6. Tunggu ~2 menit sampai project ready

## 2️⃣ Aktifkan Anonymous Sign-In

**PENTING**: Aplikasi ini menggunakan anonymous authentication untuk akses storage.

1. Di dashboard Supabase, buka menu **Authentication** (sidebar kiri)
2. Klik tab **"Providers"**
3. Scroll ke bawah, cari **"Anonymous"**
4. Toggle **"Enable anonymous sign-ins"** → **ON** ✅
5. Klik **"Save"**

## 3️⃣ Buat Storage Bucket

1. Buka menu **Storage** di sidebar
2. Klik **"Create a new bucket"**
3. Isi form:
   - **Name**: `trip-documents`
   - **Public bucket**: **OFF** (harus private!) ❌
   - **File size limit**: 10 MB (opsional)
4. Klik **"Create bucket"**

## 4️⃣ Setup Storage Policies

Bucket yang baru dibuat masih kosong dan tidak ada akses. Kita perlu buat 3 policies:

### Policy 1: Allow Read (SELECT)

1. Buka bucket `trip-documents`
2. Klik tab **"Policies"**
3. Klik **"New Policy"**
4. Pilih **"For full customization"** → **"Create policy"**
5. Isi form:
   - **Policy name**: `Allow authenticated read`
   - **Allowed operation**: **SELECT** (centang)
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'trip-documents'
     ```
6. Klik **"Review"** → **"Save policy"**

### Policy 2: Allow Upload (INSERT)

1. Klik **"New Policy"** lagi
2. Pilih **"For full customization"** → **"Create policy"**
3. Isi form:
   - **Policy name**: `Allow authenticated upload`
   - **Allowed operation**: **INSERT** (centang)
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'trip-documents'
     ```
4. Klik **"Review"** → **"Save policy"**

### Policy 3: Allow Delete (DELETE)

1. Klik **"New Policy"** lagi
2. Pilih **"For full customization"** → **"Create policy"**
3. Isi form:
   - **Policy name**: `Allow authenticated delete`
   - **Allowed operation**: **DELETE** (centang)
   - **Target roles**: `authenticated`
   - **USING expression**:
     ```sql
     bucket_id = 'trip-documents'
     ```
4. Klik **"Review"** → **"Save policy"**

## 5️⃣ Dapatkan API Credentials

1. Buka **Settings** → **API** (di sidebar)
2. Copy informasi berikut:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: Key yang panjang (klik icon copy)

## 6️⃣ Update .env.local

Buka file `.env.local` di project dan update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yuumcxhvkujcsanptgdy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dW1jeGh2a3VqY3NhbnB0Z2R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NzA0NDUsImV4cCI6MjA4OTA0NjQ0NX0.MuQPR6Gwjg5Abi2vyT1g-mfBv9dJc331I4f8uG8Fyio
NEXT_PUBLIC_APP_PASSWORD=keranjangibu1
```

**Ganti dengan credentials dari project Supabase Anda!**

## 7️⃣ Test Upload

Setelah semua setup selesai, jalankan:

```bash
node upload-sample-files.js
```

Script ini akan upload 7 file sample ke Supabase Storage:
- ✈️ 4 Boarding Pass (Ahsan, Athaya, Lisza, Taufiq)
- 📋 1 Itinerary Receipt
- 🏠 1 Airbnb Reservation
- 🏨 1 Hotel Booking (Ihsan)

## ✅ Checklist Setup

- [ ] Project Supabase sudah dibuat
- [ ] Anonymous sign-in sudah diaktifkan
- [ ] Bucket `trip-documents` sudah dibuat (private)
- [ ] 3 storage policies sudah dibuat (SELECT, INSERT, DELETE)
- [ ] API credentials sudah di-copy
- [ ] File `.env.local` sudah diupdate
- [ ] Test upload berhasil

## 🐛 Troubleshooting

### Error: "Anonymous sign-ins are disabled"
**Solusi**: Aktifkan anonymous sign-in di Authentication → Providers → Anonymous

### Error: "new row violates row-level security policy"
**Solusi**: Pastikan 3 storage policies sudah dibuat dengan benar

### Error: "Bucket not found"
**Solusi**: Pastikan nama bucket adalah `trip-documents` (lowercase, dengan dash)

### Error: "Invalid API key"
**Solusi**: Copy ulang anon key dari Settings → API, pastikan tidak ada spasi

---

**Setelah setup selesai, refresh aplikasi di browser dan coba upload file!** 🚀
