"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
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
  Clock
} from "lucide-react"

type DashboardTab = "my-events" | "liked" | "following" | "tickets" | "analytics"

interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  image: string
  price: number
  currency: string
  category: string
  attendees: number
  ticketsSold?: number
  revenue?: number
  status: "upcoming" | "past" | "draft"
}

interface Organizer {
  id: string
  name: string
  avatar: string
  followers: number
  totalEvents: number
}

interface Ticket {
  id: string
  eventId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketType: string
  price: number
  currency: string
  purchaseDate: string
  qrCode: string
  status: "valid" | "used" | "cancelled"
}

export default function UserDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<DashboardTab>("my-events")
  const [loading, setLoading] = useState(true)

  // State for different data sections
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [likedEvents, setLikedEvents] = useState<Event[]>([])
  const [followedOrganizers, setFollowedOrganizers] = useState<Organizer[]>([])
  const [myTickets, setMyTickets] = useState<Ticket[]>([])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    setLoading(true)
    
    // In production, replace with actual API calls:
    // const [events, liked, following, tickets] = await Promise.all([
    //   fetch('/api/user/events').then(r => r.json()),
    //   fetch('/api/user/liked-events').then(r => r.json()),
    //   fetch('/api/user/following').then(r => r.json()),
    //   fetch('/api/user/tickets').then(r => r.json())
    // ])

    // Mock data
    await new Promise(resolve => setTimeout(resolve, 500))

    setMyEvents([
      {
        id: "1",
        title: "Summer Music Festival 2025",
        date: "2025-07-15",
        time: "6:00 PM",
        location: "Lagos, Nigeria",
        image: "/placeholder.jpg",
        price: 5000,
        currency: "NGN",
        category: "Music",
        attendees: 1200,
        ticketsSold: 850,
        revenue: 4250000,
        status: "upcoming"
      },
      {
        id: "2",
        title: "Tech Conference 2025",
        date: "2025-08-20",
        time: "9:00 AM",
        location: "Abuja, Nigeria",
        image: "/placeholder.jpg",
        price: 15000,
        currency: "NGN",
        category: "Tech",
        attendees: 500,
        ticketsSold: 320,
        revenue: 4800000,
        status: "draft"
      }
    ])

    setLikedEvents([
      {
        id: "3",
        title: "Food & Wine Tasting",
        date: "2025-06-10",
        time: "7:00 PM",
        location: "Victoria Island, Lagos",
        image: "/placeholder.jpg",
        price: 8000,
        currency: "NGN",
        category: "Food",
        attendees: 300,
        status: "upcoming"
      }
    ])

    setFollowedOrganizers([
      {
        id: "1",
        name: "EventMasters Lagos",
        avatar: "",
        followers: 5420,
        totalEvents: 45
      },
      {
        id: "2",
        name: "Tech Events NG",
        avatar: "",
        followers: 3200,
        totalEvents: 28
      }
    ])

    setMyTickets([
      {
        id: "1",
        eventId: "4",
        eventTitle: "Jazz Night Under the Stars",
        eventDate: "2025-06-25",
        eventTime: "8:00 PM",
        eventLocation: "Eko Hotel, Lagos",
        ticketType: "VIP Pass",
        price: 12000,
        currency: "NGN",
        purchaseDate: "2025-05-15",
        qrCode: "QR12345",
        status: "valid"
      }
    ])

    setLoading(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setMyEvents(prev => prev.filter(e => e.id !== eventId))
      alert("Event deleted successfully")
    }
  }

  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.revenue || 0), 0)
  const totalTicketsSold = myEvents.reduce((sum, e) => sum + (e.ticketsSold || 0), 0)

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
            <h1 className="text-4xl font-bold mb-2">My Events</h1>
            <p className="text-primary-foreground/90">Welcome back! Manage your events and activities</p>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="py-8 px-4 bg-card border-b">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-background border rounded-xl p-6">
                <Calendar className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{myEvents.length}</div>
                <div className="text-sm text-muted-foreground">Events Created</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <Ticket className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{totalTicketsSold}</div>
                <div className="text-sm text-muted-foreground">Tickets Sold</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <TrendingUp className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">₦{(totalRevenue / 1000).toFixed(1)}K</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="bg-background border rounded-xl p-6">
                <Heart className="text-primary mb-2" size={32} />
                <div className="text-3xl font-bold text-foreground">{likedEvents.length + myTickets.length}</div>
                <div className="text-sm text-muted-foreground">Events Saved</div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="bg-card border-b px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[
                { id: "my-events", label: "My Events", count: myEvents.length },
                { id: "liked", label: "Liked Events", count: likedEvents.length },
                { id: "following", label: "Following", count: followedOrganizers.length },
                { id: "tickets", label: "My Tickets", count: myTickets.length },
                { id: "analytics", label: "Analytics", count: null }
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

                {myEvents.length > 0 ? (
                  <div className="space-y-4">
                    {myEvents.map(event => (
                      <div key={event.id} className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-48 h-32 bg-muted rounded-lg flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    event.status === "upcoming" ? "bg-green-100 text-green-700" :
                                    event.status === "draft" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {event.status}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1"><Calendar size={16} />{event.date}</span>
                                  <span className="flex items-center gap-1"><Clock size={16} />{event.time}</span>
                                  <span className="flex items-center gap-1"><MapPin size={16} />{event.location}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Link href={`/events/${event.id}`}>
                                  <button className="p-2 hover:bg-muted rounded-lg transition-colors" title="View">
                                    <Eye size={20} />
                                  </button>
                                </Link>
                                <Link href={`/edit-event/${event.id}`}>
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
                                <div className="text-2xl font-bold text-foreground">{event.ticketsSold || 0}</div>
                                <div className="text-xs text-muted-foreground">Tickets Sold</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-foreground">{event.currency} {((event.revenue || 0) / 1000).toFixed(1)}K</div>
                                <div className="text-xs text-muted-foreground">Revenue</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-foreground">{event.attendees}</div>
                                <div className="text-xs text-muted-foreground">Interested</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
                {likedEvents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {likedEvents.map(event => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <div className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                          <div className="h-48 bg-muted"></div>
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-foreground mb-3">{event.title}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2"><Calendar size={16} />{event.date}</div>
                              <div className="flex items-center gap-2"><MapPin size={16} />{event.location}</div>
                            </div>
                            <div className="mt-4 pt-4 border-t">
                              <span className="text-lg font-bold text-primary">
                                {event.price === 0 ? "Free" : `${event.currency} ${event.price.toLocaleString()}`}
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
                {followedOrganizers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {followedOrganizers.map(org => (
                      <Link key={org.id} href={`/organizer/${org.name.toLowerCase().replace(/\s+/g, "-")}`}>
                        <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                            {org.name.charAt(0)}
                          </div>
                          <h3 className="text-lg font-bold text-foreground text-center mb-2">{org.name}</h3>
                          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                            <div className="text-center">
                              <div className="font-bold text-foreground">{org.followers.toLocaleString()}</div>
                              <div>Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-foreground">{org.totalEvents}</div>
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
              </div>
            )}

            {/* My Tickets Tab */}
            {activeTab === "tickets" && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">My Tickets</h2>
                {myTickets.length > 0 ? (
                  <div className="space-y-4">
                    {myTickets.map(ticket => (
                      <div key={ticket.id} className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-foreground mb-2">{ticket.eventTitle}</h3>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-2"><Calendar size={16} />{ticket.eventDate} • {ticket.eventTime}</div>
                              <div className="flex items-center gap-2"><MapPin size={16} />{ticket.eventLocation}</div>
                              <div className="flex items-center gap-2"><Ticket size={16} />{ticket.ticketType}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-lg font-bold text-primary">{ticket.currency} {ticket.price.toLocaleString()}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                ticket.status === "valid" ? "bg-green-100 text-green-700" :
                                ticket.status === "used" ? "bg-gray-100 text-gray-700" :
                                "bg-red-100 text-red-700"
                              }`}>
                                {ticket.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-3">
                            <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-xs text-muted-foreground">QR Code</div>
                            </div>
                            <Link href={`/events/${ticket.eventId}`}>
                              <button className="text-primary hover:underline text-sm font-semibold">View Event</button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Event</h3>
                    {myEvents.map(event => (
                      <div key={event.id} className="flex justify-between items-center py-3 border-b last:border-0">
                        <span className="text-sm">{event.title}</span>
                        <span className="font-bold">{event.currency} {((event.revenue || 0) / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Tickets Sold by Event</h3>
                    {myEvents.map(event => (
                      <div key={event.id} className="flex justify-between items-center py-3 border-b last:border-0">
                        <span className="text-sm">{event.title}</span>
                        <span className="font-bold">{event.ticketsSold || 0} tickets</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}