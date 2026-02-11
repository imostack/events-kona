"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
  }
}

interface SearchBarProps {
  onSearch: (keyword: string, location: string, city?: string, country?: string) => void
  initialKeyword?: string
  initialLocation?: string
}

export default function SearchBar({ onSearch, initialKeyword = "", initialLocation = "" }: SearchBarProps) {
  const [keyword, setKeyword] = useState(initialKeyword)
  const [locationQuery, setLocationQuery] = useState(initialLocation)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const locationRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced Nominatim search
  useEffect(() => {
    if (locationQuery.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeout = setTimeout(async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoadingSuggestions(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationQuery)}&format=json&addressdetails=1&limit=5`,
          {
            headers: { "Accept": "application/json" },
            signal: controller.signal,
          }
        )
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setShowSuggestions(data.length > 0)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
        console.error("Nominatim search failed:", err)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 500)

    return () => clearTimeout(timeout)
  }, [locationQuery])

  const handleSelectSuggestion = (result: NominatimResult) => {
    const city = result.address?.city || result.address?.town || result.address?.village || ""
    const country = result.address?.country || ""
    const displayName = [city, result.address?.state, country].filter(Boolean).join(", ") || result.display_name.split(",").slice(0, 3).join(",")

    setLocationQuery(displayName)
    setSelectedCity(city)
    setSelectedCountry(country)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    setShowSuggestions(false)
    onSearch(keyword.trim(), locationQuery.trim(), selectedCity, selectedCountry)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-2 md:p-3 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Keyword Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 md:py-4 border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base rounded-xl"
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-gray-200 self-stretch my-2" />
        <div className="md:hidden h-px bg-gray-200 mx-3" />

        {/* Location Input */}
        <div className="flex-1 relative" ref={locationRef}>
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value)
              setSelectedCity("")
              setSelectedCountry("")
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="City or location..."
            className="w-full pl-10 pr-4 py-3 md:py-4 border-0 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-base rounded-xl"
          />
          {isLoadingSuggestions && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={18} />
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
              {suggestions.map((result) => {
                const city = result.address?.city || result.address?.town || result.address?.village || ""
                const parts = result.display_name.split(",").slice(0, 3).join(",").trim()
                return (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => handleSelectSuggestion(result)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100 last:border-0 transition-colors"
                  >
                    <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{city || parts}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[250px]">{result.display_name}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 md:py-4 rounded-xl font-semibold transition-colors flex items-center gap-2 justify-center mt-2 md:mt-0 md:ml-2"
        >
          <Search size={18} />
          <span className="md:hidden lg:inline">Search</span>
        </button>
      </div>
    </form>
  )
}
