"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { 
  Search,
  ChevronRight,
  BookOpen,
  CreditCard,
  Users,
  Calendar,
  Settings,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle2,
  ArrowLeft
} from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

interface Category {
  id: string
  title: string
  description: string
  icon: any
  articleCount: number
  faqs: FAQItem[]
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const categories: Category[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using EventsKona",
      icon: BookOpen,
      articleCount: 12,
      faqs: [
        {
          question: "How do I create my first event?",
          answer: "To create your first event, log in to your account, click on 'Create Event' in the navigation menu, and fill in the event details including title, description, date, time, location, and pricing. Once you've added all the information, click 'Create Event' to publish it."
        },
        {
          question: "How do I sign up for an EventsKona account?",
          answer: "Click on the 'Sign Up' button in the top right corner, fill in your details including name, email, and password, then verify your email address. You can also sign up using your Google or Facebook account for faster registration."
        },
        {
          question: "What types of events can I create?",
          answer: "You can create various types of events including conferences, workshops, concerts, networking events, fundraisers, festivals, sports events, parties, and virtual/online events. EventsKona supports both free and paid events."
        },
        {
          question: "How do I edit my profile information?",
          answer: "Go to Settings from your dashboard, select 'Account Info' or 'Public Profile', make your changes, and click 'Save Changes'. You can update your name, email, phone number, bio, profile picture, and social media links."
        }
      ]
    },
    {
      id: "payments-pricing",
      title: "Payments & Pricing",
      description: "Understand our fees and payment options",
      icon: CreditCard,
      articleCount: 15,
      faqs: [
        {
          question: "How do I set ticket prices?",
          answer: "When creating an event, scroll to the price section. You can either check 'This is a free event' for free events, or enter your ticket price. Select your preferred currency from the dropdown, and specify the price per ticket."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept payments through Stripe, Paystack, and Flutterwave. Attendees can pay using credit/debit cards, bank transfers, and mobile money depending on their location. You can set your preferred payment processor in the Settings."
        },
        {
          question: "When do I receive my event payments?",
          answer: "Payments are typically processed within 3-5 business days after your event ends. You can set up your payout details in Settings > Payment & Payout to receive funds directly to your bank account."
        },
        {
          question: "Are there any platform fees?",
          answer: "EventsKona charges a small service fee on paid tickets to cover payment processing and platform maintenance. Free events have no fees. Check our pricing page for detailed fee structure."
        }
      ]
    },
    {
      id: "managing-attendees",
      title: "Managing Attendees",
      description: "Track and communicate with your attendees",
      icon: Users,
      articleCount: 10,
      faqs: [
        {
          question: "How do I see who registered for my event?",
          answer: "Go to your event dashboard and click on 'Attendees' or 'Guest List'. You'll see a complete list of registered attendees with their names, email addresses, ticket types, and payment status. You can export this list as CSV for your records."
        },
        {
          question: "Can I send messages to attendees?",
          answer: "Yes! From your event dashboard, you can send email updates to all attendees or specific groups. Use this feature to share important updates, reminders, or last-minute changes about your event."
        },
        {
          question: "How do I check in attendees at the event?",
          answer: "Use the EventsKona Organizer mobile app to scan QR codes on attendee tickets. You can also manually check in attendees from your dashboard by searching their name or ticket number."
        },
        {
          question: "Can I issue refunds to attendees?",
          answer: "Yes, you can process refunds from your event dashboard. Select the attendee, click on their ticket, and choose 'Issue Refund'. The refund will be processed according to your payment processor's timeline."
        }
      ]
    },
    {
      id: "event-management",
      title: "Event Management",
      description: "Tools to manage your events effectively",
      icon: Calendar,
      articleCount: 18,
      faqs: [
        {
          question: "How do I promote my event?",
          answer: "After creating your event, you'll get a unique event link to share. Use the built-in social media sharing buttons, embed the event on your website, or use our promotional tools. You can also boost visibility by adding relevant tags and categories."
        },
        {
          question: "Can I edit an event after publishing?",
          answer: "Yes, you can edit most event details even after publishing. Go to your event dashboard, click 'Edit Event', make your changes, and save. Important changes will trigger notification emails to registered attendees."
        },
        {
          question: "How do I cancel or postpone an event?",
          answer: "From your event dashboard, click on 'More Options' and select 'Cancel Event' or 'Postpone Event'. You'll be prompted to notify attendees and can choose to offer refunds. Always communicate changes clearly to your attendees."
        },
        {
          question: "Can I create recurring events?",
          answer: "Yes! When creating an event, look for the 'Recurring Event' option. You can set daily, weekly, or monthly recurrence patterns. Each occurrence will have its own registration and management options."
        }
      ]
    },
    {
      id: "account-settings",
      title: "Account & Settings",
      description: "Manage your account preferences",
      icon: Settings,
      articleCount: 8,
      faqs: [
        {
          question: "How do I change my password?",
          answer: "Go to Settings, select 'Password', enter your current password and new password, then click 'Update Password'. We recommend using a strong password with at least 8 characters including numbers and symbols."
        },
        {
          question: "How do I update my payment information?",
          answer: "Navigate to Settings > Payment & Payout. Here you can update your default currency, payment processor, and bank account details for receiving payouts from your events."
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account from Settings > Privacy & Security. This action is permanent and will delete all your data including events and attendee information. Make sure to download any important data before deletion."
        },
        {
          question: "How do I manage notification preferences?",
          answer: "Go to Settings > Notifications to customize email, SMS, and push notification preferences. You can choose what types of updates you want to receive and how often."
        }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      description: "Common issues and solutions",
      icon: HelpCircle,
      articleCount: 14,
      faqs: [
        {
          question: "Why can't I see my event after publishing?",
          answer: "Check that your event status is set to 'Published' and not 'Draft'. Also verify that the event date hasn't passed. If the issue persists, try clearing your browser cache or contact our support team."
        },
        {
          question: "Payment failed during checkout, what should I do?",
          answer: "Payment failures can occur due to insufficient funds, incorrect card details, or bank restrictions. Ask attendees to verify their payment information and try again. If the problem continues, they should contact their bank or try a different payment method."
        },
        {
          question: "I'm not receiving notification emails",
          answer: "Check your spam/junk folder first. Then go to Settings > Notifications to ensure email notifications are enabled. Add support@eventskona.com to your contacts to prevent future emails from going to spam."
        },
        {
          question: "The event page is not loading properly",
          answer: "Try refreshing the page, clearing your browser cache, or accessing the page from a different browser. If you're using an ad blocker, try disabling it. Contact support if the issue persists."
        }
      ]
    }
  ]

