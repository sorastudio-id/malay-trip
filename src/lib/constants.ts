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
    theme: 'Tiba di Kuala Lumpur',
    description: 'Perjalanan dari Pekanbaru menuju Kuala Lumpur dan check-in apartemen.',
    items: [
      { timeLabel: '14:30 WIB', timeValue: '14:30', timezone: 'WIB', emoji: '✈️', title: 'Check-in Bandara PKU', description: 'Persiapan keberangkatan menuju Kuala Lumpur.' },
      { timeLabel: '16:00 WIB', timeValue: '16:00', timezone: 'WIB', emoji: '✈️', title: 'Take off PKU → KUL (AK-428)', description: 'Penerbangan AirAsia menuju Kuala Lumpur.' },
      { timeLabel: '17:50 MYT', timeValue: '17:50', timezone: 'MYT', emoji: '🛂', title: 'Mendarat KLIA2 & Imigrasi', description: 'Proses imigrasi & bagasi di KLIA2.' },
      { timeLabel: '18:45 MYT', timeValue: '18:45', timezone: 'MYT', emoji: '🚆', title: 'KLIA Ekspres ke KL Sentral', description: 'Perjalanan cepat ke pusat kota.', priceTag: 'RM 55/org', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=KLIA+Ekspres+KL+Sentral' },
      { timeLabel: '19:50 MYT', timeValue: '19:50', timezone: 'MYT', emoji: '🏠', title: 'Check-in Airbnb via Lockbox', description: 'Masuk apartemen Liv’in @ PWTC.' },
      { timeLabel: '20:30 MYT', timeValue: '20:30', timezone: 'MYT', emoji: '🍜', title: 'Makan malam Sunway Putra Mall', description: 'Kuliner malam pertama di KL.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Sunway+Putra+Mall+Kuala+Lumpur' }
    ]
  },
  {
    id: 2,
    date: '2026-03-17',
    label: 'Selasa, 17 Maret',
    theme: 'KLCC & Ikonik KL',
    description: 'Jelajah ikon utama Kuala Lumpur sepanjang hari.',
    items: [
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🍜', title: 'Sarapan roti canai sekitar apartemen', description: 'Roti canai & teh tarik.', priceTag: 'RM 4-8' },
      { timeLabel: '09:00', timeValue: '09:00', emoji: '🚇', title: 'LRT PWTC → KLCC', description: 'Menuju kawasan KLCC.', priceTag: 'RM 2-3' },
      { timeLabel: '09:30', timeValue: '09:30', emoji: '📸', title: 'Foto Petronas Towers & KLCC Park', description: 'Waktu bebas hunting foto.', priceTag: 'Gratis', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Petronas+Towers+KLCC+Park+Kuala+Lumpur' },
      { timeLabel: '12:00', timeValue: '12:00', emoji: '🍜', title: 'Makan siang Suria KLCC', description: 'Food court & restoran.', priceTag: 'RM 15-25' },
      { timeLabel: '13:30', timeValue: '13:30', emoji: '🌳', title: 'Taman KLCC & Fountain Show', description: 'Bersantai di taman kota.', priceTag: 'Gratis' },
      { timeLabel: '15:00', timeValue: '15:00', emoji: '🗼', title: 'KL Tower via Klook', description: 'Naik observation deck KL Tower.', priceTag: 'RM 45-65', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=KL+Tower+Observation+Deck+Kuala+Lumpur' },
      { timeLabel: '17:30', timeValue: '17:30', emoji: '📸', title: 'Golden Hour Petronas', description: 'Foto matahari terbenam di depan Menara Petronas.', priceTag: 'Gratis' },
      { timeLabel: '19:00', timeValue: '19:00', emoji: '🍜', title: 'Makan malam Kampung Baru', description: 'Kuliner khas Melayu.', priceTag: 'RM 10-20', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kampung+Baru+food+Kuala+Lumpur' }
    ]
  },
  {
    id: 3,
    date: '2026-03-18',
    label: 'Rabu, 18 Maret',
    theme: 'Batu Caves & Bukit Bintang',
    description: 'Wisata religi dan area belanja populer.',
    items: [
      { timeLabel: '07:30', timeValue: '07:30', emoji: '🍜', title: 'Sarapan & bersiap (baju sopan!)', description: 'Persiapan sebelum ke Batu Caves.' },
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🚆', title: 'LRT + KTM ke Batu Caves', description: 'Perjalanan transport umum.', priceTag: 'RM 2.60' },
      { timeLabel: '09:00', timeValue: '09:00', emoji: '🛕', title: 'Batu Caves — 272 anak tangga', description: 'Eksplorasi kuil India iconic.', priceTag: 'Gratis', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Batu+Caves+Temple+Kuala+Lumpur' },
      { timeLabel: '12:00', timeValue: '12:00', emoji: '🍜', title: 'Makan siang Chow Kit Market', description: 'Kuliner lokal.', priceTag: 'RM 8-15' },
      { timeLabel: '15:00', timeValue: '15:00', emoji: '🏠', title: 'Istirahat di apartemen', description: 'Waktu recharge.' },
      { timeLabel: '16:30', timeValue: '16:30', emoji: '🛍️', title: 'Pavilion KL — Bukit Bintang', description: 'Shopping & window shopping.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pavilion+Kuala+Lumpur+Bukit+Bintang' },
      { timeLabel: '19:00', timeValue: '19:00', emoji: '🍜', title: 'Makan malam Jalan Alor', description: 'Street food terkenal.', priceTag: 'RM 15-30', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jalan+Alor+Street+Food+Kuala+Lumpur' }
    ]
  },
  {
    id: 4,
    date: '2026-03-19',
    label: 'Kamis, 19 Maret',
    theme: 'Putrajaya & Petaling Street',
    description: 'Eksplorasi arsitektur dan pasar budaya.',
    items: [
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🍜', title: 'Sarapan di apartemen', description: 'Sarapan ringan sebelum jalan.' },
      { timeLabel: '08:45', timeValue: '08:45', emoji: '🚇', title: 'LRT + MRT ke Putrajaya', description: 'Transit menuju Putrajaya.', priceTag: 'RM 5-8' },
      { timeLabel: '09:45', timeValue: '09:45', emoji: '🕌', title: 'Masjid Putra (Pink Mosque)', description: 'Ikon kota Putrajaya.', priceTag: 'Gratis', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Masjid+Putra+Putrajaya' },
      { timeLabel: '11:00', timeValue: '11:00', emoji: '📸', title: 'Jambatan Putra & Dataran Putra', description: 'Foto di area landmark.', priceTag: 'Gratis' },
      { timeLabel: '14:00', timeValue: '14:00', emoji: '🛍️', title: 'Central Market (Pasar Seni)', description: 'Belanja kerajinan lokal.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Central+Market+Pasar+Seni+Kuala+Lumpur' },
      { timeLabel: '16:00', timeValue: '16:00', emoji: '🛍️', title: 'Petaling Street — Chinatown', description: 'Berburu suvenir.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Petaling+Street+Chinatown+Kuala+Lumpur' },
      { timeLabel: '19:00', timeValue: '19:00', emoji: '🍜', title: 'Makan malam Petaling Street', description: 'Kuliner malam khas Tiongkok.', priceTag: 'RM 10-20' }
    ]
  },
  {
    id: 5,
    date: '2026-03-20',
    label: 'Jumat, 20 Maret',
    theme: 'Genting Highlands',
    description: 'Petualangan pegunungan dan taman hiburan.',
    items: [
      { timeLabel: '07:30', timeValue: '07:30', emoji: '🍜', title: 'Sarapan & siapkan jaket!', description: 'Cuaca Genting lebih dingin.' },
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🚌', title: 'Bus ke Genting dari Hentian Putra', description: 'Transport menuju Genting.', priceTag: 'RM 10-15' },
      { timeLabel: '09:15', timeValue: '09:15', emoji: '🚡', title: 'Gondola AwanaMURNI', description: 'Naik cable car Awana.', priceTag: 'RM 45 PP', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Awana+Skyway+Genting+Highlands' },
      { timeLabel: '09:30', timeValue: '09:30', emoji: '🎡', title: 'Resorts World Genting', description: 'Eksplor mall & atraksi indoor.' },
      { timeLabel: '13:00', timeValue: '13:00', emoji: '🎢', title: 'Genting SkyWorlds Theme Park', description: 'Seharian bermain wahana.', priceTag: 'RM 130 Klook' },
      { timeLabel: '16:00', timeValue: '16:00', emoji: '🚌', title: 'Turun & bus balik ke KL', description: 'Perjalanan kembali.' },
      { timeLabel: '19:00', timeValue: '19:00', emoji: '🍜', title: 'Makan malam sekitar PWTC', description: 'Santai setelah perjalanan panjang.' }
    ]
  },
  {
    id: 6,
    date: '2026-03-21',
    label: 'Sabtu, 21 Maret',
    theme: 'Belanja & Packing',
    description: 'Hari santai untuk belanja dan persiapan koper.',
    items: [
      { timeLabel: '08:30', timeValue: '08:30', emoji: '🍜', title: 'Sarapan santai', description: 'Nikmati pagi di apartemen.' },
      { timeLabel: '09:30', timeValue: '09:30', emoji: '🛍️', title: 'Berjaya Times Square', description: 'Belanja fashion & main arcade.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Berjaya+Times+Square+Kuala+Lumpur' },
      { timeLabel: '13:30', timeValue: '13:30', emoji: '🛒', title: 'Aeon/Mydin — oleh-oleh', description: 'Belanja snack & hadiah.' },
      { timeLabel: '16:00', timeValue: '16:00', emoji: '🧳', title: 'Packing koper (max 7KG!)', description: 'Pastikan semua dokumen aman.' },
      { timeLabel: '18:00', timeValue: '18:00', emoji: '🍜', title: 'Makan malam spesial terakhir di KL', description: 'Rayakan malam terakhir di KL.' },
      { timeLabel: '20:00', timeValue: '20:00', emoji: '📋', title: 'Cek semua dokumen', description: 'Pastikan dokumen perjalanan lengkap.' }
    ]
  },
  {
    id: 7,
    date: '2026-03-22',
    label: 'Minggu, 22 Maret',
    theme: 'KL → Melaka',
    description: 'Perjalanan darat menuju Melaka dan eksplorasi kota tua.',
    items: [
      { timeLabel: '07:30', timeValue: '07:30', emoji: '🍜', title: 'Sarapan & kemas koper', description: 'Persiapan pindah kota.' },
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🏠', title: 'Check-out Airbnb KL', description: 'Tinggalkan kunci lockbox.' },
      { timeLabel: '08:15', timeValue: '08:15', emoji: '🚇', title: 'LRT ke TBS', description: 'Menuju terminal bus TBS.', priceTag: 'RM 3-4' },
      { timeLabel: '09:00', timeValue: '09:00', emoji: '🚌', title: 'Bus TBS → Melaka Sentral', description: 'Perjalanan ±2 jam.', priceTag: 'RM 15-20' },
      { timeLabel: '11:00', timeValue: '11:00', emoji: '🚗', title: 'Grab ke Hotel Hong', description: 'Transport ke pusat kota.', priceTag: 'RM 8-12' },
      { timeLabel: '14:00', timeValue: '14:00', emoji: '🏨', title: 'Check-in Hotel Hong', description: 'Istirahat singkat sebelum keluar.' },
      { timeLabel: '15:00', timeValue: '15:00', emoji: '🚶', title: 'Jonker Street & heritage walk', description: 'Jelajah kota tua Melaka.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jonker+Street+Melaka' },
      { timeLabel: '16:30', timeValue: '16:30', emoji: '🏰', title: "A Famosa & St. Paul's Hill", description: 'Sejarah Portugis.', priceTag: 'Gratis', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=A+Famosa+St+Pauls+Hill+Melaka' },
      { timeLabel: '18:00', timeValue: '18:00', emoji: '🗼', title: 'Menara Taming Sari', description: 'Menikmati sunset panoramik.', priceTag: 'RM 23' },
      { timeLabel: '19:00', timeValue: '19:00', emoji: '🍜', title: 'Makan malam Riverside Melaka', description: 'Kuliner di pinggir sungai.', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Melaka+Riverside+Restaurants' }
    ]
  },
  {
    id: 8,
    date: '2026-03-23',
    label: 'Senin, 23 Maret',
    theme: 'Pulang ke Indonesia 🇮🇩',
    description: 'Perjalanan ferry kembali ke Indonesia melalui Dumai.',
    items: [
      { timeLabel: '08:00', timeValue: '08:00', emoji: '🍜', title: 'Sarapan terakhir di Malaysia', description: 'Nikmati sarapan di hotel.' },
      { timeLabel: '11:30', timeValue: '11:30', emoji: '🏨', title: 'Check-out Hotel Hong', description: 'Selesaikan pembayaran & serah kunci.' },
      { timeLabel: '11:45', timeValue: '11:45', emoji: '🚗', title: 'Grab ke Pelabuhan Shahab Perdana', description: 'Menuju terminal ferry.', priceTag: 'RM 8-12', mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Shahab+Perdana+Jetty+Melaka' },
      { timeLabel: '12:30', timeValue: '12:30', emoji: '⛴️', title: 'Check-in konter Indomal Ferry', description: 'Siapkan paspor & tiket.' },
      { timeLabel: '14:30 MYT', timeValue: '14:30', timezone: 'MYT', emoji: '⛴️', title: 'Ferry berangkat Melaka → Dumai', description: 'Perjalanan laut pulang.', },
      { timeLabel: '16:00 WIB', timeValue: '16:00', timezone: 'WIB', emoji: '🇮🇩', title: 'Tiba Dumai — Imigrasi Indonesia', description: 'Selesai perjalanan Malaysia Trip.' }
    ]
  }
]
