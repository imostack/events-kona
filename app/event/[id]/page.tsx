"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { mockEvents } from "@/lib/mock-data"
import { formatPrice } from "@/lib/currency-utils"
import { Calendar, MapPin, ArrowLeft, Share2, Heart, Star } from "lucide-react"

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false)
  const event = mockEvents.find((e) => e.id === params.id)

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event not found</h1>
            <Link href="/">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90">
                Back to Home
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={20} />
                Back to Events
              </button>
            </Link>
          </div>
        </div>

        {/* Event Header */}
        <section className="bg-card border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex gap-2 mb-4 flex-wrap">
                  <div className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {event.category}
                  </div>
                  {event.promoted && (
                    <div className="inline-flex items-center gap-1 bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      Promoted
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground text-balance">{event.title}</h1>
                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {formatPrice(event.price, event.currency)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    isLiked ? "bg-accent text-accent-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setIsLiked(!isLiked)}
                >
                  <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  {isLiked ? "Liked" : "Like"}
                </button>
                <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Event Image */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        </section>

        {/* Event Details */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-foreground">About This Event</h2>
              <p className="text-foreground/80 leading-relaxed mb-8">{event.description}</p>

              <h3 className="text-xl font-bold mb-4 text-foreground">Event Details</h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Date:</strong> {event.date}
                </p>
                <p>
                  <strong>Time:</strong> {event.time}
                </p>
                <p>
                  <strong>Location:</strong> {event.location}
                </p>
                <p>
                  <strong>Category:</strong> {event.category}
                </p>
                <p>
                  <strong>Attendees:</strong> {event.attendees} people interested
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-card border border-border rounded-lg p-6 h-fit shadow-sm">
              <div className="mb-6">
                <p className="text-muted-foreground mb-2">Price per ticket</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(event.price, event.currency)}</p>
              </div>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3">
                {event.price === 0 ? "Register for Free" : "Get Tickets"}
              </button>
              <button className="w-full border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
                Add to Calendar
              </button>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-2">Organized by</p>
                <p className="font-semibold text-foreground">{event.organizer}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
