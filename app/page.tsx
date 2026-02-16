"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SearchBar from "@/components/search-bar"
import EventCard from "@/components/event-card"
import { Search, Plus, Music, Briefcase, Utensils, Palette, Trophy, Cpu, GraduationCap, Calendar, Users, TrendingUp, X, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import type { ApiEvent } from "@/lib/types"
import { apiEventToLegacy } from "@/lib/types"

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
  "https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767950756/abstract-concept_rxuefx.webp",
  "https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767950858/abstract-concept-2_eyzstk.webp",
  "https://res.cloudinary.com/dlcl5rqnh/image/upload/v1767950945/abstract-concept-3_zumxcw.webp",
]


function EventCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden h-full flex flex-col animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="h-5 bg-muted rounded w-3/4 mb-3" />
        <div className="space-y-2 mb-4 flex-1">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-8 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [locationFilter, setLocationFilter] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [countryFilter, setCountryFilter] = useState("")
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [showFreeFirst, setShowFreeFirst] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // API state
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<ApiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [platformStats, setPlatformStats] = useState({ events: 0, organizers: 0, attendees: 0 })

  // Load user preferences to set default filters
  useEffect(() => {
    if (!user) {
      setPrefsLoaded(true)
      return
    }

    async function loadPreferences() {
      try {
        const data = await apiClient<{ preferences: Record<string, unknown> | null }>("/api/auth/onboarding")
        if (data.preferences) {
          const prefs = data.preferences
          if (prefs.preferredCountry && !countryFilter) {
            setCountryFilter(prefs.preferredCountry as string)
          }
          if (prefs.preferredLocation && !cityFilter) {
            setCityFilter(prefs.preferredLocation as string)
          }
          if (prefs.preferredCategories && (prefs.preferredCategories as string[]).length > 0 && filterType === "all") {
            // Set first preferred category as default filter
            setFilterType((prefs.preferredCategories as string[])[0])
          }
          if (prefs.showFreeEventsFirst) {
            setShowFreeFirst(true)
          }
        }
      } catch {
        // Silently fail - preferences are not critical
      } finally {
        setPrefsLoaded(true)
      }
    }

    loadPreferences()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load platform stats
  useEffect(() => {
    apiClient<{ events: number; organizers: number; attendees: number }>("/api/stats", { skipAuth: true })
      .then(setPlatformStats)
      .catch(() => {})
  }, [])

  // Auto-rotate hero background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Fetch events from API (waits for preferences to load first)
  useEffect(() => {
    if (!prefsLoaded) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    async function fetchEvents() {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({
          limit: "12",
          sortBy: "startDate",
          sortOrder: "asc",
        })

        // Combine keyword + location into search if no structured city/country selected
        const searchTerms = [searchQuery, (!cityFilter && locationFilter) ? locationFilter : ""].filter(Boolean).join(" ").trim()
        if (searchTerms) {
          params.set("search", searchTerms)
        }
        if (cityFilter) {
          params.set("city", cityFilter)
        }
        if (countryFilter) {
          params.set("country", countryFilter)
        }

        const response = await apiClient<ApiEvent[]>(`/api/events?${params.toString()}`, {
          skipAuth: true,
          signal: controller.signal,
        })

        if (!controller.signal.aborted) {
          setEvents(response)
          setTotalEvents(response.length)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch events:", error)
          setEvents([])
        }
      } finally {
        clearTimeout(timeoutId)
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    fetchEvents()

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [searchQuery, locationFilter, cityFilter, countryFilter, prefsLoaded])

  // Fetch featured events
  useEffect(() => {
    const controller = new AbortController()

    async function fetchFeatured() {
      try {
        const response = await apiClient<ApiEvent[]>("/api/events?featured=true&limit=3", {
          skipAuth: true,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setFeaturedEvents(response)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch featured events:", error)
          setFeaturedEvents([])
        }
      }
    }

    fetchFeatured()

    return () => controller.abort()
  }, [])

  // Filter events client-side for category (until categories are in DB)
  const filteredEvents = events.filter((event) => {
    if (filterType === "all") return true
    return event.category?.slug === filterType ||
           event.category?.name?.toLowerCase() === filterType.toLowerCase()
  }).sort((a, b) => {
    // If user prefers free events first, sort them to the top
    if (showFreeFirst) {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
    }
    return 0
  })

  // Use first 3 events as featured if no featured events returned
  const displayFeaturedEvents = featuredEvents.length > 0 ? featuredEvents : events.slice(0, 3)
  const upcomingEvents = filteredEvents.slice(0, 6)

  const hasActiveFilters = searchQuery || locationFilter || filterType !== "all"

  const clearAllFilters = () => {
    setSearchQuery("")
    setLocationFilter("")
    setCityFilter("")
    setCountryFilter("")
    setFilterType("all")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with Background Carousel */}
        <section className="relative py-16 md:py-20 px-4 overflow-hidden">
          {/* Background Images with Fade Transition */}
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{
                  opacity: currentImageIndex === index ? 1 : 0,
                }}
              >
                <Image
                  src={image}
                  alt={`Hero background ${index + 1}`}
                  fill
                  priority={index === 0}
                  quality={75}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ))}
            {/* Dark Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/60" />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/60 to-primary/50" />
          </div>

          {/* Hero Content */}
          <div className="relative max-w-6xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-balance">Discover Amazing Events</h1>
            <p className="text-lg md:text-2xl mb-8 opacity-90 text-balance">
              Find, create, and manage events that matter to you
            </p>

            {/* Search Bar */}
            <div className="mb-8 relative z-20">
              <SearchBar
                onSearch={(keyword, location, city, country) => {
                  setSearchQuery(keyword)
                  setLocationFilter(location)
                  setCityFilter(city || "")
                  setCountryFilter(country || "")
                  // Scroll to results after a brief delay for state to update
                  setTimeout(() => {
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                  }, 100)
                }}
                initialKeyword={searchQuery}
                initialLocation={locationFilter}
              />
            </div>

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
                <div className="text-3xl font-bold text-foreground">{platformStats.events || totalEvents || events.length}</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Users size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">{platformStats.attendees > 0 ? platformStats.attendees.toLocaleString() : "0"}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <TrendingUp size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">{platformStats.organizers > 0 ? platformStats.organizers.toLocaleString() : "0"}</div>
                <div className="text-sm text-muted-foreground">Organizers</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2">
                  <Music size={24} />
                </div>
                <div className="text-3xl font-bold text-foreground">{categories.length - 1}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Browse by Category */}
        <section className="py-12 px-4" id="browse">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-foreground text-center">Browse by Category</h2>
            <div className="relative">
              {/* Left fade indicator (mobile only) */}
              <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />

              <div className="flex md:grid md:grid-cols-4 lg:grid-cols-9 gap-3 md:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterType(cat.id)}
                      className={`flex-shrink-0 md:flex-shrink w-[72px] md:w-auto snap-start p-3 md:p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                        filterType === cat.id
                          ? `${cat.color} border-transparent text-white shadow-lg`
                          : "bg-card border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`mx-auto mb-1 md:mb-2 ${filterType === cat.id ? "text-white" : "text-primary"}`} size={24} />
                      <div className={`text-[10px] md:text-xs font-semibold text-center leading-tight ${filterType === cat.id ? "text-white" : "text-foreground"}`}>
                        {cat.name}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Right fade indicator (mobile only) */}
              <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />
            </div>
          </div>
        </section>

        {/* Active Filters Bar */}
        {hasActiveFilters && (
          <section className="py-3 px-4 bg-secondary/30 border-y border-border">
            <div className="max-w-6xl mx-auto flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  &quot;{searchQuery}&quot;
                  <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </span>
              )}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <MapPin size={14} />
                  {locationFilter}
                  <button onClick={() => { setLocationFilter(""); setCityFilter(""); setCountryFilter("") }} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </span>
              )}
              {filterType !== "all" && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === filterType)?.name}
                  <button onClick={() => setFilterType("all")} className="hover:bg-primary/20 rounded-full p-0.5">
                    <X size={14} />
                  </button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-2">
                Clear all
              </button>
            </div>
          </section>
        )}

        {/* Featured Events */}
        <section className="py-16 px-4" ref={resultsRef}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-foreground">Featured Events</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : displayFeaturedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayFeaturedEvents.map((event) => (
                  <EventCard key={event.id} event={apiEventToLegacy(event)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No featured events at the moment.
              </div>
            )}
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
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={apiEventToLegacy(event)} />
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
                    {events.length === 0
                      ? "No events have been created yet. Be the first to create one!"
                      : "We couldn't find any events matching your search criteria. Try adjusting your filters or search terms."
                    }
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
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
