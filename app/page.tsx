"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EventCard from "@/components/event-card"
import { Search, Plus } from "lucide-react"
import { mockEvents } from "@/lib/mock-data"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredEvents = mockEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.date.includes(searchQuery)
    const matchesType = filterType === "all" || event.category === filterType
    return matchesSearch && matchesType
  })

  const featuredEvents = mockEvents.slice(0, 3)
  const upcomingEvents = filteredEvents.slice(0, 6)

  const EventCard = ({ event }: { event: typeof mockEvents[0] }) => (
    <div className="bg-card rounded-lg shadow-md overflow-hidden flex flex-col">
      <img
        src={event.image}
        alt={event.title}
        className="w-full h-48 md:h-56 lg:h-64 object-cover"
      />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground">{event.title}</h3>
          <p className="text-sm text-muted-foreground">{event.location}</p>
          <p className="text-sm text-muted-foreground">{event.date}</p>
        </div>
        <Link href={`/events/${event.id}`}>
          <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/80 w-full transition-colors">
            View Event
          </button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing Events
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Find, create, and manage all kind of events
            </p>
            <Link href="/create-event">
              <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors">
                <Plus size={20} />
                Create Event
              </button>
            </Link>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-card border-b border-border py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search events by name, location, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Categories</option>
                <option value="music">Music</option>
                <option value="sports">Sports</option>
                <option value="tech">Tech</option>
                <option value="art">Art</option>
                <option value="food">Food</option>
              </select>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 px-4 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No events found matching your search.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
