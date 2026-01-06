"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageCircle,
  Clock,
  ArrowLeft
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required"
    if (!formData.message.trim()) newErrors.message = "Message is required"
    if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setSubmitted(true)
      console.log("Contact form submitted:", formData)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
      }, 3000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors mb-6">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
            <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-primary-foreground/90 max-w-2xl">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>

        {/* Contact Content */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Information Cards */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Email Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Send us an email anytime
                  </p>
                  <a href="mailto:support@eventskona.com" className="text-primary hover:underline font-medium">
                    support@eventskona.com
                  </a>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <Phone size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Call Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Mon-Fri from 9am to 6pm
                  </p>
                  <a href="tel:+2348000000000" className="text-primary hover:underline font-medium">
                    +234 800 000 0000
                  </a>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Visit Us</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Come say hello at our office
                  </p>
                  <p className="text-foreground font-medium">
                    123 Event Street, Victoria Island<br />
                    Lagos, Nigeria
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                    <Clock size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Working Hours</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monday - Friday:</span>
                      <span className="text-foreground font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday:</span>
                      <span className="text-foreground font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday:</span>
                      <span className="text-foreground font-medium">Closed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                      <MessageCircle size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Send us a Message</h2>
                      <p className="text-muted-foreground text-sm">Fill out the form below and we'll get back to you</p>
                    </div>
                  </div>

                  {submitted && (
                    <div className="bg-primary/20 border border-primary text-primary px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                      <Send size={20} />
                      <span>Thank you! Your message has been sent successfully. We'll get back to you soon.</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.name ? "border-destructive" : "border-border"
                          }`}
                        />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                            errors.email ? "border-destructive" : "border-border"
                          }`}
                        />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                          errors.subject ? "border-destructive" : "border-border"
                        }`}
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="event">Event Management</option>
                        <option value="billing">Billing & Payments</option>
                        <option value="partnership">Partnership Opportunities</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help you..."
                        rows={6}
                        className={`w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                          errors.message ? "border-destructive" : "border-border"
                        }`}
                      />
                      {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.message.length} characters (minimum 10 required)
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary text-primary-foreground py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send size={20} />
                      Send Message
                    </button>
                  </form>
                </div>

                {/* FAQ Section */}
                <div className="mt-8 bg-muted/50 border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Frequently Asked Questions</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">How quickly will I get a response?</p>
                      <p className="text-muted-foreground">We typically respond within 24 hours during business days.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Can I schedule a call with your team?</p>
                      <p className="text-muted-foreground">Yes! Mention your preferred time in the message and we'll arrange it.</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Do you offer on-site support?</p>
                      <p className="text-muted-foreground">For enterprise clients, we provide on-site support. Contact us for details.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-0 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-xl overflow-hidden border border-border h-96 bg-muted">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7052088469434!2d3.4230!3d6.4281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNDEuMiJOIDPCsDI1JzIyLjgiRQ!5e0!3m2!1sen!2sng!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="EventsKona Office Location"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}