export interface Member {
  id: string
  name: string
  slug: string
  color: string
  initials: string
  role: string
}

export interface Folder {
  id: string
  name: string
  emoji: string
  slug: string
  description?: string
  items?: string[]
}

export interface FolderSection {
  id: string
  title: string
  description: string
  folders: Folder[]
}

export interface EmergencyContact {
  id: string
  name: string
  emoji: string
  phone: string
  description: string
  priority: 'critical' | 'standard'
}

export interface ItineraryItem {
  timeLabel: string
  timeValue: string
  timezone?: 'WIB' | 'MYT'
  title: string
  emoji: string
  description: string
  priceTag?: string
  mapsUrl?: string
}

export interface ItineraryDay {
  id: number
  date: string
  label: string
  theme: string
  description: string
  items: ItineraryItem[]
}

export const MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Ihsan Eka Putra',
    slug: 'ihsan',
    color: 'bg-blue-500',
    initials: 'IE',
    role: 'Ketua Rombongan'
  },
  {
    id: '2',
    name: 'Lisza Herawati',
    slug: 'lisza',
    color: 'bg-pink-500',
    initials: 'LH',
    role: 'Anggota'
  },
  {
    id: '3',
    name: 'Taufiqurrahman',
    slug: 'taufiq',
    color: 'bg-green-500',
    initials: 'TQ',
    role: 'Anggota'
  },
  {
    id: '4',
    name: 'Ahsan Ramadan',
    slug: 'ahsan',
    color: 'bg-purple-500',
    initials: 'AR',
    role: 'Anggota'
  },
  {
    id: '5',
    name: 'Athaya Rizqullah',
    slug: 'athaya',
    color: 'bg-orange-500',
    initials: 'AT',
    role: 'Anggota'
  }
]

export const MEMBER_FOLDERS: Folder[] = [
  { id: '1', name: 'Paspor', emoji: '🛂', slug: 'paspor' },
  { id: '2', name: 'MDAC', emoji: '📋', slug: 'mdac' },
  { id: '3', name: 'Tiket Pesawat', emoji: '🎫', slug: 'tiket-pesawat' }
]

export const GROUP_FOLDERS: Folder[] = [
  {
    id: 'group-transport',
    name: '📁 Tiket & Transportasi',
    emoji: '📁',
    slug: 'tiket-transportasi',
    description: 'Semua tiket perjalanan udara, laut, dan darat',
    items: ['E-tiket AirAsia', 'Itinerary Ferry', 'Tiket Bus TBS → Melaka']
  },
  {
    id: 'group-accommodation',
    name: '🏨 Akomodasi',
    emoji: '🏨',
    slug: 'akomodasi',
    description: 'Konfirmasi Airbnb dan Voucher Hotel Hong',
    items: ['Konfirmasi Airbnb KL', 'Voucher Hotel Hong Triple', 'Voucher Hotel Hong Double']
  },
  {
    id: 'group-attraction',
    name: '🎡 Tiket Wisata',
    emoji: '🎡',
    slug: 'tiket-wisata',
    description: 'Semua tiket atraksi wisata',
    items: ['Tiket KL Tower', 'Tiket Genting SkyWorlds']
  },
  {
    id: 'group-guides',
    name: '📋 Dokumen Panduan',
    emoji: '📋',
    slug: 'dokumen-panduan',
    description: 'Dokumen referensi perjalanan',
    items: ['Malaysia Trip Plan PDF', 'Malaysia Checklist PDF']
  }
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: 'contact-malaysia-emergency',
    name: 'Darurat Malaysia',
    emoji: '🚨',
    phone: '999',
    description: 'Polisi / Ambulans / Pemadam',
    priority: 'critical'
  },
  {
    id: 'contact-kbri',
    name: 'KBRI Kuala Lumpur',
    emoji: '🇮🇩',
    phone: '+60 3-2116-4000',
    description: 'Paspor hilang, masalah WNI',
    priority: 'critical'
  },
  {
    id: 'contact-airbnb-host',
    name: "Host Airbnb KL — Dan (Liv'in)",
    emoji: '🏠',
    phone: '+6011 6189 1689',
    description: 'Masalah apartemen (darurat only)',
    priority: 'standard'
  },
  {
    id: 'contact-hotel-hong',
    name: 'Hotel Hong Melaka',
    emoji: '🏨',
    phone: '+60 10-666 5388',
    description: 'Konfirmasi check-in/out Melaka',
    priority: 'standard'
  },
  {
    id: 'contact-indomal-melaka',
    name: 'Indomal Ferry Melaka',
    emoji: '⛴️',
    phone: '+60 17-648 1280',
    description: 'Masalah tiket ferry',
    priority: 'standard'
  },
  {
    id: 'contact-indomal-dumai',
    name: 'Indomal Ferry Dumai',
    emoji: '⛴️',
    phone: '+62 853-7567-0000',
    description: 'Konfirmasi dari sisi Indonesia',
    priority: 'standard'
  },
  {
    id: 'contact-airasia',
    name: 'AirAsia',
    emoji: '✈️',
    phone: '1600-85-8888',
    description: 'Masalah penerbangan',
    priority: 'standard'
  },
  {
    id: 'contact-cimb',
    name: 'CIMB Niaga (kartu hilang)',
    emoji: '🏦',
    phone: '14041',
    description: 'Blokir kartu darurat',
    priority: 'standard'
  }
]

