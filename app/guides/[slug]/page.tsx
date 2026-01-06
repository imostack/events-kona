"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { 
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react"

interface GuideContent {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  author: string
  publishDate: string
  lastUpdated: string
  tableOfContents: { id: string; title: string }[]
  content: {
    type: "heading" | "paragraph" | "list" | "tip" | "warning" | "info" | "code"
    content: string | string[]
    level?: number
  }[]
  relatedGuides: { slug: string; title: string }[]
}

export default function GuideArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [showShareMenu, setShowShareMenu] = useState(false)

  // Hardcoded guide content - Add more guides here
  const guidesData: Record<string, GuideContent> = {
    "creating-your-first-event": {
      slug: "creating-your-first-event",
      title: "Complete Guide to Creating Your First Event",
      excerpt: "Learn how to create, customize, and launch your first event on EventsKona.",
      category: "Getting Started",
      readTime: "10 min read",
      author: "EventsKona Team",
      publishDate: "January 5, 2025",
      lastUpdated: "January 5, 2025",
      tableOfContents: [
        { id: "getting-started", title: "Getting Started" },
        { id: "basic-info", title: "Setting Up Basic Information" },
        { id: "location-format", title: "Choosing Your Event Format" },
        { id: "ticketing", title: "Creating Tickets" },
        { id: "promotion", title: "Promoting Your Event" },
        { id: "launch", title: "Launching Your Event" }
      ],
      content: [
        { type: "heading", content: "Getting Started", level: 2 },
        { type: "paragraph", content: "Creating your first event on EventsKona is straightforward and intuitive. Whether you're hosting a small workshop or a large conference, our platform provides all the tools you need to succeed. This guide will walk you through every step of the process." },
        { type: "tip", content: "Before you start, gather all necessary information: event date, venue details, ticket pricing, and promotional materials. Having everything ready will make the process much smoother." },
        
        { type: "heading", content: "Setting Up Basic Information", level: 2 },
        { type: "paragraph", content: "The first step in creating your event is providing basic information. This includes your event title, category, and description." },
        { type: "heading", content: "Event Title", level: 3 },
        { type: "paragraph", content: "Your event title is the first thing potential attendees see. Make it clear, concise, and compelling. You have 75 characters to capture attention." },
        { type: "list", content: [
          "Keep it under 75 characters",
          "Include the event type (e.g., 'Workshop', 'Festival', 'Conference')",
          "Add the year if it's an annual event",
          "Avoid excessive punctuation or ALL CAPS",
          "Be specific about what attendees will experience"
        ]},
        { type: "info", content: "Good example: 'Lagos Tech Summit 2025 - Innovation & Networking'. Bad example: 'AMAZING EVENT YOU CANT MISS!!!'" },
        
        { type: "heading", content: "Choosing Your Event Format", level: 2 },
        { type: "paragraph", content: "EventsKona supports three event formats: Venue (in-person), Online (virtual), and Hybrid (both). Each format has unique considerations." },
        { type: "heading", content: "Venue Events", level: 3 },
        { type: "paragraph", content: "For in-person events, you'll need to provide complete venue information including street address, city, and country. Our system automatically generates a map for attendees." },
        { type: "list", content: [
          "Provide the full venue name and address",
          "Verify the location on the map preview",
          "Add parking and accessibility information in the description",
          "Consider capacity limits when setting ticket quantities"
        ]},
        
        { type: "heading", content: "Online Events", level: 3 },
        { type: "paragraph", content: "Virtual events require a streaming link (Zoom, Google Meet, YouTube Live, etc.). This link is only shared with registered attendees." },
        { type: "warning", content: "Never share your meeting link publicly in the event description. EventsKona automatically sends it to ticket holders after registration." },
        
        { type: "heading", content: "Hybrid Events", level: 3 },
        { type: "paragraph", content: "Hybrid events combine both formats, allowing attendees to participate either in-person or online. This maximizes reach but requires more planning." },
        
        { type: "heading", content: "Creating Tickets", level: 2 },
        { type: "paragraph", content: "Ticket setup is crucial for event success. EventsKona supports multiple ticket types, pricing strategies, and promotional codes." },
        { type: "heading", content: "Ticket Types", level: 3 },
        { type: "list", content: [
          "Regular/General Admission - Standard entry tickets",
          "VIP Pass - Premium experience with added benefits",
          "Custom Tickets - Create your own (Early Bird, Student Pass, Group Tickets, etc.)"
        ]},
        { type: "tip", content: "Create multiple ticket tiers to cater to different attendee segments. Early bird tickets create urgency and reward early registrations." },
        
        { type: "heading", content: "Pricing Strategy", level: 3 },
        { type: "paragraph", content: "Setting the right price is both an art and science. Consider your costs, target audience, and competition." },
        { type: "list", content: [
          "Research similar events in your area",
          "Factor in all costs (venue, catering, marketing)",
          "Consider offering free tickets for media or influencers",
          "Use tiered pricing (Early Bird, Regular, Last Minute)",
          "Test different price points with small audiences first"
        ]},
        
        { type: "heading", content: "Promoting Your Event", level: 2 },
        { type: "paragraph", content: "Creating a great event is only half the battle - you need to get people to attend. EventsKona offers promotional packages to boost visibility." },
        { type: "info", content: "Our promotion packages include featured placement, email marketing to thousands of subscribers, and social media exposure. Events with promotion typically sell 3-5x more tickets." },
        { type: "list", content: [
          "Basic Boost (₦15,000) - 7 days of promotion",
          "Premium Promotion (₦35,000) - 14 days with priority ranking",
          "Ultimate Package (₦75,000) - 30 days with dedicated support"
        ]},
        
        { type: "heading", content: "Launching Your Event", level: 2 },
        { type: "paragraph", content: "Before publishing, review all details carefully. Once live, your event will be visible to thousands of potential attendees on EventsKona." },
        { type: "heading", content: "Pre-Launch Checklist", level: 3 },
        { type: "list", content: [
          "Verify all dates and times are correct",
          "Double-check ticket prices and quantities",
          "Review event description for typos",
          "Ensure contact information is accurate",
          "Test the registration process yourself",
          "Prepare social media announcements",
          "Set up event reminders and confirmation emails"
        ]},
        { type: "paragraph", content: "After publishing, share your event link across all your channels. The more you promote, the more successful your event will be." },
        { type: "tip", content: "Create a sense of urgency by showing ticket availability. EventsKona can display remaining tickets to encourage quick decisions." }
      ],
      relatedGuides: [
        { slug: "event-pricing-strategies", title: "Event Pricing Strategies That Work" },
        { slug: "promote-your-event", title: "How to Promote Your Event Like a Pro" },
        { slug: "choosing-event-format", title: "Virtual, Hybrid, or In-Person: Choosing the Right Format" }
      ]
    },
    "event-pricing-strategies": {
      slug: "event-pricing-strategies",
      title: "Event Pricing Strategies That Work",
      excerpt: "Discover proven pricing strategies to maximize ticket sales and revenue.",
      category: "Ticketing & Pricing",
      readTime: "8 min read",
      author: "EventsKona Team",
      publishDate: "January 4, 2025",
      lastUpdated: "January 4, 2025",
      tableOfContents: [
        { id: "psychology", title: "Psychology of Pricing" },
        { id: "tiered", title: "Tiered Pricing Strategy" },
        { id: "dynamic", title: "Dynamic Pricing" },
        { id: "discounts", title: "Strategic Discounts" }
      ],
      content: [
        { type: "heading", content: "Psychology of Pricing", level: 2 },
        { type: "paragraph", content: "Pricing isn't just about covering costs - it's about perceived value. The right price signals quality while remaining accessible to your target audience." },
        { type: "tip", content: "Price endings matter! ₦4,999 feels significantly cheaper than ₦5,000 even though it's only ₦1 difference. Use this psychological trick to your advantage." },
        
        { type: "heading", content: "Tiered Pricing Strategy", level: 2 },
        { type: "paragraph", content: "Offering multiple ticket tiers allows attendees to choose based on their budget and desired experience. This strategy maximizes revenue across different segments." },
        { type: "list", content: [
          "Early Bird - 30-40% discount, limited quantity, creates urgency",
          "Regular Price - Standard offering for most attendees",
          "VIP/Premium - 2-3x regular price with exclusive benefits",
          "Last Minute - Slight increase to capture late deciders"
        ]},
        
        { type: "heading", content: "Dynamic Pricing", level: 2 },
        { type: "paragraph", content: "Adjust prices based on demand, time remaining, and inventory levels. Popular in the airline and hotel industries, this strategy is increasingly used for events." },
        { type: "warning", content: "Be transparent about price changes. Announce that prices will increase on specific dates to avoid frustrating attendees." },
        
        { type: "heading", content: "Strategic Discounts", level: 2 },
        { type: "paragraph", content: "Discounts can drive sales when used strategically, but overuse devalues your event. Use them purposefully." },
        { type: "list", content: [
          "Group discounts (4+ tickets) - Increases attendance",
          "Student/Senior discounts - Expands accessibility",
          "Partner/Sponsor codes - Leverages existing networks",
          "Referral bonuses - Turns attendees into promoters"
        ]}
      ],
      relatedGuides: [
        { slug: "creating-your-first-event", title: "Complete Guide to Creating Your First Event" },
        { slug: "maximizing-event-revenue", title: "Maximizing Event Revenue: Beyond Ticket Sales" }
      ]
    }
  }

  const guide = guidesData[params.slug]

  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Guide not found</h1>
            <Link href="/guides">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90">
                Back to Guides
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert("Link copied to clipboard!")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="bg-card border-b px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/guides">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={20} />
                Back to Guides
              </button>
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <article className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Meta Info */}
            <div className="mb-6">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                {guide.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">{guide.title}</h1>

            {/* Author & Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                  {guide.author.charAt(0)}
                </div>
                <span className="font-semibold text-foreground">{guide.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{guide.publishDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>{guide.readTime}</span>
              </div>
              <button 
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Table of Contents - Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-4 bg-card border rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <BookOpen size={18} />
                    On This Page
                  </h3>
                  <nav className="space-y-2">
                    {guide.tableOfContents.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="prose prose-lg max-w-none">
                  {guide.content.map((block, index) => {
                    switch (block.type) {
                      case "heading":
                        const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements
                        const headingId = block.content.toString().toLowerCase().replace(/\s+/g, "-")
                        return (
                          <HeadingTag
                            key={index}
                            id={headingId}
                            className={`font-bold text-foreground mt-8 mb-4 ${
                              block.level === 2 ? "text-3xl" : "text-2xl"
                            }`}
                          >
                            {block.content}
                          </HeadingTag>
                        )
                      
                      case "paragraph":
                        return (
                          <p key={index} className="text-foreground/80 leading-relaxed mb-6">
                            {block.content}
                          </p>
                        )
                      
                      case "list":
                        return (
                          <ul key={index} className="space-y-2 mb-6 ml-6">
                            {(block.content as string[]).map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-foreground/80">
                                <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        )
                      
                      case "tip":
                        return (
                          <div key={index} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <p className="font-semibold text-blue-900 mb-1">Pro Tip</p>
                                <p className="text-blue-800 text-sm">{block.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case "warning":
                        return (
                          <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-6">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <p className="font-semibold text-yellow-900 mb-1">Important</p>
                                <p className="text-yellow-800 text-sm">{block.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      
                      case "info":
                        return (
                          <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-6">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="text-green-600 flex-shrink-0 mt-1" size={20} />
                              <div>
                                <p className="font-semibold text-green-900 mb-1">Good to Know</p>
                                <p className="text-green-800 text-sm">{block.content}</p>
                              </div>
                            </div>
                          </div>
                        )
                      
                      default:
                        return null
                    }
                  })}
                </div>

                {/* Related Guides */}
                {guide.relatedGuides.length > 0 && (
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Related Guides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guide.relatedGuides.map((related) => (
                        <Link key={related.slug} href={`/guides/${related.slug}`}>
                          <div className="bg-card border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all cursor-pointer">
                            <h4 className="font-semibold text-foreground mb-2">{related.title}</h4>
                            <span className="text-primary text-sm font-medium flex items-center gap-1">
                              Read guide <ArrowRight size={14} />
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Ready to Create Your Event?</h3>
                  <p className="mb-6 text-primary-foreground/90">
                    Put this guide into action and start creating amazing events today.
                  </p>
                  <Link href="/create-event">
                    <button className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-white/90 transition-colors">
                      Create Event Now
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}