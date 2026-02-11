// =====================
// Frontend → Database Enum Mapping
// =====================
// The frontend uses lowercase/hyphenated values.
// The database uses UPPER_CASE enum values.
// These maps handle the translation at the API boundary.

export const EVENT_FORMAT_MAP: Record<string, string> = {
  venue: "IN_PERSON",
  online: "ONLINE",
  hybrid: "HYBRID",
};

export const EVENT_FORMAT_REVERSE: Record<string, string> = {
  IN_PERSON: "venue",
  ONLINE: "online",
  HYBRID: "hybrid",
};

export const AGE_RESTRICTION_MAP: Record<string, string> = {
  "all-ages": "ALL_AGES",
  "family-friendly": "FAMILY_FRIENDLY",
  "18+": "EIGHTEEN_PLUS",
  "21+": "TWENTYONE_PLUS",
};

export const AGE_RESTRICTION_REVERSE: Record<string, string> = {
  ALL_AGES: "all-ages",
  FAMILY_FRIENDLY: "family-friendly",
  EIGHTEEN_PLUS: "18+",
  TWENTYONE_PLUS: "21+",
};

export const TICKET_TYPE_MAP: Record<string, string> = {
  regular: "REGULAR",
  vip: "VIP",
  "early-bird": "EARLY_BIRD",
  group: "GROUP",
  student: "STUDENT",
  member: "MEMBER",
  custom: "REGULAR", // custom maps to REGULAR in DB
};

export const TICKET_TYPE_REVERSE: Record<string, string> = {
  REGULAR: "regular",
  VIP: "vip",
  EARLY_BIRD: "early-bird",
  GROUP: "group",
  STUDENT: "student",
  MEMBER: "member",
};

export const REFUND_POLICY_MAP: Record<string, string> = {
  "non-refundable": "NON_REFUNDABLE",
  refundable: "REFUNDABLE",
  partial: "PARTIAL",
};

export const REFUND_POLICY_REVERSE: Record<string, string> = {
  NON_REFUNDABLE: "non-refundable",
  REFUNDABLE: "refundable",
  PARTIAL: "partial",
};

// =====================
// Generic mapper helper
// =====================

export function mapEnumToDb(
  map: Record<string, string>,
  value: string
): string {
  return map[value] || value;
}

export function mapEnumFromDb(
  reverseMap: Record<string, string>,
  value: string
): string {
  return reverseMap[value] || value;
}

// =====================
// Supported currencies
// =====================

export const SUPPORTED_CURRENCIES = ["NGN", "GHS", "KES", "USD", "EUR"];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "\u20A6",
  GHS: "GH\u20B5",
  KES: "KSh",
  USD: "$",
  EUR: "\u20AC",
};

// =====================
// Platform defaults
// =====================

export const PLATFORM_FEE_PERCENTAGE = 5.0;
export const MIN_PAYOUT_AMOUNT = 1000; // In default currency (NGN)
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// =====================
// Default categories (for seeding)
// =====================

export const DEFAULT_CATEGORIES = [
  { name: "Music", slug: "music", icon: "Music", color: "#8b5cf6" },
  { name: "Business", slug: "business", icon: "Briefcase", color: "#3b82f6" },
  { name: "Food & Drink", slug: "food", icon: "UtensilsCrossed", color: "#f97316" },
  { name: "Arts", slug: "arts", icon: "Palette", color: "#ec4899" },
  { name: "Sports", slug: "sports", icon: "Trophy", color: "#22c55e" },
  { name: "Technology", slug: "tech", icon: "Cpu", color: "#06b6d4" },
  { name: "Education", slug: "education", icon: "GraduationCap", color: "#f59e0b" },
  { name: "Religious", slug: "religious", icon: "Heart", color: "#f43f5e" },
];
