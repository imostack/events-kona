"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EventCard from "@/components/event-card"
import type { mockEvents } from "@/lib/mock-data"
import { Plus, ArrowLeft, Calendar } from "lucide-react"

export default function MyEventsPage() {
  const [filter, setFilter] = useState("all")

  // Mock: user's created events - empty array to show empty state
  const userEvents: typeof mockEvents = []

  const filteredEvents = filter === "all" ? userEvents : userEvents.filter((e) => e.category === filter)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
          </div>
        </div>

        {/* Header */}
        <section className="bg-card border-b border-border px-4 py-8">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Events</h1>
              <p className="text-muted-foreground">Manage and view all your created events</p>
            </div>
            <Link href="/create-event">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Plus size={20} />
                Create New Event
              </button>
            </Link>
          </div>
        </section>

        {/* Filter */}
        <section className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-2 flex-wrap">
              {["all", "music", "sports", "tech", "art", "food"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                    filter === cat ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Events Grid or Empty State */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {userEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-muted rounded-full p-6 mb-6">
                  <Calendar size={48} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">No Events Yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  You haven't created any events yet. Start creating amazing events and share them with your audience.
                </p>
                <Link href="/create-event">
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus size={20} />
                    Create Your First Event
                  </button>
                </Link>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">No events found in this category</p>
                <Link href="/create-event">
                  <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90">
                    Create New Event
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
