"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHeader from "@/components/page-header"
import {
  Search,
  BookOpen,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Megaphone,
  ShieldCheck,
  ArrowRight,
  Clock,
  Star,
  Filter
} from "lucide-react"

interface Guide {
  id: string
  title: string
  excerpt: string
  category: string
  readTime: string
  featured: boolean
  icon: any
  slug: string
}

export default function GuidesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", label: "All Guides" },
    { id: "getting-started", label: "Getting Started" },
    { id: "event-planning", label: "Event Planning" },
    { id: "marketing", label: "Marketing & Promotion" },
    { id: "ticketing", label: "Ticketing & Pricing" },
    { id: "best-practices", label: "Best Practices" },
    { id: "platform", label: "Platform Features" }
  ]

  const guides: Guide[] = [
    {
      id: "1",
      title: "Complete Guide to Creating Your First Event",
      excerpt: "Learn how to create, customize, and launch your first event on EventsKona. Step-by-step walkthrough covering everything from basic setup to advanced features.",
      category: "getting-started",
      readTime: "10 min read",
      featured: true,
      icon: Calendar,
      slug: "creating-your-first-event"
    },
    {
      id: "2",
      title: "Event Pricing Strategies That Work",
      excerpt: "Discover proven pricing strategies to maximize ticket sales and revenue. Learn about early bird pricing, tiered tickets, group discounts, and dynamic pricing.",
      category: "ticketing",
      readTime: "8 min read",
      featured: true,
      icon: DollarSign,
      slug: "event-pricing-strategies"
    },
    {
      id: "3",
      title: "How to Promote Your Event Like a Pro",
      excerpt: "Master event marketing with our comprehensive promotion guide. From social media strategies to email campaigns, learn how to reach your target audience effectively.",
      category: "marketing",
      readTime: "12 min read",
      featured: true,
      icon: Megaphone,
      slug: "promote-your-event"
    },
    {
      id: "4",
      title: "Building an Engaged Community Around Your Events",
      excerpt: "Turn one-time attendees into loyal followers. Learn community-building strategies, engagement tactics, and how to create memorable experiences that keep people coming back.",
      category: "best-practices",
      readTime: "7 min read",
      featured: false,
      icon: Users,
      slug: "building-event-community"
    },
    {
      id: "5",
      title: "Maximizing Event Revenue: Beyond Ticket Sales",
      excerpt: "Explore additional revenue streams for your events including sponsorships, merchandise, VIP experiences, and add-ons. Learn how top organizers monetize their events.",
      category: "ticketing",
      readTime: "9 min read",
      featured: false,
      icon: TrendingUp,
      slug: "maximizing-event-revenue"
    },
    {
      id: "6",
      title: "Virtual, Hybrid, or In-Person: Choosing the Right Format",
      excerpt: "Understand the pros and cons of each event format. Learn when to go virtual, how to run successful hybrid events, and tips for engaging in-person experiences.",
      category: "event-planning",
      readTime: "6 min read",
      featured: false,
      icon: Calendar,
      slug: "choosing-event-format"
    },
    {
      id: "7",
      title: "Event Security and Safety Best Practices",
      excerpt: "Ensure your attendees' safety with our comprehensive security guide. Covers crowd management, emergency protocols, data protection, and payment security.",
      category: "best-practices",
      readTime: "10 min read",
      featured: false,
      icon: ShieldCheck,
      slug: "event-security-safety"
    },
    {
      id: "8",
      title: "Using EventsKona Analytics to Grow Your Events",
      excerpt: "Make data-driven decisions with EventsKona's analytics tools. Learn how to track ticket sales, understand attendee behavior, and optimize your marketing efforts.",
      category: "platform",
      readTime: "8 min read",
      featured: false,
      icon: TrendingUp,
      slug: "using-analytics"
    },
    {
      id: "9",
      title: "Creating Compelling Event Descriptions That Convert",
      excerpt: "Master the art of writing event descriptions that drive ticket sales. Learn copywriting techniques, what information to include, and how to create urgency.",
      category: "marketing",
      readTime: "5 min read",
      featured: false,
      icon: BookOpen,
      slug: "compelling-event-descriptions"
    },
    {
      id: "10",
      title: "Managing Attendees: Check-in to Follow-up",
      excerpt: "Streamline your event management from registration to post-event engagement. Learn best practices for check-in, communication, and building lasting relationships.",
      category: "event-planning",
      readTime: "11 min read",
      featured: false,
      icon: Users,
      slug: "managing-attendees"
    },
    {
      id: "11",
      title: "Event Promotion Timeline: When to Do What",
      excerpt: "Follow our proven promotional timeline to maximize attendance. Learn exactly when to announce, when to push marketing, and how to create last-minute urgency.",
      category: "marketing",
      readTime: "7 min read",
      featured: false,
      icon: Clock,
      slug: "promotion-timeline"
    },
    {
      id: "12",
      title: "Payment Processing and Payouts: Everything You Need to Know",
      excerpt: "Understand how payments work on EventsKona. Learn about fees, payout schedules, refund policies, and how to set up your payment accounts correctly.",
      category: "platform",
      readTime: "6 min read",
      featured: false,
      icon: DollarSign,
      slug: "payment-processing"
    }
  ]

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || guide.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const featuredGuides = guides.filter(g => g.featured)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader
          title="Event Planning Guides"
          description="Everything you need to create, promote, and manage successful events. Learn from experts and grow your event business."
          icon={BookOpen}
        />

        {/* Search Section */}
        <section className="bg-secondary/30 border-b border-border py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 px-4 border-b border-border bg-card">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-muted-foreground" size={20} />
              <span className="font-semibold text-foreground">Browse by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border text-foreground hover:border-primary"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Guides */}
        {selectedCategory === "all" && !searchQuery && (
          <section className="py-12 px-4 bg-muted/30">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                <Star className="text-yellow-500" size={24} fill="currentColor" />
                <h2 className="text-3xl font-bold text-foreground">Featured Guides</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredGuides.map((guide) => (
                  <Link key={guide.id} href={`/guides/${guide.slug}`}>
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                        <guide.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-3">{guide.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{guide.excerpt}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock size={14} />
                          {guide.readTime}
                        </span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          Read more <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Guides */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-foreground">
                {selectedCategory === "all" ? "All Guides" : categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-muted-foreground">
                {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"}
              </p>
            </div>

            {filteredGuides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGuides.map((guide) => (
                  <Link key={guide.id} href={`/guides/${guide.slug}`}>
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary transition-all cursor-pointer h-full flex flex-col">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                        <guide.icon size={24} />
                      </div>
                      
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {categories.find(c => c.id === guide.category)?.label}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-foreground mb-3">{guide.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">{guide.excerpt}</p>
                      
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-border">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock size={14} />
                          {guide.readTime}
                        </span>
                        <span className="text-primary font-semibold flex items-center gap-1">
                          Read <ArrowRight size={16} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-muted-foreground" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No guides found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or browse all categories
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                  }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Event?</h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Put these guides into action. Start creating amazing events today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-event">
                <button className="bg-white text-primary px-8 py-4 rounded-lg font-bold hover:bg-white/90 transition-colors">
                  Create Your Event
                </button>
              </Link>
              <Link href="/help-center">
                <button className="border-2 border-white text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-white/10 transition-colors">
                  Visit Help Center
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}