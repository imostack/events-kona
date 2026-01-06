"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { 
  Search,
  ChevronDown,
  HelpCircle,
  Mail,
  MessageSquare,
  ArrowLeft,
  Filter
} from "lucide-react"

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)
  const [selectedFilter, setSelectedFilter] = useState("all")

  const faqs: FAQ[] = [
    // General
    {
      id: 1,
      question: "What is EventsKona?",
      answer: "EventsKona is a comprehensive event management platform that helps you create, promote, and manage events of all sizes. Whether you're hosting a small workshop or a large conference, our platform provides all the tools you need to make your event successful.",
      category: "general"
    },
    {
      id: 2,
      question: "Is EventsKona free to use?",
      answer: "EventsKona is free for organizers creating free events. For paid events, we charge a small service fee on ticket sales to cover platform and payment processing costs. There are no upfront costs or subscription fees to get started.",
      category: "general"
    },
    {
      id: 3,
      question: "What countries does EventsKona support?",
      answer: "EventsKona currently supports Nigeria, Ghana, and Kenya with localized payment options. We're actively expanding to more African countries and will support global events soon. You can create events in multiple currencies including NGN, GHS, KES, USD, EUR, and GBP.",
      category: "general"
    },
    {
      id: 4,
      question: "Can I use EventsKona for virtual events?",
      answer: "Yes! EventsKona fully supports virtual and hybrid events. You can add streaming links, video conferencing details, and virtual event instructions. Our platform works seamlessly for in-person, virtual, and hybrid event formats.",
      category: "general"
    },

    // Account & Registration
    {
      id: 5,
      question: "How do I create an account?",
      answer: "Click the 'Get Started' button at the top right of the page. Fill in your name, email, and password, then verify your email address. You can also sign up using your Google or Facebook account for faster registration.",
      category: "account"
    },
    {
      id: 6,
      question: "I forgot my password. What should I do?",
      answer: "Click on 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. Follow the instructions in the email to create a new password. If you don't receive the email, check your spam folder.",
      category: "account"
    },
    {
      id: 7,
      question: "Can I change my email address?",
      answer: "Yes, go to Settings > Account Info to update your email address. You'll need to verify your new email address before the change takes effect. Make sure to use an email you have access to.",
      category: "account"
    },
    {
      id: 8,
      question: "How do I delete my account?",
      answer: "Navigate to Settings > Privacy & Security and scroll to the 'Danger Zone' section. Click 'Delete Account' and confirm your decision. Note that this action is permanent and will delete all your events, attendee data, and account information.",
      category: "account"
    },

    // Creating Events
    {
      id: 9,
      question: "How do I create an event?",
      answer: "After logging in, click 'Create Event' in the navigation menu. Fill in your event details including title, description, date, time, location, and pricing. Upload an event image, select a category, and click 'Create Event' to publish. You can save as draft if you want to finish later.",
      category: "events"
    },
    {
      id: 10,
      question: "Can I edit my event after publishing?",
      answer: "Yes, you can edit most event details even after publishing. Go to your event dashboard, click 'Edit Event', make your changes, and save. Registered attendees will be notified of major changes like date, time, or location updates.",
      category: "events"
    },
    {
      id: 11,
      question: "What image formats are supported for event posters?",
      answer: "We support PNG, JPG, and GIF formats up to 10MB in size. For best results, use high-resolution images with a 16:9 aspect ratio (1920x1080 pixels recommended). Images will be optimized automatically for web and mobile viewing.",
      category: "events"
    },
    {
      id: 12,
      question: "Can I create recurring events?",
      answer: "Yes! When creating an event, enable the 'Recurring Event' option and set your recurrence pattern (daily, weekly, or monthly). Each occurrence will have its own registration list but share the same event details unless you customize them individually.",
      category: "events"
    },
    {
      id: 13,
      question: "How do I cancel or postpone an event?",
      answer: "From your event dashboard, click 'More Options' and select 'Cancel Event' or 'Postpone Event'. You'll be prompted to send notifications to attendees and can choose to offer full or partial refunds. Always communicate clearly with your attendees about changes.",
      category: "events"
    },

    // Tickets & Pricing
    {
      id: 14,
      question: "How do I set ticket prices?",
      answer: "When creating your event, scroll to the pricing section. Choose your currency, then enter the ticket price. You can create multiple ticket types with different prices (early bird, VIP, general admission, etc.). Check 'This is a free event' if you're not charging for tickets.",
      category: "tickets"
    },
    {
      id: 15,
      question: "Can I offer different ticket types?",
      answer: "Yes, you can create multiple ticket tiers for your event with different prices and benefits. For example, you can offer early bird tickets, VIP packages, general admission, and group discounts. Each ticket type can have its own availability limit.",
      category: "tickets"
    },
    {
      id: 16,
      question: "What currencies can I sell tickets in?",
      answer: "EventsKona supports Nigerian Naira (NGN), Ghanaian Cedi (GHS), Kenyan Shilling (KES), US Dollar (USD), Euro (EUR), and British Pound (GBP). You can select your preferred currency when creating an event or set a default in your payment settings.",
      category: "tickets"
    },
    {
      id: 17,
      question: "Can I offer promotional codes or discounts?",
      answer: "Yes, you can create promotional codes for percentage or fixed amount discounts. Set usage limits, expiration dates, and eligibility criteria. Track redemptions from your event dashboard to measure the effectiveness of your promotions.",
      category: "tickets"
    },

    // Payments & Payouts
    {
      id: 18,
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, Mastercard, Verve), bank transfers, and mobile money through our payment partners: Stripe, Paystack, and Flutterwave. Available payment methods vary by country and attendee location.",
      category: "payments"
    },
    {
      id: 19,
      question: "When will I receive my event earnings?",
      answer: "Payments are typically processed 3-5 business days after your event concludes. You must have valid payout details set up in Settings > Payment & Payout. Funds are transferred directly to your bank account or mobile money wallet.",
      category: "payments"
    },
    {
      id: 20,
      question: "What are the platform fees?",
      answer: "EventsKona charges a service fee on paid ticket sales to cover platform and payment processing costs. Free events have no fees. The exact percentage depends on your location and payment method. Check our pricing page for detailed information.",
      category: "payments"
    },
    {
      id: 21,
      question: "How do I set up my payout account?",
      answer: "Go to Settings > Payment & Payout, select your payment processor, and enter your bank account details or mobile money information. Verify your information carefully to avoid payout delays. You'll need to complete this before receiving your first payment.",
      category: "payments"
    },
    {
      id: 22,
      question: "Can I issue refunds to attendees?",
      answer: "Yes, you can process full or partial refunds from your event dashboard. Select the attendee, view their ticket, and click 'Issue Refund'. Refunds are processed through the original payment method within 5-10 business days depending on the payment processor.",
      category: "payments"
    },

    // Managing Attendees
    {
      id: 23,
      question: "How do I view my attendee list?",
      answer: "Go to your event dashboard and click on 'Attendees' or 'Guest List'. You'll see all registered attendees with their details, ticket types, and payment status. You can search, filter, and export the list as CSV for external use.",
      category: "attendees"
    },
    {
      id: 24,
      question: "Can I communicate with attendees?",
      answer: "Yes! From your event dashboard, you can send email updates to all attendees or specific groups. Use this to share important information, reminders, or last-minute changes. Attendees can also contact you through the platform's messaging system.",
      category: "attendees"
    },
    {
      id: 25,
      question: "How does check-in work?",
      answer: "Use the EventsKona Organizer mobile app to scan QR codes on attendee tickets at the event entrance. You can also manually check in attendees from your dashboard by searching their name or ticket confirmation number. Track real-time attendance from your phone or computer.",
      category: "attendees"
    },
    {
      id: 26,
      question: "What happens if an attendee loses their ticket?",
      answer: "Attendees can retrieve their tickets by logging into their EventsKona account or checking their email for the confirmation. You can also look them up in your attendee list and manually check them in. Each ticket has a unique QR code that can only be used once.",
      category: "attendees"
    },

    // Promotion & Marketing
    {
      id: 27,
      question: "How can I promote my event?",
      answer: "Share your unique event link on social media, email it to your contacts, or embed it on your website. Use our built-in social sharing tools, create promotional codes, and optimize your event listing with relevant keywords and categories for better discoverability.",
      category: "promotion"
    },
    {
      id: 28,
      question: "Can I embed my event on my website?",
      answer: "Yes! Copy the embed code from your event dashboard and paste it into your website's HTML. The embedded widget will show event details and allow visitors to register without leaving your site. The widget is fully responsive and mobile-friendly.",
      category: "promotion"
    },
    {
      id: 29,
      question: "Does EventsKona help with event discovery?",
      answer: "Yes, published events appear in our event discovery feed where users can browse by category, location, and date. Events with complete information, high-quality images, and relevant tags get better visibility. Active promotion increases your event's discoverability.",
      category: "promotion"
    },

    // Technical Support
    {
      id: 30,
      question: "What browsers are supported?",
      answer: "EventsKona works best on the latest versions of Chrome, Firefox, Safari, and Edge. We also support mobile browsers on iOS and Android. For the best experience, keep your browser updated to the latest version.",
      category: "technical"
    },
    {
      id: 31,
      question: "Is there a mobile app?",
      answer: "We have only web version available for now. Sign up to stay updated when our mobile app launches.",
      category: "technical"
    },
    {
      id: 32,
      question: "How do I report a bug or issue?",
      answer: "If you encounter a technical issue, please contact our support team at support@eventskona.com with a detailed description of the problem, including screenshots if possible. We typically respond within 24 hours and prioritize critical issues.",
      category: "technical"
    }
  ]

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General" },
    { id: "account", label: "Account & Registration" },
    { id: "events", label: "Creating Events" },
    { id: "tickets", label: "Tickets & Pricing" },
    { id: "payments", label: "Payments & Payouts" },
    { id: "attendees", label: "Managing Attendees" },
    { id: "promotion", label: "Promotion & Marketing" },
    { id: "technical", label: "Technical Support" }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === "all" || faq.category === selectedFilter
    return matchesSearch && matchesFilter
  })

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors mb-6 mx-auto">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
            <div className="w-16 h-16 bg-primary-foreground/10 text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-6">
              <HelpCircle size={32} />
            </div>
            <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Find answers to common questions about EventsKona
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <section className="py-8 px-4 border-b border-border bg-card">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-muted-foreground" size={20} />
              <span className="font-semibold text-foreground">Filter by category:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedFilter(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === category.id
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

        {/* FAQ Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {filteredFAQs.length > 0 ? (
              <>
                <div className="mb-6">
                  <p className="text-muted-foreground">
                    Showing {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'}
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>

                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-colors"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-semibold text-foreground text-lg pr-4">
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`text-muted-foreground transition-transform flex-shrink-0 ${
                            expandedFAQ === faq.id ? "rotate-180" : ""
                          }`}
                          size={24}
                        />
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-6">
                          <div className="pt-4 border-t border-border">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-muted-foreground" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any questions matching your search. Try different keywords or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedFilter("all")
                  }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Popular Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Getting Started", count: 8, filter: "general" },
                { title: "Event Creation", count: 5, filter: "events" },
                { title: "Payments", count: 5, filter: "payments" },
                { title: "Attendee Management", count: 4, filter: "attendees" }
              ].map((topic) => (
                <button
                  key={topic.filter}
                  onClick={() => {
                    setSelectedFilter(topic.filter)
                    window.scrollTo({ top: 400, behavior: "smooth" })
                  }}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-left"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-2">{topic.title}</h3>
                  <p className="text-sm text-muted-foreground">{topic.count} questions</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Still Need Help Section */}
        <section className="py-16 px-4 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact-us">
                <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center">
                  <Mail size={20} />
                  Contact Support
                </button>
              </Link>
              <Link href="/help-center">
                <button className="border border-border bg-card text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2 justify-center">
                  <MessageSquare size={20} />
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