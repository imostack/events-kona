export type Currency = "NGN" | "GHS" | "KES" | "₦" | "₵" | "KSh"

export const countryToCurrency: Record<string, Currency> = {
  Nigeria: "NGN",
  Ghana: "GHS",
  Kenya: "KES",
}

export const formatPrice = (price: number | string, currency: Currency): string => {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price

  if (isNaN(numericPrice) || numericPrice === 0) {
    return "Free"
  }

  const symbols: Record<string, string> = {
    NGN: "₦",
    GHS: "₵",
    KES: "KSh",
    "₦": "₦",
    "₵": "₵",
    KSh: "KSh",
  }

  const symbol = symbols[currency] || currency

  return `${symbol} ${numericPrice.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
