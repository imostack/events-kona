"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Upload, ArrowLeft, ArrowRight, MapPin, Video, Plus, Trash2, Check, Megaphone, Zap, TrendingUp, Star, Repeat, Calendar, Info } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface Ticket {
  id: string
  name: string
  type: "regular" | "vip" | "custom"
  price: string
  quantity: string
  description: string
}

interface Promotion {
  id: string
  name: string
  description: string
  features: string[]
  price: number
  duration: string
}

interface Recurrence {
  frequency: "daily" | "weekly" | "monthly"
  interval: number
  daysOfWeek: number[]
  endType: "date" | "occurrences"
  endDate: string
  occurrences: number
}

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState({
    title: "", category: "music",
    eventFormat: "", venueName: "", address: "", city: "", country: "Nigeria",
    onlineUrl: "", platform: "",
    startDate: "", startTime: "", endDate: "", endTime: "",
    isRecurring: false,
    recurrence: {
      frequency: "weekly" as "daily" | "weekly" | "monthly",
      interval: 1,
      daysOfWeek: [] as number[],
      endType: "occurrences" as "date" | "occurrences",
      endDate: "",
      occurrences: 10
    } as Recurrence,
    description: "", image: null as File | null, imagePreview: "",
    isFree: false, currency: "NGN",
    tickets: [{ id: "1", name: "General Admission", type: "regular" as const, price: "", quantity: "", description: "" }] as Ticket[],
    capacity: "", isPrivate: false,
    promoteEvent: false,
    selectedPromotion: null as string | null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const daysOfWeek = [
    { value: 0, label: "Sun", fullLabel: "Sunday" },
    { value: 1, label: "Mon", fullLabel: "Monday" },
    { value: 2, label: "Tue", fullLabel: "Tuesday" },
    { value: 3, label: "Wed", fullLabel: "Wednesday" },
    { value: 4, label: "Thu", fullLabel: "Thursday" },
    { value: 5, label: "Fri", fullLabel: "Friday" },
    { value: 6, label: "Sat", fullLabel: "Saturday" }
  ]

  const promotions: Promotion[] = [
    {
      id: "basic",
      name: "Basic Boost",
      description: "Get your event seen by more people",
      features: [
        "Featured in homepage for 7 days",
        "Homepage banner placement",
        "Email to 5,000 subscribers",
        "Social media post"
      ],
      price: 15000,
      duration: "7 days"
    },
    {
      id: "premium",
      name: "Premium Promotion",
      description: "Maximum visibility for your event",
      features: [
        "Featured in homepage for 14 days",
        "Premium homepage placement",
        "Email to 15,000 subscribers",
        "3 social media posts",
        "Priority search ranking",
        "Featured badge on event"
      ],
      price: 35000,
      duration: "14 days"
    },
    {
      id: "ultimate",
      name: "Ultimate Package",
      description: "The complete promotional package",
      features: [
        "Featured for 30 days",
        "Top homepage placement",
        "Email to 30,000+ subscribers",
        "Daily social media posts",
        "Priority ranking everywhere",
        "Featured badge + spotlight",
        "Dedicated account manager",
        "Custom marketing materials"
      ],
      price: 75000,
      duration: "30 days"
    }
  ]

  useEffect(() => { if (!user) router.push("/signup") }, [user, router])

  const validate = (s: Step): boolean => {
    const e: Record<string, string> = {}
    if (s === 1 && !formData.title.trim()) e.title = "Title required"
    if (s === 2) {
      if (!formData.eventFormat) e.eventFormat = "Select format"
      if ((formData.eventFormat === "venue" || formData.eventFormat === "hybrid") && !formData.address) e.address = "Address required"
      if ((formData.eventFormat === "online" || formData.eventFormat === "hybrid") && !formData.onlineUrl) e.onlineUrl = "URL required"
    }
    if (s === 3) {
      if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
        e.date = "All date/time fields required"
      }
      if (formData.isRecurring) {
        if (formData.recurrence.frequency === "weekly" && formData.recurrence.daysOfWeek.length === 0) {
          e.recurrence = "Select at least one day of the week"
        }
        if (formData.recurrence.endType === "date" && !formData.recurrence.endDate) {
          e.recurrenceEnd = "End date is required"
        }
        if (formData.recurrence.endType === "occurrences" && formData.recurrence.occurrences < 1) {
          e.recurrenceEnd = "At least 1 occurrence is required"
        }
      }
    }
    if (s === 4 && formData.description.length < 50) e.description = "Min 50 characters"
    if (s === 5 && !formData.isFree && formData.tickets.some(t => !t.name || !t.price || !t.quantity)) e.tickets = "Complete all ticket fields"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => { 
    if (validate(step)) {
      if (step === 6 && !formData.promoteEvent) {
        handlePublish()
        return
      }
      if (step < 7) setStep((s) => (s + 1) as Step)
    }
  }

  const prev = () => { if (step > 1) setStep((s) => (s - 1) as Step) }
  
  const handlePublish = () => {
    // Build the API payload
    const payload: any = {
      title: formData.title,
      category: formData.category,
      eventFormat: formData.eventFormat,
      venueName: formData.venueName,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      onlineUrl: formData.onlineUrl,
      platform: formData.platform,
      startDate: formData.startDate,
      startTime: formData.startTime,
      endDate: formData.endDate,
      endTime: formData.endTime,
      description: formData.description,
      isFree: formData.isFree,
      currency: formData.currency,
      tickets: formData.tickets,
      isRecurring: formData.isRecurring,
    }

    // Add recurrence data if recurring
    if (formData.isRecurring) {
      payload.recurrence = {
        frequency: formData.recurrence.frequency,
        interval: formData.recurrence.interval,
        daysOfWeek: formData.recurrence.frequency === "weekly" ? formData.recurrence.daysOfWeek : undefined,
        endDate: formData.recurrence.endType === "date" ? formData.recurrence.endDate : undefined,
        occurrences: formData.recurrence.endType === "occurrences" ? formData.recurrence.occurrences : undefined
      }
    }

    console.log("Event created:", payload)
    alert("Event created successfully!")
    router.push("/")
  }

  const handleCheckout = () => {
    if (!formData.selectedPromotion) {
      alert("Please select a promotion package")
      return
    }
    const promo = promotions.find(p => p.id === formData.selectedPromotion)
    console.log("Processing payment for:", promo)
    alert(`Redirecting to checkout for ${promo?.name} - ${formData.currency} ${promo?.price.toLocaleString()}`)
    setTimeout(() => {
      handlePublish()
    }, 1000)
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  const handleRecurrenceChange = (field: keyof Recurrence, value: any) => {
    setFormData(p => ({
      ...p,
      recurrence: { ...p.recurrence, [field]: value }
    }))
  }

  const toggleDayOfWeek = (day: number) => {
    setFormData(p => {
      const currentDays = p.recurrence.daysOfWeek
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day].sort((a, b) => a - b)
      return {
        ...p,
        recurrence: { ...p.recurrence, daysOfWeek: newDays }
      }
    })
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFormData(p => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }))
  }

  const addTicket = () => {
    const newTicket: Ticket = {
      id: Date.now().toString(),
      name: "",
      type: "custom",
      price: "",
      quantity: "",
      description: ""
    }
    setFormData(p => ({ ...p, tickets: [...p.tickets, newTicket] }))
  }

  const removeTicket = (id: string) => setFormData(p => ({ ...p, tickets: p.tickets.filter(t => t.id !== id) }))
  
  const updateTicket = (id: string, field: keyof Ticket, value: string) => {
    setFormData(p => ({ 
      ...p, 
      tickets: p.tickets.map(t => {
        if (t.id === id) {
          if (field === "type") {
            const names: Record<string, string> = {
              regular: "General Admission",
              vip: "VIP Pass",
              custom: ""
            }
            return { ...t, [field]: value, name: names[value] || t.name }
          }
          return { ...t, [field]: value }
        }
        return t
      })
    }))
  }

  // Generate recurrence summary text
  const getRecurrenceSummary = (): string => {
    if (!formData.isRecurring) return ""
    
    const { frequency, interval, daysOfWeek: days, endType, endDate, occurrences } = formData.recurrence
    
    let summary = ""
    
    // Frequency part
    if (interval === 1) {
      summary = frequency === "daily" ? "Every day" : frequency === "weekly" ? "Every week" : "Every month"
    } else {
      summary = `Every ${interval} ${frequency === "daily" ? "days" : frequency === "weekly" ? "weeks" : "months"}`
    }
    
    // Days of week for weekly
    if (frequency === "weekly" && days.length > 0) {
      const dayNames = days.map(d => daysOfWeek.find(dw => dw.value === d)?.label).join(", ")
      summary += ` on ${dayNames}`
    }
    
    // End condition
    if (endType === "date" && endDate) {
      summary += ` until ${new Date(endDate).toLocaleDateString()}`
    } else if (endType === "occurrences") {
      summary += `, ${occurrences} times`
    }
    
    return summary
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-card border-b px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/"><button className="flex items-center gap-2 text-primary hover:text-primary/80 mb-4"><ArrowLeft size={20} />Back</button></Link>
            <h1 className="text-3xl font-bold">Create Event</h1>
            <p className="text-muted-foreground">Step {step} of {formData.promoteEvent ? "7" : "6"}</p>
          </div>
        </div>
        <div className="h-2 bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${(step / (formData.promoteEvent ? 7 : 6)) * 100}%` }} /></div>

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {step === 1 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Basic Information</h2><p className="text-muted-foreground">Give your event a name and category</p></div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Event Title *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleChange} maxLength={75} placeholder="Summer Music Festival 2025" className={`w-full px-4 py-3 border rounded-lg bg-background focus:ring-2 focus:ring-primary ${errors.title ? "border-red-500" : ""}`} />
                  <p className="text-xs text-muted-foreground mt-1">{formData.title.length}/75</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-background">
                    <option value="music">Music</option><option value="business">Business</option><option value="food">Food & Drink</option>
                    <option value="arts">Arts</option><option value="sports">Sports</option><option value="tech">Technology</option><option value="education">Education</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Location & Format</h2><p className="text-muted-foreground">Where will your event take place?</p></div>
                <div className="grid grid-cols-3 gap-4">
                  {[{ v: "venue", l: "Venue", i: MapPin }, { v: "online", l: "Online", i: Video }, { v: "hybrid", l: "Hybrid", i: Video }].map(f => (
                    <button key={f.v} type="button" onClick={() => setFormData({ ...formData, eventFormat: f.v })} className={`p-4 border-2 rounded-xl ${formData.eventFormat === f.v ? "border-primary bg-primary/5" : "border-border"}`}>
                      <f.i className="mb-2 text-primary" size={24} /><div className="font-semibold">{f.l}</div>
                    </button>
                  ))}
                </div>
                {(formData.eventFormat === "venue" || formData.eventFormat === "hybrid") && (
                  <>
                    <input type="text" name="venueName" value={formData.venueName} onChange={handleChange} placeholder="Venue Name" className="w-full px-4 py-3 border rounded-lg bg-background" />
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address *" className="w-full px-4 py-3 border rounded-lg bg-background" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 border rounded-lg" />
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                        <option value="Nigeria">Nigeria</option><option value="Ghana">Ghana</option><option value="Kenya">Kenya</option>
                      </select>
                    </div>
                  </>
                )}
                {(formData.eventFormat === "online" || formData.eventFormat === "hybrid") && (
                  <>
                    <select name="platform" value={formData.platform} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                      <option value="">Select Platform</option><option value="zoom">Zoom</option><option value="google-meet">Google Meet</option>
                      <option value="youtube">YouTube Live</option><option value="other">Other</option>
                    </select>
                    <input type="url" name="onlineUrl" value={formData.onlineUrl} onChange={handleChange} placeholder="Meeting/Stream Link *" className="w-full px-4 py-3 border rounded-lg" />
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Date & Time</h2><p className="text-muted-foreground">When does your event start and end?</p></div>
                
                {/* Single Event Date/Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-2">Start Date *</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div>
                  <div><label className="block text-sm font-semibold mb-2">Start Time *</label><input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div>
                  <div><label className="block text-sm font-semibold mb-2">End Date *</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div>
                  <div><label className="block text-sm font-semibold mb-2">End Time *</label><input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" /></div>
                </div>

                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}

                {/* Recurring Event Toggle */}
                <div className="border-t pt-6 mt-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Repeat size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-foreground">Recurring Event</h3>
                            <p className="text-sm text-muted-foreground">This event repeats on a schedule</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="isRecurring" 
                              checked={formData.isRecurring} 
                              onChange={handleChange}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recurring Event Options */}
                {formData.isRecurring && (
                  <div className="space-y-6 border border-blue-200 rounded-xl p-6 bg-blue-50/30">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <Calendar size={18} />
                      <span className="font-semibold">Recurrence Settings</span>
                    </div>

                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Repeat Frequency *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: "daily", label: "Daily" },
                          { value: "weekly", label: "Weekly" },
                          { value: "monthly", label: "Monthly" }
                        ].map(freq => (
                          <button
                            key={freq.value}
                            type="button"
                            onClick={() => handleRecurrenceChange("frequency", freq.value)}
                            className={`py-3 px-4 border-2 rounded-lg font-medium transition-all ${
                              formData.recurrence.frequency === freq.value
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-200 bg-white hover:border-blue-300"
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interval */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Repeat Every
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={formData.recurrence.interval}
                          onChange={(e) => handleRecurrenceChange("interval", parseInt(e.target.value) || 1)}
                          className="w-20 px-4 py-3 border rounded-lg text-center"
                        />
                        <span className="text-muted-foreground">
                          {formData.recurrence.frequency === "daily" && (formData.recurrence.interval === 1 ? "day" : "days")}
                          {formData.recurrence.frequency === "weekly" && (formData.recurrence.interval === 1 ? "week" : "weeks")}
                          {formData.recurrence.frequency === "monthly" && (formData.recurrence.interval === 1 ? "month" : "months")}
                        </span>
                      </div>
                    </div>

                    {/* Days of Week (for weekly) */}
                    {formData.recurrence.frequency === "weekly" && (
                      <div>
                        <label className="block text-sm font-semibold mb-2">Repeat On *</label>
                        <div className="flex flex-wrap gap-2">
                          {daysOfWeek.map(day => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => toggleDayOfWeek(day.value)}
                              className={`w-12 h-12 rounded-full font-medium transition-all ${
                                formData.recurrence.daysOfWeek.includes(day.value)
                                  ? "bg-blue-600 text-white"
                                  : "bg-white border-2 border-gray-200 hover:border-blue-300"
                              }`}
                              title={day.fullLabel}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        {errors.recurrence && <p className="text-red-500 text-sm mt-2">{errors.recurrence}</p>}
                      </div>
                    )}

                    {/* End Condition */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Ends *</label>
                      <div className="space-y-3">
                        {/* After X occurrences */}
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.recurrence.endType === "occurrences" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="endType"
                            checked={formData.recurrence.endType === "occurrences"}
                            onChange={() => handleRecurrenceChange("endType", "occurrences")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>After</span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={formData.recurrence.occurrences}
                            onChange={(e) => handleRecurrenceChange("occurrences", parseInt(e.target.value) || 1)}
                            disabled={formData.recurrence.endType !== "occurrences"}
                            className="w-20 px-3 py-2 border rounded-lg text-center disabled:opacity-50"
                          />
                          <span>occurrences</span>
                        </label>

                        {/* On specific date */}
                        <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.recurrence.endType === "date" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white"
                        }`}>
                          <input
                            type="radio"
                            name="endType"
                            checked={formData.recurrence.endType === "date"}
                            onChange={() => handleRecurrenceChange("endType", "date")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>On date</span>
                          <input
                            type="date"
                            value={formData.recurrence.endDate}
                            onChange={(e) => handleRecurrenceChange("endDate", e.target.value)}
                            disabled={formData.recurrence.endType !== "date"}
                            min={formData.startDate}
                            className="px-3 py-2 border rounded-lg disabled:opacity-50"
                          />
                        </label>
                      </div>
                      {errors.recurrenceEnd && <p className="text-red-500 text-sm mt-2">{errors.recurrenceEnd}</p>}
                    </div>

                    {/* Recurrence Summary */}
                    {getRecurrenceSummary() && (
                      <div className="bg-white border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Schedule Summary</p>
                          <p className="text-sm text-muted-foreground">{getRecurrenceSummary()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Description & Media</h2><p className="text-muted-foreground">Tell attendees about your event</p></div>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" id="img" />
                  <label htmlFor="img" className="cursor-pointer">
                    {formData.imagePreview ? <img src={formData.imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" /> : <><Upload className="mx-auto mb-2 text-muted-foreground" size={32} /><p className="font-semibold">Upload Image</p><p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p></>}
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Description * (min 50 chars)</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={10} placeholder="What should attendees expect?" className="w-full px-4 py-3 border rounded-lg resize-none" />
                  <p className="text-xs text-muted-foreground mt-1">{formData.description.length} characters</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Tickets & Pricing</h2><p className="text-muted-foreground">Set up your ticket types and pricing</p></div>
                <label className="flex items-center gap-3 p-4 bg-muted rounded-lg cursor-pointer">
                  <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-5 h-5" />
                  <span className="font-semibold">This is a free event</span>
                </label>
                {!formData.isFree && (
                  <>
                    <select name="currency" value={formData.currency} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                      <option value="NGN">Nigerian Naira (₦)</option><option value="GHS">Ghanaian Cedi (₵)</option><option value="KES">Kenyan Shilling (KSh)</option>
                      <option value="USD">US Dollar ($)</option><option value="EUR">Euro (€)</option><option value="GBP">British Pound (£)</option>
                    </select>
                    <div className="space-y-4">
                      {formData.tickets.map((t, i) => (
                        <div key={t.id} className="border border-border rounded-lg p-5 space-y-4 bg-card">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-lg">Ticket {i + 1}</h4>
                            {i > 0 && <button type="button" onClick={() => removeTicket(t.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold mb-2">Ticket Type *</label>
                            <select value={t.type} onChange={(e) => updateTicket(t.id, "type", e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-background">
                              <option value="regular">Regular/General Admission</option>
                              <option value="vip">VIP Pass</option>
                              <option value="custom">Custom (Name it yourself)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2">Ticket Name *</label>
                            <input 
                              type="text" 
                              placeholder={t.type === "custom" ? "e.g., Early Bird, Student Pass, Group Ticket" : "Auto-filled based on type"} 
                              value={t.name} 
                              onChange={(e) => updateTicket(t.id, "name", e.target.value)} 
                              className="w-full px-4 py-2 border rounded-lg bg-background" 
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-semibold mb-2">Price ({formData.currency}) *</label>
                              <input type="number" placeholder="0.00" value={t.price} onChange={(e) => updateTicket(t.id, "price", e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2">Quantity *</label>
                              <input type="number" placeholder="100" value={t.quantity} onChange={(e) => updateTicket(t.id, "quantity", e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold mb-2">Description (Optional)</label>
                            <textarea 
                              placeholder="What's included with this ticket?" 
                              value={t.description} 
                              onChange={(e) => updateTicket(t.id, "description", e.target.value)} 
                              rows={2}
                              className="w-full px-4 py-2 border rounded-lg resize-none text-sm" 
                            />
                          </div>
                        </div>
                      ))}
                      <button type="button" onClick={addTicket} className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold"><Plus size={20} />Add Another Ticket Type</button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Promote Your Event</h2><p className="text-muted-foreground">Boost visibility and reach more attendees</p></div>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Megaphone size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">Want to reach more people?</h3>
                      <p className="text-muted-foreground mb-4">Promote your event to get featured placement, email marketing, and social media exposure to thousands of potential attendees.</p>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="promoteEvent" 
                          checked={formData.promoteEvent} 
                          onChange={handleChange} 
                          className="w-5 h-5 accent-purple-600" 
                        />
                        <span className="font-semibold text-foreground">Yes, I want to promote this event</span>
                      </label>
                    </div>
                  </div>
                </div>

                {!formData.promoteEvent && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">You can always promote your event later from your event dashboard.</p>
                    <p className="text-sm text-muted-foreground">Click Continue to publish your event without promotion.</p>
                  </div>
                )}
              </div>
            )}

            {step === 7 && formData.promoteEvent && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Choose Promotion Package</h2><p className="text-muted-foreground">Select the package that best fits your needs</p></div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {promotions.map((promo) => (
                    <button
                      key={promo.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, selectedPromotion: promo.id })}
                      className={`border-2 rounded-xl p-6 text-left transition-all hover:shadow-lg ${
                        formData.selectedPromotion === promo.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        {promo.id === "basic" && <Zap className="text-blue-600" size={32} />}
                        {promo.id === "premium" && <TrendingUp className="text-purple-600" size={32} />}
                        {promo.id === "ultimate" && <Star className="text-yellow-600" size={32} />}
                        {formData.selectedPromotion === promo.id && <Check className="text-primary" size={24} />}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-1">{promo.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{promo.description}</p>
                      
                      <div className="mb-4">
                        <div className="text-3xl font-bold text-foreground">
                          {formData.currency} {promo.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{promo.duration}</div>
                      </div>

                      <ul className="space-y-2">
                        {promo.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="text-primary flex-shrink-0 mt-0.5" size={16} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                {formData.selectedPromotion && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Selected:</strong> {promotions.find(p => p.id === formData.selectedPromotion)?.name} - 
                      You'll be redirected to checkout to complete payment before publishing your event.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && <button onClick={prev} className="flex-1 py-3 border rounded-lg font-semibold hover:bg-muted flex items-center justify-center gap-2"><ArrowLeft size={20} />Back</button>}
              
              {step < 6 && <button onClick={next} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">Continue <ArrowRight size={20} /></button>}
              
              {step === 6 && !formData.promoteEvent && <button onClick={next} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"><Check size={20} />Publish Event</button>}
              
              {step === 6 && formData.promoteEvent && <button onClick={next} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">Continue to Promotion <ArrowRight size={20} /></button>}
              
              {step === 7 && <button onClick={handleCheckout} disabled={!formData.selectedPromotion} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"><Check size={20} />Proceed to Checkout</button>}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}