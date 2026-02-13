// API Response Types

export interface ApiEvent {
  id: string
  title: string
  slug: string
  shortDescription?: string | null
  description?: string
  eventFormat: "IN_PERSON" | "ONLINE" | "HYBRID"
  venueName?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country: string
  latitude?: number | null
  longitude?: number | null
  onlineUrl?: string | null
  platform?: string | null
  startDate: string
  startTime?: string | null
  endDate?: string | null
  endTime?: string | null
  timezone?: string
  coverImage?: string | null
  images?: string[]
  isFree: boolean
  currency: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED"
  isPublished: boolean
  isCancelled: boolean
  isFeatured: boolean
  capacity?: number | null
  ticketsSold: number
  viewCount: number
  likesCount: number
  minTicketPrice?: number | null
  maxTicketPrice?: number | null
  ageRestriction?: string
  tags?: string[]
  contactEmail?: string | null
  contactPhone?: string | null
  createdAt?: string
  publishedAt?: string | null
  category?: {
    id: string
    name: string
    slug: string
    icon?: string | null
    color?: string | null
  } | null
  organizer?: {
    id: string
    organizerName?: string | null
    organizerSlug?: string | null
    avatarUrl?: string | null
    organizerVerified?: boolean
    organizerBio?: string | null
    organizerLogo?: string | null
    email?: string
  } | null
  ticketTypes?: ApiTicketType[]
  _count?: {
    likes?: number
    reviews?: number
    registrations?: number
  }
}

export interface ApiTicketType {
  id: string
  name: string
  description?: string | null
  type: "REGULAR" | "VIP" | "EARLY_BIRD" | "GROUP" | "STUDENT" | "MEMBER"
  price: number | string
  currency: string
  quantity: number
  quantitySold: number
  maxPerOrder: number
  minPerOrder: number
  salesStartDate?: string | null
  salesEndDate?: string | null
  isActive: boolean
  isHidden?: boolean
  available?: number
  status?: "available" | "sold_out" | "not_started" | "ended"
}

export interface ApiCategory {
  id: string
  name: string
  slug: string
  icon?: string | null
  color?: string | null
  description?: string | null
  eventCount: number
  sortOrder: number
}

export interface ApiOrder {
  id: string
  orderNumber: string
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED"
  totalAmount: number | string
  currency: string
  buyerName: string
  buyerEmail: string
  createdAt: string
  completedAt?: string | null
  event: {
    id: string
    title: string
    slug: string
    coverImage?: string | null
    startDate: string
    venueName?: string | null
    city?: string | null
  }
  _count?: {
    tickets: number
  }
}

export interface ApiTicket {
  id: string
  ticketNumber: string
  qrCode?: string | null
  status: "ACTIVE" | "USED" | "CANCELLED" | "REFUNDED" | "TRANSFERRED"
  checkedIn: boolean
  checkedInAt?: string | null
  attendeeName?: string | null
  attendeeEmail?: string | null
  createdAt: string
  ticketType: {
    id: string
    name: string
    type: string
    description?: string | null
  }
  event: {
    id: string
    title: string
    slug: string
    coverImage?: string | null
    startDate: string
    startTime?: string | null
    endDate?: string | null
    endTime?: string | null
    venueName?: string | null
    address?: string | null
    city?: string | null
    country: string
    eventFormat: string
    onlineUrl?: string | null
    isCancelled: boolean
    organizer?: {
      id: string
      organizerName?: string | null
      organizerSlug?: string | null
    }
  }
  order?: {
    id: string
    orderNumber: string
    status: string
  }
  eventStatus?: "upcoming" | "ongoing" | "past"
  isUsable?: boolean
}

export interface ApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  pagination?: ApiPagination
  error?: {
    message: string
    code?: string
    fields?: Record<string, string[]>
  }
}

// Helper to convert API event to legacy format for backward compatibility
export function apiEventToLegacy(event: ApiEvent) {
  return {
    id: event.id,
    title: event.title,
    description: event.shortDescription || event.description || "",
    date: new Date(event.startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: event.startTime || "",
    location: [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Online",
    price: event.isFree ? 0 : Number(event.minTicketPrice) || 0,
    currency: event.currency as "NGN" | "GHS" | "KES",
    country: event.country,
    category: event.category?.slug || "other",
    image: event.coverImage || "/placeholder.svg",
    attendees: event._count?.registrations ?? event.ticketsSold ?? 0,
    organizer: event.organizer?.organizerName || "Unknown Organizer",
    promoted: event.isFeatured,
  }
}
