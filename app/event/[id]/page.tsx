"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"
import { apiClient, ApiError } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import type { ApiEvent } from "@/lib/types"
import { formatPrice } from "@/lib/currency-utils"
import { Calendar, MapPin, ArrowLeft, Share2, Heart, Star, UserPlus, UserCheck, ExternalLink, Users, Loader2, Clock, Video, CheckCircle, Ticket, Edit } from "lucide-react"
import CheckoutDialog from "@/components/checkout-dialog"

const MapDisplay = dynamic(() => import("@/components/map-display"), { ssr: false })

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { user, isAuthenticated } = useAuth()

  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  // Fetch event from API
  const fetchEvent = useCallback(async () => {
    if (!eventId) return

    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient<ApiEvent>(`/api/events/${eventId}`, {
        skipAuth: true,
      })
      setEvent(data)
      setLikesCount(data.likesCount || 0)
    } catch (err) {
      console.error("Failed to fetch event:", err)
      setError("Event not found")
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  // Check registration & follow status when user is authenticated
  useEffect(() => {
    if (!isAuthenticated || !eventId || !event) return

    // Check registration status
    const checkRegistration = async () => {
      try {
        const data = await apiClient<{ isRegistered: boolean }>(`/api/events/${eventId}/register`)
        setIsRegistered(data.isRegistered)
      } catch {
        // Not critical, just ignore
      }
    }

    // Check follow status
    const checkFollow = async () => {
      if (!event.organizer?.id) return
      try {
        const data = await apiClient<{ isFollowing: boolean }>(`/api/users/${event.organizer.id}/follow`)
        setIsFollowing(data.isFollowing)
      } catch {
        // Not critical
      }
    }

    // Check like status
    const checkLike = async () => {
      try {
        const data = await apiClient<{ liked: boolean }>(`/api/events/${eventId}/like`)
        setIsLiked(data.liked)
      } catch {
        // Not critical
      }
    }

    checkRegistration()
    checkFollow()
    checkLike()
  }, [isAuthenticated, eventId, event])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Error/not found state
  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event not found</h1>
            <p className="text-muted-foreground mb-6">The event you&apos;re looking for doesn&apos;t exist or has been removed.</p>
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

  // Helper functions for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getLocation = () => {
    if (event.eventFormat === "ONLINE") {
      return "Online Event"
    }
    return [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Location TBA"
  }

  const getOrganizerName = () => {
    return event.organizer?.organizerName || "Unknown Organizer"
  }

  const getOrganizerSlug = () => {
    return event.organizer?.organizerSlug || event.organizer?.id || "unknown"
  }

  const getPrice = () => {
    if (event.isFree) return 0
    return Number(event.minTicketPrice) || 0
  }

  // Check if the current user is the organizer of this event
  const isOwnEvent = isAuthenticated && user?.id === event.organizer?.id

  const handleGetTickets = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/event/${eventId}`)
      return
    }
    setCheckoutOpen(true)
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/event/${eventId}`)
      return
    }

    if (!event.organizer?.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await apiClient(`/api/users/${event.organizer.id}/follow`, { method: "DELETE" })
        setIsFollowing(false)
      } else {
        await apiClient(`/api/users/${event.organizer.id}/follow`, { method: "POST" })
        setIsFollowing(true)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // If already following/not following, just sync state
        if (err.message.includes("already following")) setIsFollowing(true)
        else if (err.message.includes("not following")) setIsFollowing(false)
        else alert(err.message)
      }
    } finally {
      setFollowLoading(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/event/${eventId}`)
      return
    }

    try {
      const data = await apiClient<{ liked: boolean }>(`/api/events/${eventId}/like`, { method: "POST" })
      setIsLiked(data.liked)
      setLikesCount(prev => data.liked ? prev + 1 : Math.max(0, prev - 1))
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.message)
      }
    }
  }

  const handleShare = () => {
    const eventUrl = window.location.href
    navigator.clipboard.writeText(eventUrl)
    alert("Event link copied to clipboard!")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
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
                  {event.category && (
                    <div className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                      {event.category.name}
                    </div>
                  )}
                  {event.eventFormat === "ONLINE" && (
                    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <Video size={14} />
                      Online
                    </div>
                  )}
                  {event.isFeatured && (
                    <div className="inline-flex items-center gap-1 bg-accent/20 text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                      <Star size={14} fill="currentColor" />
                      Featured
                    </div>
                  )}
                  {event.isCancelled && (
                    <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      Cancelled
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground text-balance">{event.title}</h1>
                <div className="flex flex-wrap gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  {event.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock size={20} />
                      <span>{event.startTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <span>{getLocation()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {formatPrice(getPrice(), event.currency as "NGN" | "GHS" | "KES")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {!isOwnEvent && (
                  <button
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isLiked ? "bg-red-50 text-red-600 border border-red-200" : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                    onClick={handleLike}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                    {isLiked ? "Interested" : "Like"}
                  </button>
                )}
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
            <div className="relative w-full h-96 rounded-lg overflow-hidden bg-muted">
              {event.coverImage ? (
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No image available
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-foreground">About This Event</h2>
              <div className="text-foreground/80 leading-relaxed mb-8 whitespace-pre-wrap">
                {event.description || event.shortDescription || "No description available."}
              </div>

              <h3 className="text-xl font-bold mb-4 text-foreground">Event Details</h3>
              <div className="space-y-3 text-foreground/80">
                <p>
                  <strong>Date:</strong> {formatDate(event.startDate)}
                  {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
                </p>
                {event.startTime && (
                  <p>
                    <strong>Time:</strong> {event.startTime}
                    {event.endTime && ` - ${event.endTime}`}
                  </p>
                )}
                <p>
                  <strong>Location:</strong> {getLocation()}
                </p>
                {event.address && (
                  <p>
                    <strong>Address:</strong> {event.address}
                  </p>
                )}
                {event.latitude && event.longitude && event.eventFormat !== "ONLINE" && (
                  <div className="mt-4">
                    <MapDisplay
                      latitude={event.latitude}
                      longitude={event.longitude}
                      venueName={event.venueName || undefined}
                      address={event.address || undefined}
                    />
                  </div>
                )}
                {event.eventFormat === "ONLINE" && event.platform && (
                  <p>
                    <strong>Platform:</strong> {event.platform}
                  </p>
                )}
                {event.category && (
                  <p>
                    <strong>Category:</strong> {event.category.name}
                  </p>
                )}
                {event.ageRestriction && event.ageRestriction !== "ALL_AGES" && (
                  <p>
                    <strong>Age Restriction:</strong> {event.ageRestriction.replace(/_/g, " ")}
                  </p>
                )}
                <p className="flex items-center gap-2">
                  <Users size={18} />
                  <strong>Views:</strong> {event.viewCount || 0}
                </p>
                {event.capacity && (
                  <p>
                    <strong>Capacity:</strong> {event.capacity} attendees
                  </p>
                )}
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-3 text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {(event.contactEmail || event.contactPhone) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-bold mb-3 text-foreground">Contact</h3>
                  <div className="space-y-2 text-foreground/80">
                    {event.contactEmail && <p><strong>Email:</strong> {event.contactEmail}</p>}
                    {event.contactPhone && <p><strong>Phone:</strong> {event.contactPhone}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Ticket Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="mb-6">
                  <p className="text-muted-foreground mb-2">
                    {event.isFree ? "Free Event" : "Starting from"}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(getPrice(), event.currency as "NGN" | "GHS" | "KES")}
                  </p>
                  {!event.isFree && event.maxTicketPrice && event.maxTicketPrice !== event.minTicketPrice && (
                    <p className="text-sm text-muted-foreground">
                      Up to {formatPrice(Number(event.maxTicketPrice), event.currency as "NGN" | "GHS" | "KES")}
                    </p>
                  )}
                </div>
                {event.isCancelled ? (
                  <button disabled className="w-full bg-muted text-muted-foreground py-3 rounded-lg font-semibold cursor-not-allowed mb-3">
                    Event Cancelled
                  </button>
                ) : isOwnEvent ? (
                  <Link href={`/create-event?edit=${event.id}`}>
                    <button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3 flex items-center justify-center gap-2">
                      <Edit size={20} />
                      Manage Event
                    </button>
                  </Link>
                ) : isRegistered ? (
                  <button disabled className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold cursor-default mb-3 flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    Registered
                  </button>
                ) : (
                  <button
                    onClick={handleGetTickets}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors mb-3 flex items-center justify-center gap-2"
                  >
                    <Ticket size={20} />
                    {event.isFree ? "Register for Free" : "Get Tickets"}
                  </button>
                )}
                <button className="w-full border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors">
                  Add to Calendar
                </button>

                {/* Ticket Types */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Available Tickets:</p>
                    <div className="space-y-2">
                      {event.ticketTypes.map((ticket) => (
                        <div key={ticket.id} className="flex justify-between text-sm">
                          <span>{ticket.name}</span>
                          <span className="font-semibold">
                            {formatPrice(Number(ticket.price), ticket.currency as "NGN" | "GHS" | "KES")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Organizer Card */}
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <p className="text-sm text-muted-foreground mb-3">Organized by</p>

                <div className="flex items-center gap-3 mb-4">
                  {event.organizer?.avatarUrl ? (
                    <Image
                      src={event.organizer.avatarUrl}
                      alt={getOrganizerName()}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                      {getOrganizerName().charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{getOrganizerName()}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer?.organizerVerified && "Verified "}Event Organizer
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isOwnEvent && (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`w-full py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                        isFollowing
                          ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : isFollowing ? (
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
                  )}

                  <Link href={`/organizer/${getOrganizerSlug()}`}>
                    <button className="w-full border border-border text-foreground py-2.5 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2">
                      <ExternalLink size={18} />
                      View Profile
                    </button>
                  </Link>
                </div>

                {!isOwnEvent && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Follow {getOrganizerName()} to get notified about their upcoming events and updates.
                    </p>
                  </div>
                )}
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

      {/* Sticky CTA Bar - visible on mobile, hidden for own events */}
      {!event.isCancelled && !isOwnEvent && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border px-4 py-3 z-50 md:hidden">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{event.title}</p>
              <p className="text-sm text-primary font-semibold">
                {event.isFree ? "Free" : formatPrice(getPrice(), event.currency as "NGN" | "GHS" | "KES")}
              </p>
            </div>
            {isRegistered ? (
              <button disabled className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shrink-0">
                <CheckCircle size={18} />
                Registered
              </button>
            ) : (
              <button
                onClick={handleGetTickets}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shrink-0"
              >
                <Ticket size={18} />
                {event.isFree ? "Register" : "Get Tickets"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      {event && (
        <CheckoutDialog
          event={event}
          open={checkoutOpen}
          onOpenChange={setCheckoutOpen}
          onSuccess={(orderId, isFree) => {
            setCheckoutOpen(false)
            setIsRegistered(true)
            router.push(`/orders/${orderId}`)
          }}
        />
      )}

      <Footer />
    </div>
  )
}
