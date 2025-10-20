"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { mockEvents } from "@/lib/mock-data"
import { Calendar, MapPin, DollarSign, ArrowLeft, Share2, Heart } from "lucide-react"

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
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
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
          <div className="max-w-5xl mx-auto">
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
          <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8 items-start">
            {/* Left Info */}
            <div className="flex-1 space-y-4">
              <div className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                {event.category}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">{event.title}</h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground mt-2">
                <div className="flex items-center gap-2"><Calendar size={20} /> <span>{event.date}</span></div>
                <div className="flex items-center gap-2"><MapPin size={20} /> <span>{event.location}</span></div>
                <div className="flex items-center gap-2"><DollarSign size={20} /> <span>${event.price}</span></div>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
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
        </section>

        {/* Event Image */}
        <section className="px-4 py-8">
          <div className="max-w-5xl mx-auto">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-96 md:h-[28rem] object-cover rounded-lg shadow-md"
            />
          </div>
        </section>

        {/* Event Details */}
        <section className="px-4 py-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-foreground">About This Event</h2>
              <p className="text-foreground/80 leading-relaxed">{event.description}</p>

              <h3 className="text-xl font-bold text-foreground">Event Details</h3>
              <div className="space-y-2 text-foreground/80">
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Category:</strong> {event.category}</p>
                <p><strong>Attendees:</strong> {event.attendees} people interested</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4 h-fit shadow-sm">
              <div>
                <p className="text-muted-foreground mb-1">Price per ticket</p>
                <p className="text-3xl font-bold text-primary">${event.price}</p>
              </div>
              <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Get Tickets
              </button>
              <button className="w-full border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
                Add to Calendar
              </button>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground mb-1">Organized by</p>
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
