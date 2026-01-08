"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import EventCard from "@/components/event-card"
import { Search, Plus, Music, Briefcase, Utensils, Palette, Trophy, Cpu, GraduationCap, Calendar, Users, TrendingUp, X } from "lucide-react"
import { mockEvents } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"

const categories = [
  { id: "all", name: "All Events", icon: Calendar, color: "bg-blue-500" },
  { id: "music", name: "Music", icon: Music, color: "bg-purple-500" },
  { id: "business", name: "Business", icon: Briefcase, color: "bg-indigo-500" },
  { id: "food", name: "Food & Drink", icon: Utensils, color: "bg-orange-500" },
  { id: "arts", name: "Arts", icon: Palette, color: "bg-pink-500" },
  { id: "sports", name: "Sports", icon: Trophy, color: "bg-green-500" },
  { id: "tech", name: "Technology", icon: Cpu, color: "bg-cyan-500" },
  { id: "education", name: "Education", icon: GraduationCap, color: "bg-amber-500" },
  { id: "religious", name: "Religious", icon: Calendar, color: "bg-rose-500" }
]

// Hero background images 
const heroImages = [
  "https://alproseltech.com/abstract-concept.webp", // abstract
  "https://alproseltech.com/abstract-concept-2.webp", // abstract
  "https://alproseltech.com/abstract-concept-3.webp", // abstract
]

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { user } = useAuth()

  // Auto-rotate hero background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 8000) // Change image every 8 seconds

    return () => clearInterval(interval)
  }, [])

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with Background Carousel */}
        <section className="relative py-20 px-4 overflow-hidden">
          {/* Background Images with Fade Transition */}
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: currentImageIndex === index ? 1 : 0,
                  backgroundImage: `url(${image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ))}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/85" />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-6xl mx-auto text-center text-primary-foreground">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">Discover Amazing Events</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 text-balance">
              Find, create, and manage events that matter to you
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={user ? "/create-event" : "/signup"}>
                <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg hover:shadow-xl">
                  <Plus size={20} />
                  Create Event
                </button>
              </Link>
              <Link href="#browse">
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-primary-foreground border border-white/20 px-8 py-3 rounded-lg font-semibold transition-colors">
                  Browse Events
                </button>
              </Link>
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Stats Banner */}
        <section className="bg-card border-y border-border py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Calendar size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">{mockEvents.length}+</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Users size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">5K+</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <TrendingUp size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">1.2K+</div>
                <div className="text-sm text-muted-foreground">Organizers</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Music size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">8</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="py-12 px-4" id="browse">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilterType(cat.id)}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                      filterType === cat.id
                        ? `${cat.color} border-transparent text-white shadow-lg`
                        : "bg-card border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className={`mx-auto mb-2 ${filterType === cat.id ? "text-white" : "text-primary"}`} size={32} />
                    <div className={`text-xs font-semibold text-center ${filterType === cat.id ? "text-white" : "text-foreground"}`}>
                      {cat.name}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Search Section */}
        <section className="bg-secondary/30 border-y border-border py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="Search events by name, location, or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Active Filters */}
            {(searchQuery || filterType !== "all") && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {filterType !== "all" && (
                  <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Category: {categories.find(c => c.id === filterType)?.name}
                    <button onClick={() => setFilterType("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Featured Events</h2>
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
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                {filterType === "all" ? "Upcoming Events" : `${categories.find(c => c.id === filterType)?.name} Events`}
              </h2>
              <div className="text-sm text-muted-foreground">
                {upcomingEvents.length} {upcomingEvents.length === 1 ? "event" : "events"} found
              </div>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                    <Search className="text-muted-foreground" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">No Events Found</h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find any events matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setSearchQuery("")
                        setFilterType("all")
                      }}
                      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Clear Filters
                    </button>
                    {user && (
                      <Link href="/create-event">
                        <button className="px-6 py-2 border border-border rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2 mx-auto">
                          <Plus size={18} />
                          Create Event
                        </button>
                      </Link>
                    )}
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
