"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Loader2 } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    road?: string
    house_number?: string
    suburb?: string
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    postcode?: string
  }
  type: string
  class: string
}

interface VenueAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (venue: {
    name: string
    address: string
    city: string
    country: string
    latitude: number
    longitude: number
  }) => void
  country?: string
  placeholder?: string
  className?: string
}

const COUNTRY_CODES: Record<string, string> = {
  Nigeria: "ng",
  Ghana: "gh",
  Kenya: "ke",
}

export default function VenueAutocomplete({
  value,
  onChange,
  onSelect,
  country = "Nigeria",
  placeholder = "Search venue name or address...",
  className = "",
}: VenueAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchVenues = useCallback(
    async (query: string) => {
      if (query.length < 3) {
        setSuggestions([])
        setShowDropdown(false)
        return
      }

      // Cancel previous request
      if (abortRef.current) abortRef.current.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setIsSearching(true)
      try {
        const countryCode = COUNTRY_CODES[country] || "ng"
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
              q: query,
              format: "json",
              addressdetails: "1",
              limit: "6",
              countrycodes: countryCode,
            }).toString(),
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        )
        const data: NominatimResult[] = await res.json()
        if (!controller.signal.aborted) {
          setSuggestions(data)
          setShowDropdown(data.length > 0)
          setActiveIndex(-1)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        setSuggestions([])
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false)
        }
      }
    },
    [country]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchVenues(val), 400)
  }

  const handleSelect = (result: NominatimResult) => {
    const addr = result.address
    const city = addr.city || addr.town || addr.village || ""
    const resultCountry = addr.country || country

    // Build a clean street address from components
    const streetParts = [
      addr.house_number,
      addr.road,
      addr.suburb,
    ].filter(Boolean)
    const streetAddress = streetParts.length > 0 ? streetParts.join(", ") : ""

    // Use the first part of display_name as venue name if it looks like a place name
    const displayParts = result.display_name.split(", ")
    const venueName = displayParts[0] || value

    onChange(venueName)
    setShowDropdown(false)
    setSuggestions([])

    onSelect({
      name: venueName,
      address: streetAddress || displayParts.slice(0, 3).join(", "),
      city,
      country: resultCountry,
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(suggestions[activeIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  // Format display name for suggestion items
  const formatSuggestion = (result: NominatimResult) => {
    const parts = result.display_name.split(", ")
    const primary = parts[0]
    const secondary = parts.slice(1, 4).join(", ")
    return { primary, secondary }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true)
          }}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        />
        {isSearching && (
          <Loader2
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
          />
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((result, index) => {
            const { primary, secondary } = formatSuggestion(result)
            return (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                  index === activeIndex
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                } ${index > 0 ? "border-t border-border" : ""}`}
              >
                <MapPin
                  size={16}
                  className="text-primary flex-shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">
                    {primary}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {secondary}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
