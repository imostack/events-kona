"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import type { ApiEvent, ApiTicket } from "@/lib/types"
import {
  Plus,
  ArrowLeft,
  Calendar,
  Heart,
  Users,
  Ticket,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Clock,
  Loader2,
  Send,
  UserCheck
} from "lucide-react"

type DashboardTab = "my-events" | "liked" | "following" | "tickets" | "analytics"

// Extended event type for organizer's events with stats
interface MyEvent extends ApiEvent {
  stats?: {
    ticketsSold: number
    totalRevenue: number
    totalAttendees: number
  }
}

interface FollowedOrganizer {
  id: string
  name: string
  slug: string
  avatar: string | null
  verified: boolean
  followersCount: number
  eventsCount: number
  followedAt: string
}

interface Follower {
  id: string
  name: string
  avatar: string | null
  email: string
  followedAt: string
}

export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>("my-events")
  const [loading, setLoading] = useState(true)

  // State for different data sections
  const [myEvents, setMyEvents] = useState<MyEvent[]>([])
  const [likedEvents, setLikedEvents] = useState<ApiEvent[]>([])
  const [followedOrganizers, setFollowedOrganizers] = useState<FollowedOrganizer[]>([])
  const [myTickets, setMyTickets] = useState<ApiTicket[]>([])
  const [followers, setFollowers] = useState<Follower[]>([])
  const [totalLikesOnMyEvents, setTotalLikesOnMyEvents] = useState(0)

  // Fetch my events from API
  const fetchMyEvents = useCallback(async () => {
    try {
      const response = await apiClient<{ events: MyEvent[] }>("/api/events/my")
      setMyEvents(response.events || [])
    } catch (error) {
      console.error("Failed to fetch my events:", error)
      setMyEvents([])
    }
  }, [])

  // Fetch my tickets from API
  const fetchMyTickets = useCallback(async () => {
    try {
      const tickets = await apiClient<ApiTicket[]>("/api/tickets")
      setMyTickets(tickets)
    } catch (error) {
      console.error("Failed to fetch my tickets:", error)
      setMyTickets([])
    }
  }, [])

  // Fetch liked events
  const fetchLikedEvents = useCallback(async () => {
    try {
      const events = await apiClient<ApiEvent[]>("/api/users/me/liked-events")
      setLikedEvents(events)
    } catch (error) {
      console.error("Failed to fetch liked events:", error)
      setLikedEvents([])
    }
  }, [])

  // Fetch followed organizers
  const fetchFollowing = useCallback(async () => {
    try {
      const organizers = await apiClient<FollowedOrganizer[]>("/api/users/me/following")
      setFollowedOrganizers(organizers)
    } catch (error) {
      console.error("Failed to fetch following:", error)
      setFollowedOrganizers([])
    }
  }, [])

  // Fetch my followers (for organizers)
  const fetchFollowers = useCallback(async () => {
    try {
      const data = await apiClient<{ followers: Follower[]; totalFollowers: number; totalLikes: number }>("/api/users/me/followers")
      setFollowers(data.followers)
      setTotalLikesOnMyEvents(data.totalLikes)
    } catch (error) {
      console.error("Failed to fetch followers:", error)
      setFollowers([])
    }
  }, [])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchMyEvents(),
          fetchMyTickets(),
          fetchLikedEvents(),
          fetchFollowing(),
          fetchFollowers(),
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router, fetchMyEvents, fetchMyTickets, fetchLikedEvents, fetchFollowing, fetchFollowers])

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await apiClient(`/api/events/${eventId}`, {
          method: "DELETE",
        })
        setMyEvents(prev => prev.filter(e => e.id !== eventId))
      } catch (error) {
        console.error("Failed to delete event:", error)
        alert("Failed to delete event. Please try again.")
      }
    }
  }

  const handlePublishEvent = async (eventId: string) => {
    try {
      await apiClient(`/api/events/${eventId}/publish`, {
        method: "POST",
      })
      setMyEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, isPublished: true, status: "APPROVED" as const } : e
      ))
    } catch (error) {
      console.error("Failed to publish event:", error)
      const message = error instanceof Error ? error.message : "Failed to publish event"
      alert(message)
    }
  }

  // Calculate stats from events
  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.stats?.totalRevenue || 0), 0)
  const totalTicketsSold = myEvents.reduce((sum, e) => sum + (e.ticketsSold || e.stats?.ticketsSold || 0), 0)
  const isOrganizer = user?.role === "ORGANIZER" || user?.role === "ADMIN" || (myEvents.length > 0)

  // Helper to format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Helper to get event status
  const getEventStatus = (event: MyEvent) => {
    if (event.isCancelled) return "cancelled"
    if (event.status === "DRAFT" || !event.isPublished) return "draft"
    const now = new Date()
    const startDate = new Date(event.startDate)
    if (startDate > now) return "live"
    return "past"
  }

  // Helper to get location string
  const getLocation = (event: MyEvent) => {
    return [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Online"
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground mb-6">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-primary-foreground/90">Welcome back, {user.firstName || user.name}! Manage your events and activities</p>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="py-8 px-4 bg-card border-b">
          <div className="max-w-6xl mx-auto">
            <div className={`grid grid-cols-1 ${isOrganizer ? "md:grid-cols-5" : "md:grid-cols-4"} gap-6`}>
              {isOrganizer && (
                <div className="bg-background border rounded-xl p-6">
                  <Calendar className="text-primary mb-2" size={32} />
                  <div className="text-3xl font-bold text-foreground">{myEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Events Created</div>
                </div>
              )}
              <div className="bg-background border rounded-xl p-6">
                <Ticket className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{isOrganizer ? totalTicketsSold : myTickets.length}</div>
                <div className="text-sm text-muted-foreground">{isOrganizer ? "Tickets Sold" : "My Tickets"}</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <Users className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{followers.length}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <Heart className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{isOrganizer ? totalLikesOnMyEvents : likedEvents.length}</div>
                <div className="text-sm text-muted-foreground">{isOrganizer ? "Likes on Events" : "Liked Events"}</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <UserCheck className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{followedOrganizers.length}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-card border-b px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                ...(isOrganizer ? [{ id: "my-events", label: "My Events", count: myEvents.length }] : []),
                { id: "tickets", label: "My Tickets", count: myTickets.length },
                { id: "liked", label: "Liked Events", count: likedEvents.length },
                { id: "following", label: "Following", count: followedOrganizers.length },
                ...(isOrganizer ? [{ id: "analytics", label: "Analytics", count: null }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DashboardTab)}
                  className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && ` (${tab.count})`}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {/* My Events Tab */}
            {activeTab === "my-events" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground">My Events</h2>
                  <Link href="/create-event">
                    <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center gap-2">
                      <Plus size={20} />
                      Create Event
                    </button>
                  </Link>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted-foreground">Loading events...</span>
                  </div>
                ) : myEvents.length > 0 ? (
                  <div className="space-y-4">
                    {myEvents.map(event => {
                      const status = getEventStatus(event)
                      const ticketsSold = event.ticketsSold || event.stats?.ticketsSold || 0
                      const revenue = event.stats?.totalRevenue || 0
                      return (
                        <div key={event.id} className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden relative">
                              {event.coverImage && (
                                <Image
                                  src={event.coverImage}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      status === "live" ? "bg-green-100 text-green-700" :
                                      status === "draft" ? "bg-yellow-100 text-yellow-700" :
                                      status === "cancelled" ? "bg-red-100 text-red-700" :
                                      "bg-gray-100 text-gray-700"
                                    }`}>
                                      {status}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar size={16} />{formatDate(event.startDate)}</span>
                                    {event.startTime && <span className="flex items-center gap-1"><Clock size={16} />{event.startTime}</span>}
                                    <span className="flex items-center gap-1"><MapPin size={16} />{getLocation(event)}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {status === "draft" && (
                                    <button onClick={() => handlePublishEvent(event.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1" title="Publish">
                                      <Send size={16} />
                                      Publish
                                    </button>
                                  )}
                                  <Link href={`/event/${event.id}`}>
                                    <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
                                      <Eye size={20} />
                                    </button>
                                  </Link>
                                  <Link href={`/create-event?edit=${event.id}`}>
                                    <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="Edit">
                                      <Edit size={20} />
                                    </button>
                                  </Link>
                                  <button onClick={() => handleDeleteEvent(event.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                                    <Trash2 size={20} />
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                <div>
                                  <div className="text-2xl font-bold text-foreground">{ticketsSold}</div>
                                  <div className="text-xs text-muted-foreground">Tickets Sold</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-foreground">{event.likesCount || 0}</div>
                                  <div className="text-xs text-muted-foreground">Likes</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-foreground">{event.viewCount || 0}</div>
                                  <div className="text-xs text-muted-foreground">Views</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Calendar className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-xl font-semibold mb-2">No events yet</h3>
                    <p className="text-muted-foreground mb-6">Create your first event to get started</p>
                    <Link href="/create-event">
                      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
                        Create Event
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Liked Events Tab */}
            {activeTab === "liked" && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Liked Events</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted-foreground">Loading...</span>
                  </div>
                ) : likedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likedEvents.map(event => (
                      <Link key={event.id} href={`/event/${event.id}`}>
                        <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                          <div className="h-48 bg-muted relative overflow-hidden">
                            {event.coverImage && (
                              <Image src={event.coverImage} alt={event.title} fill className="object-cover" />
                            )}
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-foreground mb-3">{event.title}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2"><Calendar size={16} />{formatDate(event.startDate)}</div>
                              <div className="flex items-center gap-2"><MapPin size={16} />{[event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Online"}</div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <span className="text-lg font-bold text-primary">
                                {event.isFree ? "Free" : `${event.currency} ${Number(event.minTicketPrice || 0).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Heart className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-xl font-semibold mb-2">No liked events</h3>
                    <p className="text-muted-foreground">Events you like will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Following Tab */}
            {activeTab === "following" && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Following</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted-foreground">Loading...</span>
                  </div>
                ) : followedOrganizers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followedOrganizers.map(org => (
                      <Link key={org.id} href={`/organizer/${org.slug}`}>
                        <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                          <div className="flex items-center gap-4 mb-4">
                            {org.avatar ? (
                              <Image src={org.avatar} alt={org.name} width={56} height={56} className="rounded-full" />
                            ) : (
                              <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl">
                                {org.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="text-lg font-bold text-foreground">{org.name}</h3>
                              {org.verified && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">Verified</span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground border-t pt-4">
                            <div className="text-center">
                              <div className="font-bold text-foreground">{org.followersCount.toLocaleString()}</div>
                              <div>Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-foreground">{org.eventsCount}</div>
                              <div>Events</div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-xl font-semibold mb-2">Not following anyone</h3>
                    <p className="text-muted-foreground">Follow organizers to see their updates here</p>
                  </div>
                )}

                {/* My Followers section (for organizers) */}
                {isOrganizer && followers.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-2xl font-bold text-foreground mb-6">My Followers ({followers.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {followers.map(follower => (
                        <div key={follower.id} className="bg-card border rounded-xl p-4 flex items-center gap-4">
                          {follower.avatar ? (
                            <Image src={follower.avatar} alt={follower.name} width={44} height={44} className="rounded-full" />
                          ) : (
                            <div className="w-11 h-11 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                              {follower.name.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{follower.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Followed {new Date(follower.followedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* My Tickets Tab */}
            {activeTab === "tickets" && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">My Tickets</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted-foreground">Loading tickets...</span>
                  </div>
                ) : myTickets.length > 0 ? (
                  <div className="space-y-4">
                    {myTickets.map(ticket => {
                      const ticketLocation = [ticket.event.venueName, ticket.event.city, ticket.event.country].filter(Boolean).join(", ") || "Online"
                      const ticketStatusDisplay = ticket.status === "ACTIVE" ? "valid" : ticket.status.toLowerCase()
                      return (
                        <div key={ticket.id} className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-foreground mb-2">{ticket.event.title}</h3>
                              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                  <Calendar size={16} />
                                  {formatDate(ticket.event.startDate)}
                                  {ticket.event.startTime && ` • ${ticket.event.startTime}`}
                                </div>
                                <div className="flex items-center gap-2"><MapPin size={16} />{ticketLocation}</div>
                                <div className="flex items-center gap-2"><Ticket size={16} />{ticket.ticketType.name}</div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">#{ticket.ticketNumber}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  ticket.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                                  ticket.status === "USED" ? "bg-gray-100 text-gray-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {ticketStatusDisplay}
                                </span>
                                {ticket.checkedIn && (
                                  <span className="text-xs text-muted-foreground">Checked in</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-3">
                              {ticket.qrCode ? (
                                <Image
                                  src={ticket.qrCode}
                                  alt="QR Code"
                                  width={128}
                                  height={128}
                                  className="rounded-lg"
                                />
                              ) : (
                                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                                  <div className="text-xs text-muted-foreground">QR Code</div>
                                </div>
                              )}
                              <Link href={`/event/${ticket.event.id || ticket.event.slug}`}>
                                <button className="text-primary hover:underline text-sm font-semibold">View Event</button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Ticket className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
                    <p className="text-muted-foreground">Tickets for events you register for will appear here</p>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Analytics Overview</h2>
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-muted-foreground">Loading analytics...</span>
                  </div>
                ) : myEvents.length > 0 ? (
                  <div className="space-y-8">
                    {/* Summary cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="bg-card border rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-foreground">{followers.length}</div>
                        <div className="text-sm text-muted-foreground">Total Followers</div>
                      </div>
                      <div className="bg-card border rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-foreground">{totalLikesOnMyEvents}</div>
                        <div className="text-sm text-muted-foreground">Total Likes</div>
                      </div>
                      <div className="bg-card border rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-foreground">{totalTicketsSold}</div>
                        <div className="text-sm text-muted-foreground">Tickets Sold</div>
                      </div>
                      <div className="bg-card border rounded-xl p-6 text-center">
                        <div className="text-3xl font-bold text-foreground">{myEvents.reduce((sum, e) => sum + (e.viewCount || 0), 0)}</div>
                        <div className="text-sm text-muted-foreground">Total Views</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Engagement by Event</h3>
                        {myEvents.map(event => (
                          <div key={event.id} className="flex justify-between items-center py-3 border-b last:border-0">
                            <span className="text-sm truncate flex-1 mr-4">{event.title}</span>
                            <div className="flex items-center gap-4 text-sm shrink-0">
                              <span className="flex items-center gap-1"><Heart size={14} />{event.likesCount || 0}</span>
                              <span className="flex items-center gap-1"><Eye size={14} />{event.viewCount || 0}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-card border rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Tickets Sold by Event</h3>
                        {myEvents.map(event => {
                          const ticketsSold = event.ticketsSold || event.stats?.ticketsSold || 0
                          return (
                            <div key={event.id} className="flex justify-between items-center py-3 border-b last:border-0">
                              <span className="text-sm truncate flex-1 mr-4">{event.title}</span>
                              <span className="font-bold">{ticketsSold} tickets</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <TrendingUp className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <h3 className="text-xl font-semibold mb-2">No analytics data</h3>
                    <p className="text-muted-foreground">Create events to see analytics here</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