export const ITINERARY_DAYS: ItineraryDay[] = [
  {
    id: 1,
    date: '2026-03-16',
    label: 'Senin, 16 Maret',
    theme: 'Tiba di Kuala Lumpur ✈️',
    description: 'Hari keberangkatan Pekanbaru → Kuala Lumpur. Imsak 06:03 MYT dan estimasi buka puasa ~19:30 MYT, jadi siapkan takjil dari Pekanbaru.',
    items: [
      {
        timeLabel: '11:00 WIB',
        timeValue: '11:00',
        timezone: 'WIB',
        emoji: '👜',
        title: 'Checklist tas kabin',
        description: 'Pastikan paspor, boarding pass (GCY6HZ), MDAC, kurma/takjil, HP full, power bank, dan QRIS siap.'
      },
      { timeLabel: '12:00 WIB', timeValue: '12:00', timezone: 'WIB', emoji: '🕌', title: 'Sholat Dzuhur', description: 'Sholat berjamaah sebelum berangkat, selesai sekitar 12:30.' },
      { timeLabel: '12:30 WIB', timeValue: '12:30', timezone: 'WIB', emoji: '🚙', title: 'Berangkat ke Bandara PKU', description: 'Perjalanan ±40 menit menuju bandara.' },
      { timeLabel: '13:10 WIB', timeValue: '13:10', timezone: 'WIB', emoji: '🛂', title: 'Tiba & check-in PKU', description: 'Masuk counter, drop bagasi, imigrasi keberangkatan (1.5 jam sebelum cutoff).', },
      { timeLabel: '14:00 WIB', timeValue: '14:00', timezone: 'WIB', emoji: '⏳', title: 'Ruang tunggu & beli takjil', description: 'Ambil posisi dekat gate, beli kurma/takjil untuk buka di pesawat.' },
      { timeLabel: '15:20 WIB', timeValue: '15:20', timezone: 'WIB', emoji: '⚠️', title: 'Boarding Zone 3', description: 'Harus sudah di gate saat boarding dipanggil.' },
      { timeLabel: '16:00 WIB', timeValue: '16:00', timezone: 'WIB', emoji: '✈️', title: 'Take off AK-428', description: 'Pesawat berangkat ke Kuala Lumpur, set jam ke MYT (+1 jam).', },
      { timeLabel: '18:32 WIB', timeValue: '18:32', timezone: 'WIB', emoji: '🌙', title: 'Buka puasa di pesawat', description: 'Buka sederhana dengan kurma & snack bawaan.' },
      { timeLabel: '17:50 MYT', timeValue: '17:50', timezone: 'MYT', emoji: '🛬', title: 'Landing KLIA2', description: 'Sampai Malaysia, lanjut proses kedatangan.' },
      { timeLabel: '18:15 MYT', timeValue: '18:15', timezone: 'MYT', emoji: '🧾', title: 'Antri imigrasi Foreigner', description: 'Siapkan paspor + MDAC, estimasi 15–30 menit.' },
      { timeLabel: '18:45 MYT', timeValue: '18:45', timezone: 'MYT', emoji: '✅', title: 'Selesai imigrasi', description: 'Keluar area kedatangan dan susun ulang barang.' },
      { timeLabel: '19:00 MYT', timeValue: '19:00', timezone: 'MYT', emoji: '🍽️', title: 'Buka puasa proper di KLIA2', description: 'OldTown/Food court/Family Mart (semua halal) sebelum lanjut.' },
      { timeLabel: '19:20 MYT', timeValue: '19:20', timezone: 'MYT', emoji: '🕌', title: 'Sholat Maghrib', description: 'Gunakan musholla KLIA2, gantian jika penuh.' },
      { timeLabel: '19:35 MYT', timeValue: '19:35', timezone: 'MYT', emoji: '👥', title: 'Kumpul di Door 5', description: 'Semua berkumpul siap keluar terminal (jalan ±5 menit).' },
      { timeLabel: '19:40 MYT', timeValue: '19:40', timezone: 'MYT', emoji: '🚕', title: 'Pesan Grab ke Regalia', description: 'Door 5 KLIA2 → Regalia Residence @ Sultan Ismail, bayar QRIS, cukup 1 mobil (tas kecil).' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🏢', title: 'Tiba di Regalia Residence', description: 'Hubungi host Dan: “We’ve arrived at lobby!”.' },
      { timeLabel: '20:45 MYT', timeValue: '20:45', timezone: 'MYT', emoji: '🔐', title: 'Check-in via lockbox', description: 'Host kirim kode di hari H, nyalakan saklar AC utama sebelum pakai remote.' },
      { timeLabel: '21:30 MYT', timeValue: '21:30', timezone: 'MYT', emoji: '🍜', title: 'Makan malam ringan & istirahat', description: 'GrabFood atau jalan ke Sunway Putra Mall (5 menit).' },
      { timeLabel: '23:00 MYT', timeValue: '23:00', timezone: 'MYT', emoji: '😴', title: 'Tidur awal', description: 'Besok jadwal padat, jangan tidur larut.' }
    ]
  },
  {
    id: 2,
    date: '2026-03-17',
    label: 'Selasa, 17 Maret',
    theme: 'KLCC & KL Tower 🗼',
    description: 'Eksplor ikon utama KL (KLCC, KL Tower, Kampung Baru). Imsak 06:03 MYT, buka puasa 19:26 MYT.',
    items: [
      { timeLabel: '05:30 MYT', timeValue: '05:30', timezone: 'MYT', emoji: '🍽️', title: 'Sahur di apartemen', description: 'Masak sederhana atau beli di minimarket lantai 4.' },
      { timeLabel: '06:03 MYT', timeValue: '06:03', timezone: 'MYT', emoji: '🌙', title: 'Imsak', description: 'Mulai puasa hari kedua.' },
      { timeLabel: '06:30 MYT', timeValue: '06:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Subuh', description: 'Surau lantai 4 Regalia.' },
      { timeLabel: '07:30 MYT', timeValue: '07:30', timezone: 'MYT', emoji: '🛌', title: 'Istirahat/tidur lagi', description: 'Pulihkan energi setelah perjalanan.' },
      { timeLabel: '09:00 MYT', timeValue: '09:00', timezone: 'MYT', emoji: '🧴', title: 'Bangun & siap-siap', description: 'Pakai outfit nyaman & breathable.' },
      { timeLabel: '09:30 MYT', timeValue: '09:30', timezone: 'MYT', emoji: '💳', title: 'Beli Touch n Go', description: '7-Eleven lantai 4, isi saldo RM30–50/orang.' },
      { timeLabel: '09:45 MYT', timeValue: '09:45', timezone: 'MYT', emoji: '🚇', title: 'Berangkat ke KLCC', description: 'LRT PWTC → KLCC ±20 menit (RM 2–3).' },
      { timeLabel: '10:00 MYT', timeValue: '10:00', timezone: 'MYT', emoji: '📸', title: 'Foto di KLCC Park', description: 'Ambil foto ikonik Petronas & kolam refleksi, pagi lebih sejuk.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=KLCC+Park' },
      { timeLabel: '11:00 MYT', timeValue: '11:00', timezone: 'MYT', emoji: '🛍️', title: 'Masuk Suria KLCC', description: 'Window shopping & pendinginan di mall.' },
      { timeLabel: '12:30 MYT', timeValue: '12:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Dzuhur', description: 'Musholla Suria KLCC lantai 4.' },
      { timeLabel: '13:00 MYT', timeValue: '13:00', timezone: 'MYT', emoji: '🌳', title: 'Santai di Taman KLCC', description: 'Istirahat di tepi danau, fountain show gratis.' },
      { timeLabel: '14:30 MYT', timeValue: '14:30', timezone: 'MYT', emoji: '🚕', title: 'Grab ke KL Tower', description: 'Perjalanan 8 menit (RM 8–12). Tiket via Klook RM 45–65.' },
      { timeLabel: '15:30 MYT', timeValue: '15:30', timezone: 'MYT', emoji: '🗼', title: 'Turun dari KL Tower', description: 'Segera turun, biasanya mulai hujan sore.' },
      { timeLabel: '16:00 MYT', timeValue: '16:00', timezone: 'MYT', emoji: '🚕', title: 'Grab balik ke KLCC', description: 'Kembali ke area Petronas.' },
      { timeLabel: '17:00 MYT', timeValue: '17:00', timezone: 'MYT', emoji: '✨', title: 'Golden Hour Petronas', description: 'Langit oranye + Menara Petronas untuk foto terbaik.' },
      { timeLabel: '17:45 MYT', timeValue: '17:45', timezone: 'MYT', emoji: '🚕', title: 'Grab ke Kampung Baru', description: '±10 menit (RM 8–10).', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kampung+Baru+Bazaar' },
      { timeLabel: '19:26 MYT', timeValue: '19:26', timezone: 'MYT', emoji: '🌙', title: 'Buka puasa di Kampung Baru', description: 'Bubur lambuk, ayam percik, kurma — suasana bazar Ramadan.' },
      { timeLabel: '19:40 MYT', timeValue: '19:40', timezone: 'MYT', emoji: '🕌', title: 'Sholat Maghrib', description: 'Masjid Kampung Baru.' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🚇', title: 'Kembali ke apartemen', description: 'Pilihan LRT atau Grab tergantung tenaga.' },
      { timeLabel: '21:00 MYT', timeValue: '21:00', timezone: 'MYT', emoji: '😴', title: 'Istirahat', description: 'Siapkan stamina untuk Genting besok.' }
    ]
  },
  {
    id: 3,
    date: '2026-03-18',
    label: 'Rabu, 18 Maret',
    theme: 'Genting Highlands ⛰️',
    description: 'Road trip sejuk ke Genting SkyWorlds. Imsak 06:03 MYT, buka puasa 19:26 MYT.',
    items: [
      { timeLabel: '05:30 MYT', timeValue: '05:30', timezone: 'MYT', emoji: '🍽️', title: 'Sahur di apartemen', description: 'Menu simpel atau beli di minimarket lantai 4.' },
      { timeLabel: '06:03 MYT', timeValue: '06:03', timezone: 'MYT', emoji: '🌙', title: 'Imsak', description: 'Mulai puasa sebelum perjalanan panjang.' },
      { timeLabel: '06:30 MYT', timeValue: '06:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Subuh', description: 'Surau lantai 4.' },
      { timeLabel: '07:00 MYT', timeValue: '07:00', timezone: 'MYT', emoji: '🛌', title: 'Istirahat sebentar', description: 'Power nap sebelum berangkat.' },
      { timeLabel: '08:00 MYT', timeValue: '08:00', timezone: 'MYT', emoji: '🚌', title: 'Berangkat ke Genting', description: 'Grab ke Pudu Sentral (RM 10–15) lalu bus Genting Express (RM 11, ±1.5 jam).' },
      { timeLabel: '10:00 MYT', timeValue: '10:00', timezone: 'MYT', emoji: '🎢', title: 'Tiba Genting SkyWorlds', description: 'Redeem tiket Klook (RM 90–120), suhu ±18°C — pakai jaket!' },
      { timeLabel: '10:30 MYT', timeValue: '10:30', timezone: 'MYT', emoji: '🎡', title: 'Wahana & eksplor', description: 'Flying Coaster, SkyAvenue, wahana indoor sampai sore.' },
      { timeLabel: '12:30 MYT', timeValue: '12:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Dzuhur', description: 'Musholla tersedia di area Genting.' },
      { timeLabel: '15:00 MYT', timeValue: '15:00', timezone: 'MYT', emoji: '🚌', title: 'Turun ke KL', description: 'Bus Genting → Pudu Sentral (RM 11, ±1.5 jam).' },
      { timeLabel: '17:00 MYT', timeValue: '17:00', timezone: 'MYT', emoji: '🏢', title: 'Tiba kembali di apartemen', description: 'Istirahat sambil pendinginan tubuh.' },
      { timeLabel: '19:00 MYT', timeValue: '19:00', timezone: 'MYT', emoji: '🥢', title: 'Menuju Jalan Alor', description: 'Grab 5 menit dari apartemen.' },
      { timeLabel: '19:26 MYT', timeValue: '19:26', timezone: 'MYT', emoji: '🌙', title: 'Buka puasa Jalan Alor', description: 'Sate, ayam percik, cendol, air kelapa.' },
      { timeLabel: '19:45 MYT', timeValue: '19:45', timezone: 'MYT', emoji: '🕌', title: 'Sholat Maghrib', description: 'Masjid terdekat Bukit Bintang.' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🚶', title: 'Jalan malam Jalan Alor', description: 'Nikmati suasana street food yang meriah.' },
      { timeLabel: '21:30 MYT', timeValue: '21:30', timezone: 'MYT', emoji: '🚕', title: 'Kembali ke apartemen', description: 'Grab pulang, rehatkan kaki.' },
      { timeLabel: '22:00 MYT', timeValue: '22:00', timezone: 'MYT', emoji: '😴', title: 'Tidur', description: 'Persiapkan energi untuk Putrajaya besok.' }
    ]
  },
  {
    id: 4,
    date: '2026-03-19',
    label: 'Kamis, 19 Maret',
    theme: 'Putrajaya & Petaling Street 🕌',
    description: 'Kemungkinan hari terakhir puasa atau malam takbiran. Imsak 06:03 MYT, buka 19:27 MYT.',
    items: [
      { timeLabel: '05:30 MYT', timeValue: '05:30', timezone: 'MYT', emoji: '🍽️', title: 'Sahur spesial', description: 'Sahur terakhir Ramadan? Masak menu favorit.' },
      { timeLabel: '06:03 MYT', timeValue: '06:03', timezone: 'MYT', emoji: '🌙', title: 'Imsak', description: 'Mulai puasa, lanjutkan persiapan.' },
      { timeLabel: '06:30 MYT', timeValue: '06:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Subuh', description: 'Surau lantai 4.' },
      { timeLabel: '07:30 MYT', timeValue: '07:30', timezone: 'MYT', emoji: '🛌', title: 'Istirahat pagi', description: 'Rehat sebelum perjalanan jauh.' },
      { timeLabel: '09:00 MYT', timeValue: '09:00', timezone: 'MYT', emoji: '🧴', title: 'Bangun & siap-siap', description: 'Kenakan pakaian sopan untuk masjid.' },
      { timeLabel: '09:30 MYT', timeValue: '09:30', timezone: 'MYT', emoji: '🚇', title: 'Menuju Putrajaya', description: 'LRT PWTC → KL Sentral → MRT Putrajaya Sentral (RM 5–8).' },
      { timeLabel: '10:30 MYT', timeValue: '10:30', timezone: 'MYT', emoji: '🚕', title: 'Grab ke Masjid Putra', description: '±10 menit (RM 8–12).' },
      { timeLabel: '11:00 MYT', timeValue: '11:00', timezone: 'MYT', emoji: '🕌', title: 'Masjid Putra & Tasik Putrajaya', description: 'Sewa jubah RM 3–5 bila perlu, nikmati pemandangan tasik.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Masjid+Putra' },
      { timeLabel: '12:00 MYT', timeValue: '12:00', timezone: 'MYT', emoji: '🌉', title: 'Jambatan & Dataran Putra', description: 'Jalan kaki sekitar landmark utama.' },
      { timeLabel: '12:30 MYT', timeValue: '12:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Dzuhur', description: 'Masjid Putra.' },
      { timeLabel: '13:00 MYT', timeValue: '13:00', timezone: 'MYT', emoji: '🌅', title: 'Santai di tepi danau', description: 'Cari spot teduh sambil foto-foto.' },
      { timeLabel: '14:00 MYT', timeValue: '14:00', timezone: 'MYT', emoji: '🚇', title: 'Kembali ke KL', description: 'MRT + LRT ±50 menit.' },
      { timeLabel: '15:00 MYT', timeValue: '15:00', timezone: 'MYT', emoji: '🛍️', title: 'Central Market (Pasar Seni)', description: 'Belanja batik & kerajinan, tawar 20–30%.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Central+Market+Kuala+Lumpur' },
      { timeLabel: '16:00 MYT', timeValue: '16:00', timezone: 'MYT', emoji: '🛍️', title: 'Petaling Street', description: 'Berburu suvenir, mulailah tawaran dari 50%.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Petaling+Street' },
      { timeLabel: '17:30 MYT', timeValue: '17:30', timezone: 'MYT', emoji: '🍽️', title: 'Cari lokasi buka puasa', description: 'Warung halal sekitar Petaling Street.' },
      { timeLabel: '19:27 MYT', timeValue: '19:27', timezone: 'MYT', emoji: '🌙', title: 'Buka puasa terakhir?', description: 'Nikmati suasana Ramadan terakhir atau jelang Lebaran.' },
      { timeLabel: '19:45 MYT', timeValue: '19:45', timezone: 'MYT', emoji: '🕌', title: 'Sholat Maghrib', description: 'Masjid terdekat Pasar Seni.' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🎉', title: 'Malam takbiran (jika ada)', description: 'Keliling area pusat kota untuk merasakan suasana Lebaran.' },
      { timeLabel: '21:30 MYT', timeValue: '21:30', timezone: 'MYT', emoji: '🚇', title: 'Kembali ke apartemen', description: 'LRT Pasar Seni → PWTC ±20 menit.' }
    ]
  },
  {
    id: 5,
    date: '2026-03-20',
    label: 'Jumat, 20 Maret',
    theme: 'Batu Caves & Bukit Bintang 🛕',
    description: 'Kemungkinan H+1 Lebaran, jadi bebas makan dari pagi. Manfaatkan suasana meriah KL.',
    items: [
      { timeLabel: '07:00 MYT', timeValue: '07:00', timezone: 'MYT', emoji: '🍽️', title: 'Bangun & sarapan Lebaran', description: 'Tidak puasa, nikmati sarapan favorit.' },
      { timeLabel: '07:30 MYT', timeValue: '07:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Subuh & (opsional) Sholat Ied', description: 'Cari masjid terdekat bila ada pelaksanaan.' },
      { timeLabel: '08:30 MYT', timeValue: '08:30', timezone: 'MYT', emoji: '🚇', title: 'Berangkat ke Batu Caves', description: 'LRT PWTC → KL Sentral, lanjut KTM → Batu Caves (RM 2.60).' },
      { timeLabel: '09:30 MYT', timeValue: '09:30', timezone: 'MYT', emoji: '🛕', title: 'Eksplor Batu Caves', description: 'Naik 272 anak tangga, gratis masuk, hati-hati monyet.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Batu+Caves' },
      { timeLabel: '10:30 MYT', timeValue: '10:30', timezone: 'MYT', emoji: '📸', title: 'Foto di tangga warna-warni', description: 'Ambil foto terbaik sebelum panas.' },
      { timeLabel: '11:00 MYT', timeValue: '11:00', timezone: 'MYT', emoji: '🚆', title: 'KTM balik ke KL Sentral', description: '±30 menit perjalanan.' },
      { timeLabel: '11:30 MYT', timeValue: '11:30', timezone: 'MYT', emoji: '🕌', title: 'Sholat Dzuhur', description: 'Masjid di area KL Sentral.' },
      { timeLabel: '12:00 MYT', timeValue: '12:00', timezone: 'MYT', emoji: '🍛', title: 'Makan siang Lebaran', description: 'Cari restoran autentik Malaysia.' },
      { timeLabel: '13:30 MYT', timeValue: '13:30', timezone: 'MYT', emoji: '🚕', title: 'Grab ke Bukit Bintang', description: 'RM 8–12, langsung ke pusat hiburan.' },
      { timeLabel: '14:00 MYT', timeValue: '14:00', timezone: 'MYT', emoji: '🛍️', title: 'Pavilion KL', description: 'Belanja & window shopping di mall premium.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pavilion+KL' },
      { timeLabel: '15:30 MYT', timeValue: '15:30', timezone: 'MYT', emoji: '🍢', title: 'Jalan Alor siang', description: 'Cicipi makanan yang belum sempat dicoba.' },
      { timeLabel: '17:00 MYT', timeValue: '17:00', timezone: 'MYT', emoji: '🎁', title: 'Beli oleh-oleh', description: 'Central Market/Petaling Street untuk stok terakhir.' },
      { timeLabel: '19:00 MYT', timeValue: '19:00', timezone: 'MYT', emoji: '🍽️', title: 'Makan malam sekitar KLCC/Bukit Bintang', description: 'Rayakan suasana Lebaran di pusat kota.' },
      { timeLabel: '20:00 MYT', timeValue: '20:00', timezone: 'MYT', emoji: '🏙️', title: 'Balik apartemen & packing ringan', description: 'Mulai rapikan barang.' },
      { timeLabel: '22:00 MYT', timeValue: '22:00', timezone: 'MYT', emoji: '😴', title: 'Tidur', description: 'Besok fokus belanja & packing akhir.' }
    ]
  },
  {
    id: 6,
    date: '2026-03-21',
    label: 'Sabtu, 21 Maret',
    theme: 'Belanja Terakhir & Persiapan 🛍️',
    description: 'Hari santai untuk belanja oleh-oleh, packing seluruh koper, dan cek dokumen bus-ferry.',
    items: [
      { timeLabel: '08:00 MYT', timeValue: '08:00', timezone: 'MYT', emoji: '🍽️', title: 'Bangun & sarapan', description: 'Gunakan dapur apartemen untuk hemat.' },
      { timeLabel: '09:00 MYT', timeValue: '09:00', timezone: 'MYT', emoji: '🛍️', title: 'Berjaya Times Square / Aeon', description: 'Belanja oleh-oleh terakhir & main sedikit.' },
      { timeLabel: '12:00 MYT', timeValue: '12:00', timezone: 'MYT', emoji: '🍛', title: 'Makan siang', description: 'Coba makanan yang belum sempat.' },
      { timeLabel: '13:00 MYT', timeValue: '13:00', timezone: 'MYT', emoji: '🏢', title: 'Kembali ke apartemen', description: 'Mulai packing semua koper/tas, cek setiap laci.' },
      { timeLabel: '15:00 MYT', timeValue: '15:00', timezone: 'MYT', emoji: '🛏️', title: 'Istirahat sebentar', description: 'Recharge sambil nonton/relaks.' },
      { timeLabel: '18:00 MYT', timeValue: '18:00', timezone: 'MYT', emoji: '🍲', title: 'Makan malam spesial terakhir di KL', description: 'Kumpul semua, pilih resto favorit.' },
      { timeLabel: '20:00 MYT', timeValue: '20:00', timezone: 'MYT', emoji: '📑', title: 'Cek dokumen perjalanan', description: 'Paspor, tiket bus TBS, voucher Hotel Hong, catat di Notes.' },
      { timeLabel: '22:00 MYT', timeValue: '22:00', timezone: 'MYT', emoji: '😴', title: 'Tidur', description: 'Besok pagi sudah pindah kota.' }
    ]
  },
  {
    id: 7,
    date: '2026-03-22',
    label: 'Minggu, 22 Maret',
    theme: 'KL → Melaka 🏛️',
    description: 'Hari pindah kota ke Melaka, check-in Hotel Hong, dan eksplor heritage walk.',
    items: [
      { timeLabel: '07:00 MYT', timeValue: '07:00', timezone: 'MYT', emoji: '🍽️', title: 'Bangun & sarapan', description: 'Sarapan ringan sebelum packing akhir.' },
      { timeLabel: '08:00 MYT', timeValue: '08:00', timezone: 'MYT', emoji: '🏠', title: 'Check-out Apartemen Regalia', description: 'Sebelum 12:00, kembalikan kunci ke lockbox & WA Dan “We’re checking out”.' },
      { timeLabel: '08:15 MYT', timeValue: '08:15', timezone: 'MYT', emoji: '🚇', title: 'LRT PWTC → Bandar Tasik Selatan', description: '±35 menit, ongkos RM 3–4.' },
      { timeLabel: '09:00 MYT', timeValue: '09:00', timezone: 'MYT', emoji: '🚌', title: 'Bus TBS → Melaka Sentral', description: 'Tiket easybook/loket RM 15–20, durasi ±2 jam.' },
      { timeLabel: '11:00 MYT', timeValue: '11:00', timezone: 'MYT', emoji: '🚗', title: 'Grab ke Hotel Hong', description: 'RM 8–12 ke Jonker Street.' },
      { timeLabel: '11:30 MYT', timeValue: '11:30', timezone: 'MYT', emoji: '🧳', title: 'Titip tas di Hotel Hong', description: 'Check-in resmi jam 14:00, jadi titip barang dulu.' },
      { timeLabel: '12:00 MYT', timeValue: '12:00', timezone: 'MYT', emoji: '🍜', title: 'Makan siang Jonker Street', description: 'Cari opsi halal di sekitar.*' },
      { timeLabel: '13:00 MYT', timeValue: '13:00', timezone: 'MYT', emoji: '🚶', title: 'Heritage walk Jonker Street', description: 'Eksplor kawasan gratis.' },
      { timeLabel: '14:00 MYT', timeValue: '14:00', timezone: 'MYT', emoji: '🏨', title: 'Check-in Hotel Hong', description: 'Triple 1336021316 + Double 1336023748. Siapkan cash RM 30 (tax).' },
      { timeLabel: '15:00 MYT', timeValue: '15:00', timezone: 'MYT', emoji: '🏛️', title: 'A Famosa & St. Paul’s Hill', description: 'Jalan kaki ±10 menit, gratis.' },
      { timeLabel: '16:30 MYT', timeValue: '16:30', timezone: 'MYT', emoji: '🏰', title: 'Stadthuys & Dutch Square', description: 'Foto merah ikonik.' },
      { timeLabel: '18:00 MYT', timeValue: '18:00', timezone: 'MYT', emoji: '🗼', title: 'Menara Taming Sari', description: 'RM 23/org, lebih murah via Klook.' },
      { timeLabel: '19:00 MYT', timeValue: '19:00', timezone: 'MYT', emoji: '🍽️', title: 'Makan malam Riverside Melaka', description: 'Cendol, sate celup, asam pedas, banyak yang terima QRIS.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Melaka+Riverfront' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🏨', title: 'Balik hotel & istirahat', description: 'Siap-siap perjalanan ferry besok.' },
      { timeLabel: '22:00 MYT', timeValue: '22:00', timezone: 'MYT', emoji: '😴', title: 'Tidur', description: 'Besok pagi cek out & menuju ferry.' }
    ]
  },
  {
    id: 8,
    date: '2026-03-23',
    label: 'Senin, 23 Maret',
    theme: 'Melaka → Dumai → Pekanbaru 🇮🇩',
    description: 'Hari terakhir perjalanan: ferry Indomal kembali ke Indonesia dan lanjut ke Pekanbaru.',
    items: [
      { timeLabel: '07:00 MYT', timeValue: '07:00', timezone: 'MYT', emoji: '🍜', title: 'Sarapan terakhir di Malaysia', description: 'Nikmati sarapan hotel sebelum jalan-jalan pagi.' },
      { timeLabel: '08:00 MYT', timeValue: '08:00', timezone: 'MYT', emoji: '📸', title: 'Jalan pagi Jonker Street', description: 'Foto suasana yang lebih sepi.' },
      { timeLabel: '09:30 MYT', timeValue: '09:30', timezone: 'MYT', emoji: '🎁', title: 'Belanja oleh-oleh Melaka', description: 'Cari souvenir atau snack menit akhir.' },
      { timeLabel: '11:00 MYT', timeValue: '11:00', timezone: 'MYT', emoji: '🏨', title: 'Check-out Hotel Hong', description: 'Pastikan tidak ada barang tertinggal.' },
      { timeLabel: '11:30 MYT', timeValue: '11:30', timezone: 'MYT', emoji: '🚗', title: 'Grab ke Pelabuhan Shahab Perdana', description: '±10 menit (RM 8–12).', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shahab+Perdana+Melaka' },
      { timeLabel: '12:00 MYT', timeValue: '12:00', timezone: 'MYT', emoji: '🛃', title: 'Tiba & check-in ferry', description: 'Konter Indomal (OBJM9URZ) buka 12:30, siapkan paspor & tiket.' },
      { timeLabel: '14:30 MYT', timeValue: '14:30', timezone: 'MYT', emoji: '⛴️', title: 'Ferry Melaka → Dumai', description: 'Berangkat tepat waktu, tiba sekitar 16:00 WIB.' },
      { timeLabel: '16:00 WIB', timeValue: '16:00', timezone: 'WIB', emoji: '🛂', title: 'Tiba Dumai & imigrasi', description: 'Proses kedatangan Indonesia, isi customs jika diminta.' },
      { timeLabel: '17:00 WIB', timeValue: '17:00', timezone: 'WIB', emoji: '✅', title: 'Keluar pelabuhan', description: 'Siap lanjut perjalanan darat.' },
      { timeLabel: '19:00 WIB', timeValue: '19:00', timezone: 'WIB', emoji: '🎉', title: 'Sampai Pekanbaru', description: 'Malaysia Trip resmi selesai! Simpan sisa Ringgit, tukar di Dumai/Pekanbaru.' },
      { timeLabel: 'Catatan', timeValue: '21:00', emoji: '☎️', title: 'Kontak Ferry Indomal', description: 'Melaka: +60 17-648 1280 | Dumai: +62 853-7567-0000 untuk bantuan.' }
    ]
  }
]
