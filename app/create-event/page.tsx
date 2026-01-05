"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Upload, ArrowLeft, MapPin } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/signup")
    }
  }, [user, router])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    category: "music",
    image: null as File | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Event title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.price) newErrors.price = "Price is required"
    if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = "Price must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          title: "",
          description: "",
          date: "",
          time: "",
          location: "",
          price: "",
          category: "music",
          image: null,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
    }
  }

  const getMapUrl = (location: string) => {
    if (!location) return ""
    return `https://www.google.com/maps/embed/v1/place?key=MOCK_KEY&q=${encodeURIComponent(location)}`
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Back Button */}
        <div className="bg-card border-b border-border px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </Link>
          </div>
        </div>

        {/* Form Section */}
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Create Your Event</h1>
            <p className="text-muted-foreground mb-8">Fill in the details below to create and share your event</p>

            {submitted && (
              <div className="bg-primary/20 border border-primary text-primary px-4 py-3 rounded-lg mb-6">
                ✓ Event created successfully! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter event title"
                  className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your event in detail"
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none ${
                    errors.description ? "border-destructive" : "border-border"
                  }`}
                />
                {errors.description && <p className="text-destructive text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.date ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.date && <p className="text-destructive text-sm mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.time ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.time && <p className="text-destructive text-sm mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter event venue or address"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.location ? "border-destructive" : "border-border"
                    }`}
                  />
                </div>
                {errors.location && <p className="text-destructive text-sm mt-1">{errors.location}</p>}

                {formData.location.length > 3 && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-border h-48 bg-muted flex items-center justify-center relative">
                    <iframe
  src={`https://www.google.com/maps?q=${encodeURIComponent(
    formData.location
  )}&output=embed`}
  className="absolute inset-0 w-full h-full opacity-20 grayscale pointer-events-none"
  loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
/>

                    <div className="z-10 text-center p-4">
                      <MapPin className="mx-auto mb-2 text-primary" size={24} />
                      <p className="text-xs font-medium text-foreground">Map preview for: {formData.location}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Google Maps integration ready for API key
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Price (NGN) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.price ? "border-destructive" : "border-border"
                    }`}
                  />
                  {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="music">Music</option>
                    <option value="sports">Sports</option>
                    <option value="tech">Tech</option>
                    <option value="art">Art</option>
                    <option value="food">Food</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Event Image</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                    <p className="text-foreground font-semibold">
                      {formData.image ? formData.image.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-muted-foreground text-sm">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Create Event
                </button>
                <Link href="/">
                  <button
                    type="button"
                    className="flex-1 border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
