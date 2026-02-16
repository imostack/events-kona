"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const ALLOWED_COUNTRIES = ["Nigeria", "Ghana", "Kenya"]

// Fix Leaflet default marker icon issue with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface MapPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number, address?: string, city?: string, country?: string) => void
  address?: string
}

// Inner component that handles map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Inner component that pans the map when position changes
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() < 10 ? 14 : map.getZoom())
  }, [map, lat, lng])
  return null
}

export default function MapPicker({ latitude, longitude, onLocationChange, address }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [latitude, longitude] : null
  )
  const [countryError, setCountryError] = useState("")
  const isGeocodingFromAddress = useRef(false)
  const lastGeocodedAddress = useRef("")
  const abortControllerRef = useRef<AbortController | null>(null)

  const defaultCenter: [number, number] = [9.0820, 8.6753] // Nigeria center
  const defaultZoom = 6

  // Reverse geocode: coordinates -> address
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        { headers: { "Accept": "application/json" } }
      )
      const data = await res.json()
      const addr = data.address || {}
      const city = addr.city || addr.town || addr.village || addr.state || ""
      const country = addr.country || ""
      const displayName = data.display_name || ""
      return { address: displayName, city, country }
    } catch {
      return null
    }
  }, [])

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setCountryError("")
    const result = await reverseGeocode(lat, lng)
    if (result) {
      if (!ALLOWED_COUNTRIES.includes(result.country)) {
        setCountryError(`Events can only be created in Nigeria, Ghana, or Kenya. You selected a location in ${result.country || "an unsupported country"}.`)
        return
      }
      setPosition([lat, lng])
      onLocationChange(lat, lng, result.address, result.city, result.country)
    } else {
      setPosition([lat, lng])
      onLocationChange(lat, lng)
    }
  }, [reverseGeocode, onLocationChange])

  // Forward geocode: address -> coordinates (debounced, triggered by address prop changes)
  useEffect(() => {
    if (!address || address.length < 5 || address === lastGeocodedAddress.current) return

    const timeout = setTimeout(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
          { headers: { "Accept": "application/json" }, signal: controller.signal }
        )
        const data = await res.json()
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat)
          const lng = parseFloat(data[0].lon)
          isGeocodingFromAddress.current = true
          lastGeocodedAddress.current = address
          setPosition([lat, lng])
          // Only send coordinates back, don't update address fields (would cause loop)
          onLocationChange(lat, lng)
          setTimeout(() => { isGeocodingFromAddress.current = false }, 500)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return
      }
    }, 800)

    return () => clearTimeout(timeout)
  }, [address, onLocationChange])

  // Sync external lat/lng changes
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude])
    }
  }, [latitude, longitude])

  return (
    <div className="space-y-2">
      <div className="h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 14 : defaultZoom}
          className="h-full w-full"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {position && (
            <>
              <MapUpdater lat={position[0]} lng={position[1]} />
              <Marker position={position}>
                <Popup>Event location</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
      {countryError ? (
        <p className="text-xs text-red-600 font-medium">{countryError}</p>
      ) : (
        <p className="text-xs text-gray-500">Click on the map to pin your event location (Nigeria, Ghana, or Kenya only)</p>
      )}
    </div>
  )
}
