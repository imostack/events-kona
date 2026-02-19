"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SearchBar from "@/components/search-bar"
import EventCard from "@/components/event-card"
import { Search, Plus, Music, Briefcase, Utensils, Palette, Trophy, Cpu, GraduationCap, Calendar, Users, TrendingUp, X, MapPin, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
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

const EVENTS_PER_PAGE = 6

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

// Featured events auto-sliding carousel
function FeaturedSlider({ events }: { events: ApiEvent[] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % events.length)
    }, 5000)
  }

  useEffect(() => {
    if (events.length <= 1) return
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [events.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (idx: number) => {
    setCurrent((idx + events.length) % events.length)
    startTimer()
  }

  if (events.length === 0) return null

  // Single event — just a card, no slider chrome
  if (events.length === 1) {
    return (
      <div className="max-w-sm">
        <EventCard event={apiEventToLegacy(events[0])} />
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Cards — show up to 3 at a time, sliding one at a time */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{ transform: `translateX(calc(-${current * (100 / Math.min(events.length, 3))}% - ${current * 8}px))` }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <EventCard event={apiEventToLegacy(event)} />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next */}
      {events.length > 1 && (
        <>
          <button
            onClick={() => go(current - 1)}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center shadow hover:bg-muted transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => go(current + 1)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-card border border-border rounded-full flex items-center justify-center shadow hover:bg-muted transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-5">
        {events.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
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
  const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE)
  const [loadingMore, setLoadingMore] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // API state
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<ApiEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalEvents, setTotalEvents] = useState(0)
  const [platformStats, setPlatformStats] = useState({ events: 0, organizers: 0, attendees: 0 })

  // Load user preferences
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
          if (prefs.preferredCountry && !countryFilter) setCountryFilter(prefs.preferredCountry as string)
          if (prefs.preferredLocation && !cityFilter) setCityFilter(prefs.preferredLocation as string)
          if (prefs.preferredCategories && (prefs.preferredCategories as string[]).length > 0 && filterType === "all") {
            setFilterType((prefs.preferredCategories as string[])[0])
          }
          if (prefs.showFreeEventsFirst) setShowFreeFirst(true)
        }
      } catch {
        // Silently fail
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

  // Auto-rotate hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Fetch events
  useEffect(() => {
    if (!prefsLoaded) return

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    async function fetchEvents() {
      setIsLoading(true)
      setVisibleCount(EVENTS_PER_PAGE)
      try {
        const params = new URLSearchParams({
          limit: "50",
          sortBy: "startDate",
          sortOrder: "asc",
        })

        const searchTerms = [searchQuery, (!cityFilter && locationFilter) ? locationFilter : ""].filter(Boolean).join(" ").trim()
        if (searchTerms) params.set("search", searchTerms)
        if (cityFilter) params.set("city", cityFilter)
        if (countryFilter) params.set("country", countryFilter)

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
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    fetchEvents()
    return () => { controller.abort(); clearTimeout(timeoutId) }
  }, [searchQuery, locationFilter, cityFilter, countryFilter, prefsLoaded])

  // Fetch featured (promoted) events only — no fallback
  useEffect(() => {
    const controller = new AbortController()

    async function fetchFeatured() {
      try {
        const response = await apiClient<ApiEvent[]>("/api/events?featured=true&limit=10", {
          skipAuth: true,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setFeaturedEvents(response)
      } catch {
        if (!controller.signal.aborted) setFeaturedEvents([])
      }
    }

    fetchFeatured()
    return () => controller.abort()
  }, [])

  // Filter + sort events client-side
  const filteredEvents = events.filter((event) => {
    if (filterType === "all") return true
    return event.category?.slug === filterType ||
           event.category?.name?.toLowerCase() === filterType.toLowerCase()
  }).sort((a, b) => {
    if (showFreeFirst) {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
    }
    return 0
  })

  const visibleEvents = filteredEvents.slice(0, visibleCount)
  const hasMore = visibleCount < filteredEvents.length

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setVisibleCount(prev => prev + EVENTS_PER_PAGE)
      setLoadingMore(false)
    }, 300)
  }

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
        {/* Hero Section */}
        <section className="relative py-16 md:py-20 px-4 overflow-hidden">
          <div className="absolute inset-0">
            {heroImages.map((image, index) => (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                style={{ opacity: currentImageIndex === index ? 1 : 0 }}
              >
                <Image src={image} alt={`Hero background ${index + 1}`} fill priority={index === 0} quality={75} sizes="100vw" className="object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/60 to-primary/50" />
          </div>

          <div className="relative max-w-6xl mx-auto text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 text-balance">Discover Amazing Events</h1>
            <p className="text-lg md:text-2xl mb-8 opacity-90 text-balance">Find, create, and manage events that matter to you</p>

            <div className="mb-8 relative z-20">
              <SearchBar
                onSearch={(keyword, location, city, country) => {
                  setSearchQuery(keyword)
                  setLocationFilter(location)
                  setCityFilter(city || "")
                  setCountryFilter(country || "")
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

            <div className="flex justify-center gap-2 mt-8">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'}`}
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
                <div className="flex items-center justify-center gap-2 text-primary mb-2"><Calendar size={24} /></div>
                <div className="text-3xl font-bold text-foreground">{platformStats.events || totalEvents || events.length}</div>
                <div className="text-sm text-muted-foreground">Active Events</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2"><Users size={24} /></div>
                <div className="text-3xl font-bold text-foreground">{platformStats.attendees.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Attendees</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2"><TrendingUp size={24} /></div>
                <div className="text-3xl font-bold text-foreground">{platformStats.organizers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Organizers</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 text-primary mb-2"><Music size={24} /></div>
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
              {/* Left fade — transparent so it matches any bg */}
              <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white dark:from-background to-transparent z-10 pointer-events-none md:hidden" />

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

              {/* Right fade */}
              <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-background to-transparent z-10 pointer-events-none md:hidden" />
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
                  <button onClick={() => setSearchQuery("")} className="hover:bg-primary/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              )}
              {locationFilter && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  <MapPin size={14} />
                  {locationFilter}
                  <button onClick={() => { setLocationFilter(""); setCityFilter(""); setCountryFilter("") }} className="hover:bg-primary/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              )}
              {filterType !== "all" && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {categories.find(c => c.id === filterType)?.name}
                  <button onClick={() => setFilterType("all")} className="hover:bg-primary/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              )}
              <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground underline ml-2">Clear all</button>
            </div>
          </section>
        )}

        {/* Featured / Promoted Events — only shown when there are promoted events */}
        {(isLoading || featuredEvents.length > 0) && (
          <section className="py-16 px-4" ref={resultsRef}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-3xl font-bold text-foreground">Featured Events</h2>
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">Promoted</span>
              </div>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
                </div>
              ) : (
                <FeaturedSlider events={featuredEvents} />
              )}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        <section className={`py-16 px-4 bg-secondary/30 ${featuredEvents.length === 0 && !isLoading ? "" : ""}`} ref={featuredEvents.length === 0 ? resultsRef : undefined}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                {filterType === "all" ? "Upcoming Events" : `${categories.find(c => c.id === filterType)?.name} Events`}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => <EventCardSkeleton key={i} />)}
              </div>
            ) : visibleEvents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleEvents.map((event) => (
                    <EventCard key={event.id} event={apiEventToLegacy(event)} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {loadingMore ? (
                        <><Loader2 size={18} className="animate-spin" /> Loading...</>
                      ) : (
                        `Load More (${filteredEvents.length - visibleCount} remaining)`
                      )}
                    </button>
                  </div>
                )}
              </>
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
                      <button onClick={clearAllFilters} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
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