  const filteredCategories = searchQuery
    ? categories.filter(cat => 
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.faqs.some(faq => 
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : categories

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory)

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
            <h1 className="text-5xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Search our knowledge base or browse categories below
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <section className="py-8 px-4 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/contact">
                <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Email Support</h3>
                      <p className="text-sm text-muted-foreground">Get help via email</p>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Live Chat</h3>
                    <p className="text-sm text-muted-foreground">Chat with our team</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Call Us</h3>
                    <p className="text-sm text-muted-foreground">+234 800 000 0000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories or Selected Category */}
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            {!selectedCategory ? (
              <>
                <h2 className="text-3xl font-bold text-foreground mb-8">Browse by Category</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <category.icon size={24} />
                        </div>
                        <ChevronRight className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{category.title}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                      <p className="text-primary text-sm font-medium">{category.articleCount} articles</p>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
                >
                  <ArrowLeft size={20} />
                  Back to Categories
                </button>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    {selectedCategoryData && <selectedCategoryData.icon size={32} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">{selectedCategoryData?.title}</h2>
                    <p className="text-muted-foreground">{selectedCategoryData?.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedCategoryData?.faqs.map((faq, index) => (
                    <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <CheckCircle2 className="text-primary flex-shrink-0" size={20} />
                          <span className="font-semibold text-foreground">{faq.question}</span>
                        </div>
                        <ChevronDown 
                          className={`text-muted-foreground transition-transform flex-shrink-0 ${expandedFAQ === index ? 'rotate-180' : ''}`} 
                          size={20} 
                        />
                      </button>
                      {expandedFAQ === index && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="pl-8 text-muted-foreground">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Still Need Help Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <button className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center">
                  <Mail size={20} />
                  Contact Support
                </button>
              </Link>
              <button className="border border-border bg-background text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center gap-2 justify-center">
                <MessageSquare size={20} />
                Start Live Chat
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}