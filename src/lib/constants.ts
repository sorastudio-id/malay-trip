export interface Member {
  id: string
  name: string
  slug: string
  color: string
  initials: string
}

export interface Folder {
  id: string
  name: string
  emoji: string
  slug: string
}

export const MEMBERS: Member[] = [
  {
    id: '1',
    name: 'Ihsan Eka Putra',
    slug: 'ihsan',
    color: 'bg-blue-500',
    initials: 'IE'
  },
  {
    id: '2',
    name: 'Lisza Herawati',
    slug: 'lisza',
    color: 'bg-pink-500',
    initials: 'LH'
  },
  {
    id: '3',
    name: 'Taufiqurrahman',
    slug: 'taufiq',
    color: 'bg-green-500',
    initials: 'TQ'
  },
  {
    id: '4',
    name: 'Ahsan Ramadan',
    slug: 'ahsan',
    color: 'bg-purple-500',
    initials: 'AR'
  },
  {
    id: '5',
    name: 'Athaya Rizqullah',
    slug: 'athaya',
    color: 'bg-orange-500',
    initials: 'AT'
  }
]

export const MEMBER_FOLDERS: Folder[] = [
  { id: '1', name: 'Paspor', emoji: '🛂', slug: 'paspor' },
  { id: '2', name: 'MDAC', emoji: '📋', slug: 'mdac' },
  { id: '3', name: 'Tiket Pesawat', emoji: '🎫', slug: 'tiket-pesawat' },
  { id: '4', name: 'Tiket Ferry', emoji: '⛴️', slug: 'tiket-ferry' },
  { id: '5', name: 'Voucher Hotel', emoji: '🏨', slug: 'voucher-hotel' },
  { id: '6', name: 'Tiket Wisata', emoji: '🎡', slug: 'tiket-wisata' },
  { id: '7', name: 'Lainnya', emoji: '📄', slug: 'lainnya' }
]

export const GROUP_FOLDERS: Folder[] = [
  { id: '1', name: 'Itinerary Trip', emoji: '📍', slug: 'itinerary' },
  { id: '2', name: 'Booking Airbnb', emoji: '🏠', slug: 'booking-airbnb' },
  { id: '3', name: 'Panduan Perjalanan', emoji: '🗺️', slug: 'panduan-perjalanan' },
  { id: '4', name: 'Info Keuangan', emoji: '💰', slug: 'info-keuangan' }
]

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
