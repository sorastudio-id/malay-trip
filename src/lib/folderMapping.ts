export const MEMBER_FOLDER_MAP = {
  PASSPORT: 'paspor',
  MDAC: 'mdac',
  FLIGHT_TICKET: 'tiket-pesawat',
  BOARDING_PASS: 'tiket-pesawat',
  FERRY_TICKET: 'tiket-ferry',
  HOTEL_VOUCHER: 'voucher-hotel',
  HOTEL_VOUCHER_DOUBLE: 'voucher-hotel',
  HOTEL_VOUCHER_TRIPLE: 'voucher-hotel',
  ATTRACTION_TICKET: 'tiket-wisata',
  OTHER: 'lainnya'
} as const

export const GROUP_FOLDER_MAP = {
  ITINERARY: 'itinerary',
  AIRBNB: 'booking-airbnb',
  TRAVEL_GUIDE: 'panduan-perjalanan',
  FINANCIAL: 'info-keuangan',
  OTHER: 'info-keuangan'
} as const

const ALLOWED_MEMBERS = ['IHSAN', 'LISZA', 'TAUFIQ', 'AHSAN', 'ATHAYA'] as const
const OWNER_SYNONYMS: Record<string, MemberName | 'GROUP'> = {
  'IHSAN EKA PUTRA': 'IHSAN',
  'TAUFIQURRAHMAN': 'TAUFIQ',
  'TAUFIQUR RAHMAN': 'TAUFIQ',
  GRUP: 'GROUP'
}
const GROUP_OWNER_SLUG = 'grup'

export type MemberName = (typeof ALLOWED_MEMBERS)[number]
export type DocumentTypeKey = keyof typeof MEMBER_FOLDER_MAP | keyof typeof GROUP_FOLDER_MAP

const MEMBER_KEYS = Object.keys(MEMBER_FOLDER_MAP) as Array<keyof typeof MEMBER_FOLDER_MAP>
const GROUP_KEYS = Object.keys(GROUP_FOLDER_MAP) as Array<keyof typeof GROUP_FOLDER_MAP>

export const ALL_DOCUMENT_TYPES: DocumentTypeKey[] = Array.from(
  new Set<DocumentTypeKey>([...MEMBER_KEYS, ...GROUP_KEYS] as DocumentTypeKey[])
)

const DOCUMENT_TYPE_SET = new Set<DocumentTypeKey>(ALL_DOCUMENT_TYPES)

const MEMBER_FALLBACK = MEMBER_FOLDER_MAP.OTHER
const GROUP_FALLBACK = GROUP_FOLDER_MAP.OTHER

export function normalizeOwnerName(owner?: string): MemberName | 'GROUP' | 'UNKNOWN' {
  if (!owner) return 'UNKNOWN'
  const upper = owner.trim().toUpperCase()
  if (!upper) return 'UNKNOWN'

  if (upper === 'GROUP' || upper === 'GRUP') return 'GROUP'

  const synonym = OWNER_SYNONYMS[upper]
  if (synonym) return synonym

  if ((ALLOWED_MEMBERS as readonly string[]).includes(upper)) {
    return upper as MemberName
  }

  return 'UNKNOWN'
}

export function normalizeOwnerSlug(owner?: string) {
  const normalized = normalizeOwnerName(owner)
  if (normalized === 'GROUP' || normalized === 'UNKNOWN') return GROUP_OWNER_SLUG
  return normalized.toLowerCase()
}

export function normalizeDocumentTypeKey(documentType?: string): DocumentTypeKey {
  const typeKey = (documentType || 'OTHER').toUpperCase() as DocumentTypeKey
  if (DOCUMENT_TYPE_SET.has(typeKey)) {
    return typeKey
  }
  return 'OTHER'
}

export function resolveFolderSlug(documentType?: string, owner?: string) {
  const typeKey = normalizeDocumentTypeKey(documentType)
  const normalizedOwner = normalizeOwnerName(owner)

  if (normalizedOwner === 'GROUP' || normalizedOwner === 'UNKNOWN') {
    return GROUP_FOLDER_MAP[typeKey as keyof typeof GROUP_FOLDER_MAP] ?? GROUP_FALLBACK
  }

  return MEMBER_FOLDER_MAP[typeKey as keyof typeof MEMBER_FOLDER_MAP] ?? MEMBER_FALLBACK
}

export function buildStoragePath(documentType?: string, owner?: string) {
  const ownerSlug = normalizeOwnerSlug(owner)
  const folderSlug = resolveFolderSlug(documentType, owner)
  return `${ownerSlug}/${folderSlug}/`
}
