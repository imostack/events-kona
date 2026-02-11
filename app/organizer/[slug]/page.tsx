"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { apiClient, ApiError } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import type { ApiEvent } from "@/lib/types"
import { formatPrice } from "@/lib/currency-utils"
import {
  Calendar,
  MapPin,
  Users,
  Star,
  Globe,
  Mail,
  Twitter,
  Instagram,
  Linkedin,
  UserPlus,
  UserCheck,
  ArrowLeft,
  Clock,
  TrendingUp,
  Loader2,
  Heart
} from "lucide-react"

interface OrganizerProfile {
  id: string
  name: string
  slug: string
  bio: string
  avatar?: string
  verified: boolean
  totalEvents: number
  followersCount: number
  totalLikes: number
  events: ApiEvent[]
}

export default function OrganizerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  const { user, isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch organizer's events and profile from API
  const fetchOrganizerData = useCallback(async () => {
    if (!slug) return

    setLoading(true)
    setError(null)

    try {
      // Fetch events and organizer profile in parallel
      const [events, profile] = await Promise.all([
        apiClient<ApiEvent[]>(`/api/events?organizerSlug=${slug}`, { skipAuth: true }),
        apiClient<{
          id: string; name: string; slug: string; avatar: string | null;
          bio: string | null; verified: boolean; followersCount: number;
          eventsCount: number; totalLikes: number; totalAttendees: number;
        }>(`/api/organizers/${slug}`, { skipAuth: true }).catch(() => null),
      ])

      if (profile) {
        setOrganizer({
          id: profile.id,
          name: profile.name || slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
          slug: profile.slug || slug,
          bio: profile.bio || "",
          avatar: profile.avatar || undefined,
          verified: profile.verified || false,
          totalEvents: profile.eventsCount,
          followersCount: profile.followersCount,
          totalLikes: profile.totalLikes,
          events: events,
        })
      } else if (events.length > 0) {
        const firstEvent = events[0]
        const org = firstEvent.organizer
        setOrganizer({
          id: org?.id || slug,
          name: org?.organizerName || slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
          slug: org?.organizerSlug || slug,
          bio: "",
          avatar: org?.avatarUrl || undefined,
          verified: org?.organizerVerified || false,
          totalEvents: events.length,
          followersCount: 0,
          totalLikes: 0,
          events: events,
        })
      } else {
        setOrganizer({
          id: slug,
          name: slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
          slug: slug,
          bio: "",
          verified: false,
          totalEvents: 0,
          followersCount: 0,
          totalLikes: 0,
          events: [],
        })
      }
    } catch (err) {
      console.error("Failed to fetch organizer data:", err)
      setError("Organizer not found")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchOrganizerData()
  }, [fetchOrganizerData])

  // Check follow status when authenticated and organizer is loaded
  useEffect(() => {
    if (!isAuthenticated || !organizer?.id) return
    const checkFollow = async () => {
      try {
        const data = await apiClient<{ isFollowing: boolean }>(`/api/users/${organizer.id}/follow`)
        setIsFollowing(data.isFollowing)
      } catch {
        // Not critical
      }
    }
    checkFollow()
  }, [isAuthenticated, organizer?.id])

  const handleFollow = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/organizer/${slug}`)
      return
    }
    if (!organizer?.id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        await apiClient(`/api/users/${organizer.id}/follow`, { method: "DELETE" })
        setIsFollowing(false)
      } else {
        await apiClient(`/api/users/${organizer.id}/follow`, { method: "POST" })
        setIsFollowing(true)
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.message.includes("already following")) setIsFollowing(true)
        else if (err.message.includes("not following")) setIsFollowing(false)
      }
    } finally {
      setFollowLoading(false)
    }
  }

  // Helper functions
  const isUpcoming = (event: ApiEvent) => {
    return new Date(event.startDate) > new Date()
  }

  const getEventLocation = (event: ApiEvent) => {
    if (event.eventFormat === "ONLINE") return "Online"
    return [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "TBA"
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getPrice = (event: ApiEvent) => {
    if (event.isFree) return 0
    return Number(event.minTicketPrice) || 0
  }

  const upcomingEvents = organizer?.events.filter(e => isUpcoming(e)) || []
  const pastEvents = organizer?.events.filter(e => !isUpcoming(e)) || []
  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents

  // Calculate total attendees from all events
  const totalAttendees = organizer?.events.reduce((sum, e) => sum + (e.ticketsSold || 0), 0) || 0

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">Loading organizer profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !organizer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Organizer not found</h1>
            <p className="text-muted-foreground mb-6">The organizer profile you're looking for doesn't exist.</p>
            <Link href="/">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
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
          <div className="max-w-6xl mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>

        {/* Cover Image */}
        <section className="relative h-64 bg-gradient-to-r from-primary to-primary/80">
          <div className="absolute inset-0 bg-black/20"></div>
        </section>

        {/* Profile Header */}
        <section className="bg-card border-b border-border">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative">
              {/* Avatar */}
              <div className="absolute -top-20 left-0">
                {organizer.avatar ? (
                  <Image
                    src={organizer.avatar}
                    alt={organizer.name}
                    width={160}
                    height={160}
                    className="rounded-full border-4 border-card shadow-lg"
                  />
                ) : (
                  <div className="w-40 h-40 bg-primary/10 text-primary rounded-full border-4 border-card flex items-center justify-center text-5xl font-bold shadow-lg">
                    {organizer.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="pt-24 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{organizer.name}</h1>
                    {organizer.verified && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{organizer.totalEvents} events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{organizer.followersCount.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart size={16} />
                      <span>{organizer.totalLikes.toLocaleString()} likes</span>
                    </div>
                  </div>
                  {organizer.bio && (
                    <p className="text-foreground/80 max-w-3xl">{organizer.bio}</p>
                  )}
                </div>

                {/* Action Buttons — hidden when viewing own profile */}
                {!(isAuthenticated && user?.id === organizer.id) && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 ${
                        isFollowing
                          ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {followLoading ? <Loader2 size={20} className="animate-spin" /> : isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Calendar className="mx-auto mb-2 text-primary" size={28} />
                <div className="text-2xl font-bold text-foreground mb-1">{organizer.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Events</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Users className="mx-auto mb-2 text-primary" size={28} />
                <div className="text-2xl font-bold text-foreground mb-1">{organizer.followersCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Heart className="mx-auto mb-2 text-primary" size={28} />
                <div className="text-2xl font-bold text-foreground mb-1">{organizer.totalLikes.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <TrendingUp className="mx-auto mb-2 text-primary" size={28} />
                <div className="text-2xl font-bold text-foreground mb-1">{upcomingEvents.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center col-span-2 md:col-span-1">
                <Users className="mx-auto mb-2 text-primary" size={28} />
                <div className="text-2xl font-bold text-foreground mb-1">{totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Attendees</div>
              </div>
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === "upcoming"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Upcoming Events ({upcomingEvents.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === "past"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Past Events ({pastEvents.length})
              </button>
            </div>

            {/* Events Grid */}
            {displayEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEvents.map((event) => (
                  <Link key={event.id} href={`/event/${event.id}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                      <div className="h-48 bg-muted relative">
                        {event.coverImage && (
                          <Image
                            src={event.coverImage}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        )}
                        {event.category && (
                          <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                            {event.category.name}
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">{event.title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(event.startDate)}{event.startTime && ` • ${event.startTime}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{getEventLocation(event)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{event.viewCount || 0} views</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(getPrice(event), event.currency as "NGN" | "GHS" | "KES")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-xl font-semibold text-foreground mb-2">No {activeTab} events</h3>
                <p className="text-muted-foreground">
                  {activeTab === "upcoming"
                    ? "This organizer has no upcoming events scheduled."
                    : "This organizer has no past events."}
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