"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ExternalLink } from "lucide-react"

// Fix Leaflet default marker icon issue with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface MapDisplayProps {
  latitude: number
  longitude: number
  venueName?: string
  address?: string
  className?: string
}

export default function MapDisplay({ latitude, longitude, venueName, address, className }: MapDisplayProps) {
  return (
    <div className={className}>
      <div className="h-48 md:h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
        <MapContainer
          center={[latitude, longitude]}
          zoom={15}
          className="h-full w-full"
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[latitude, longitude]}>
            <Popup>
              <div className="text-sm">
                {venueName && <div className="font-semibold">{venueName}</div>}
                {address && <div className="text-gray-600">{address}</div>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-3 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-colors"
      >
        <ExternalLink size={16} />
        Open in Google Maps
      </a>
    </div>
  )
}
