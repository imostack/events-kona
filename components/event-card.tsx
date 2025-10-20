import Link from "next/link"
import { Calendar, MapPin, DollarSign, Users } from "lucide-react"

interface Event {
  id: string
  title: string
  date: string
  location: string
  price: number
  category: string
  image: string
  attendees: number
}

export default function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/event/${event.id}`}>
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-muted">
          <img
            src={event.image || "/placeholder.svg"}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            {event.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Details */}
          <div className="space-y-2 text-sm text-muted-foreground mb-4 flex-1">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span className="line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{event.attendees} interested</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-1">
              <DollarSign size={16} className="text-accent" />
              <span className="font-bold text-foreground">{event.price}</span>
            </div>
            <button className="bg-primary text-primary-foreground px-4 py-1 rounded text-sm font-semibold hover:bg-primary/90 transition-colors">
              View Details
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
