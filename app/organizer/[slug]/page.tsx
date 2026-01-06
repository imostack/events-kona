"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
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
  TrendingUp
} from "lucide-react"

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
  status: "upcoming" | "past"
}

interface OrganizerProfile {
  id: string
  name: string
  bio: string
  avatar: string
  coverImage: string
  followers: number
  totalEvents: number
  totalAttendees: number
  rating: number
  joinedDate: string
  website?: string
  email?: string
  social: {
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  events: Event[]
}

export default function OrganizerProfilePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call to fetch organizer data
    const fetchOrganizerData = async () => {
      setLoading(true)
      
      // In production, replace with actual API call:
      // const response = await fetch(`/api/organizers/${params.slug}`)
      // const data = await response.json()
      
      // Mock data for demonstration
      const mockOrganizer: OrganizerProfile = {
        id: "1",
        name: params.slug.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
        bio: "Passionate event organizer bringing people together through unforgettable experiences. Specializing in music festivals, tech conferences, and community gatherings across Nigeria. With over 5 years of experience in the event industry, we've successfully hosted 50+ events with thousands of satisfied attendees.",
        avatar: "/placeholder-avatar.jpg",
        coverImage: "/placeholder-cover.jpg",
        followers: 2543,
        totalEvents: 52,
        totalAttendees: 15420,
        rating: 4.8,
        joinedDate: "January 2020",
        website: "https://example.com",
        email: "contact@example.com",
        social: {
          twitter: "organizer",
          instagram: "organizer",
          linkedin: "organizer"
        },
        events: [
          {
            id: "1",
            title: "Summer Music Festival 2025",
            date: "2025-07-15",
            time: "6:00 PM",
            location: "Lagos, Nigeria",
            image: "/placeholder-event.jpg",
            price: 5000,
            currency: "NGN",
            category: "Music",
            attendees: 1200,
            status: "upcoming"
          },
          {
            id: "2",
            title: "Tech Innovation Summit",
            date: "2025-08-20",
            time: "9:00 AM",
            location: "Abuja, Nigeria",
            image: "/placeholder-event.jpg",
            price: 15000,
            currency: "NGN",
            category: "Technology",
            attendees: 500,
            status: "upcoming"
          },
          {
            id: "3",
            title: "Food & Wine Tasting",
            date: "2024-12-10",
            time: "7:00 PM",
            location: "Victoria Island, Lagos",
            image: "/placeholder-event.jpg",
            price: 8000,
            currency: "NGN",
            category: "Food",
            attendees: 300,
            status: "past"
          },
          {
            id: "4",
            title: "Holiday Charity Gala",
            date: "2024-12-25",
            time: "8:00 PM",
            location: "Lagos, Nigeria",
            image: "/placeholder-event.jpg",
            price: 0,
            currency: "NGN",
            category: "Charity",
            attendees: 800,
            status: "past"
          }
        ]
      }

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setOrganizer(mockOrganizer)
      setLoading(false)
    }

    fetchOrganizerData()
  }, [params.slug])

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // In production, call API to update follow status
    // await fetch(`/api/organizers/${organizer?.id}/follow`, { method: 'POST' })
  }

  const upcomingEvents = organizer?.events.filter(e => e.status === "upcoming") || []
  const pastEvents = organizer?.events.filter(e => e.status === "past") || []
  const displayEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading organizer profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!organizer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Organizer not found</h1>
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
                <div className="w-40 h-40 bg-primary/10 text-primary rounded-full border-4 border-card flex items-center justify-center text-5xl font-bold shadow-lg">
                  {organizer.name.charAt(0)}
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-24 pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{organizer.name}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{organizer.followers.toLocaleString()} followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{organizer.totalEvents} events</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} fill="currentColor" className="text-yellow-500" />
                      <span>{organizer.rating} rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>Joined {organizer.joinedDate}</span>
                    </div>
                  </div>
                  <p className="text-foreground/80 max-w-3xl">{organizer.bio}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isFollowing
                        ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  {organizer.email && (
                    <a href={`mailto:${organizer.email}`}>
                      <button className="px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2">
                        <Mail size={20} />
                        Contact
                      </button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Social */}
        <section className="py-8 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stats Cards */}
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <TrendingUp className="mx-auto mb-2 text-primary" size={32} />
                <div className="text-3xl font-bold text-foreground mb-1">{organizer.totalAttendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Calendar className="mx-auto mb-2 text-primary" size={32} />
                <div className="text-3xl font-bold text-foreground mb-1">{organizer.totalEvents}</div>
                <div className="text-sm text-muted-foreground">Events Hosted</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Users className="mx-auto mb-2 text-primary" size={32} />
                <div className="text-3xl font-bold text-foreground mb-1">{organizer.followers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <Star className="mx-auto mb-2 text-yellow-500" size={32} fill="currentColor" />
                <div className="text-3xl font-bold text-foreground mb-1">{organizer.rating}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="mt-6 bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Connect with us</h3>
              <div className="flex flex-wrap gap-4">
                {organizer.website && (
                  <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Globe size={18} />
                    Website
                  </a>
                )}
                {organizer.social.twitter && (
                  <a href={`https://twitter.com/${organizer.social.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Twitter size={18} />
                    Twitter
                  </a>
                )}
                {organizer.social.instagram && (
                  <a href={`https://instagram.com/${organizer.social.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Instagram size={18} />
                    Instagram
                  </a>
                )}
                {organizer.social.linkedin && (
                  <a href={`https://linkedin.com/in/${organizer.social.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                    <Linkedin size={18} />
                    LinkedIn
                  </a>
                )}
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
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:border-primary cursor-pointer">
                      <div className="h-48 bg-muted relative">
                        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                          {event.category}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">{event.title}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{event.attendees} attendees</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
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