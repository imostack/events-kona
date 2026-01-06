"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { mockEvents } from "@/lib/mock-data"
import { formatPrice } from "@/lib/currency-utils"
import { Calendar, MapPin, ArrowLeft, Share2, Heart, Star, UserPlus, UserCheck, ExternalLink, Users } from "lucide-react"

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const [isLiked, setIsLiked] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
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

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    if (!isFollowing) {
      alert(`You are now following ${event.organizer}`)
    } else {
      alert(`You unfollowed ${event.organizer}`)
    }
  }

  const handleShare = () => {
    // Copy event link to clipboard
    const eventUrl = window.location.href
    navigator.clipboard.writeText(eventUrl)
    alert("Event link copied to clipboard!")
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
                <button 
                  onClick={handleShare}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
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
                <p className="flex items-center gap-2">
                  <Users size={18} />
                  <strong>Attendees:</strong> {event.attendees} people interested
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Ticket Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
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
              </div>

              {/* Organizer Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <p className="text-sm text-muted-foreground mb-3">Organized by</p>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                    {event.organizer.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{event.organizer}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleFollow}
                    className={`w-full py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isFollowing
                        ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck size={18} />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Follow
                      </>
                    )}
                  </button>

                  <Link href={`/organizer/${event.organizer.toLowerCase().replace(/\s+/g, "-")}`}>
                    <button className="w-full border border-border text-foreground py-2.5 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                      <ExternalLink size={18} />
                      View Profile
                    </button>
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Follow {event.organizer} to get notified about their upcoming events and updates.
                  </p>
                </div>
              </div>

              {/* Share Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground mb-3">Share this event</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </button>
                  <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}