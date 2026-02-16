"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"
import { Upload, ArrowLeft, ArrowRight, MapPin, Video, Plus, Trash2, Check, Megaphone, Zap, TrendingUp, Star, Repeat, Calendar, Info, Users, Tag, Phone, Mail, X, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { apiClient, ApiError } from "@/lib/api-client"
import type { ApiCategory } from "@/lib/types"

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false })
const VenueAutocomplete = dynamic(() => import("@/components/venue-autocomplete"), { ssr: false })

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
  const searchParams = useSearchParams()
  const editEventId = searchParams.get("edit")
  const isEditMode = Boolean(editEventId)

  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingEvent, setIsLoadingEvent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [formData, setFormData] = useState({
    title: "", categoryId: "",
    ageRestriction: "all-ages" as "all-ages" | "18+" | "21+" | "family-friendly",
    tags: [] as string[],
    eventFormat: "", venueName: "", address: "", city: "", country: "Nigeria",
    latitude: null as number | null, longitude: null as number | null,
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
    capacity: "",
    refundPolicy: "non-refundable" as "refundable" | "non-refundable" | "partial",
    contactEmail: "", contactPhone: "",
    isPrivate: false,
    promoteEvent: false,
    selectedPromotion: null as string | null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [tagInput, setTagInput] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiMode, setAiMode] = useState<"generate" | "enhance" | null>(null)

  // Fetch categories on mount
  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiClient<ApiCategory[]>("/api/categories", {
        skipAuth: true,
      })
      setCategories(data)
      // Set default category if none selected
      if (!formData.categoryId && data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }))
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Load existing event when in edit mode
  useEffect(() => {
    if (!editEventId) {
      // Load draft from localStorage only for new events
      const draft = localStorage.getItem('eventDraft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setFormData(parsed)
        } catch (e) {
          console.error('Failed to load draft:', e)
        }
      }
      return
    }

    // Fetch existing event for editing
    const fetchEvent = async () => {
      setIsLoadingEvent(true)
      try {
        const event = await apiClient<{
          id: string
          title: string
          description: string
          shortDescription?: string
          categoryId?: string
          ageRestriction?: string
          tags?: string[]
          eventFormat: string
          venueName?: string
          address?: string
          city?: string
          country?: string
          onlineUrl?: string
          platform?: string
          startDate: string
          startTime?: string
          endDate?: string
          endTime?: string
          isFree: boolean
          currency?: string
          capacity?: number
          refundPolicy?: string
          contactEmail?: string
          contactPhone?: string
          isPrivate?: boolean
          coverImage?: string
          ticketTypes?: Array<{
            id: string
            name: string
            type: string
            price: number
            quantity: number
            description?: string
          }>
        }>(`/api/events/${editEventId}`)

        // Map API values back to form values
        const eventFormatMap: Record<string, string> = {
          IN_PERSON: "venue",
          ONLINE: "online",
          HYBRID: "hybrid",
        }
        const ageRestrictionMap: Record<string, "all-ages" | "18+" | "21+" | "family-friendly"> = {
          ALL_AGES: "all-ages",
          FAMILY_FRIENDLY: "family-friendly",
          EIGHTEEN_PLUS: "18+",
          TWENTYONE_PLUS: "21+",
        }
        const refundPolicyMap: Record<string, "refundable" | "non-refundable" | "partial"> = {
          NON_REFUNDABLE: "non-refundable",
          REFUNDABLE: "refundable",
          PARTIAL: "partial",
        }
        const ticketTypeMap: Record<string, "regular" | "vip" | "custom"> = {
          REGULAR: "regular",
          VIP: "vip",
          EARLY_BIRD: "custom",
          GROUP: "custom",
          STUDENT: "custom",
          MEMBER: "custom",
        }

        // Convert tickets
        const tickets: Ticket[] = event.ticketTypes && event.ticketTypes.length > 0
          ? event.ticketTypes.map(t => ({
              id: t.id,
              name: t.name,
              type: ticketTypeMap[t.type] || "custom",
              price: t.price.toString(),
              quantity: t.quantity.toString(),
              description: t.description || "",
            }))
          : [{ id: "1", name: "General Admission", type: "regular" as const, price: "", quantity: "", description: "" }]

        setFormData({
          title: event.title,
          categoryId: event.categoryId || "",
          ageRestriction: ageRestrictionMap[event.ageRestriction || "ALL_AGES"] || "all-ages",
          tags: event.tags || [],
          eventFormat: eventFormatMap[event.eventFormat] || "venue",
          venueName: event.venueName || "",
          address: event.address || "",
          city: event.city || "",
          country: event.country || "Nigeria",
          onlineUrl: event.onlineUrl || "",
          platform: event.platform || "",
          startDate: event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "",
          startTime: event.startTime || "",
          endDate: event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "",
          endTime: event.endTime || "",
          isRecurring: false,
          recurrence: {
            frequency: "weekly",
            interval: 1,
            daysOfWeek: [],
            endType: "occurrences",
            endDate: "",
            occurrences: 10,
          },
          description: event.description || "",
          image: null,
          imagePreview: event.coverImage || "",
          isFree: event.isFree,
          currency: event.currency || "NGN",
          tickets,
          capacity: event.capacity?.toString() || "",
          refundPolicy: refundPolicyMap[event.refundPolicy || "NON_REFUNDABLE"] || "non-refundable",
          contactEmail: event.contactEmail || "",
          contactPhone: event.contactPhone || "",
          isPrivate: event.isPrivate || false,
          promoteEvent: false,
          selectedPromotion: null,
        })
      } catch (error) {
        console.error("Failed to fetch event:", error)
        setSubmitError("Failed to load event for editing")
      } finally {
        setIsLoadingEvent(false)
      }
    }

    fetchEvent()
  }, [editEventId])

  // Auto-save draft to localStorage (only for new events)
  useEffect(() => {
    if (editEventId) return // Don't save drafts when editing
    const timer = setTimeout(() => {
      localStorage.setItem('eventDraft', JSON.stringify(formData))
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, editEventId])

  const clearDraft = () => {
    localStorage.removeItem('eventDraft')
  }

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

  const next = async () => {
    if (validate(step)) {
      if (step === 6 && !formData.promoteEvent) {
        await handlePublish()
        return
      }
      if (step < 7) setStep((s) => (s + 1) as Step)
    }
  }

  const prev = () => { if (step > 1) setStep((s) => (s - 1) as Step) }

  const handlePublish = async () => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // Map form values to API enum values
      const eventFormatMap: Record<string, string> = {
        venue: "IN_PERSON",
        online: "ONLINE",
        hybrid: "HYBRID",
      }

      const ageRestrictionMap: Record<string, string> = {
        "all-ages": "ALL_AGES",
        "family-friendly": "FAMILY_FRIENDLY",
        "18+": "EIGHTEEN_PLUS",
        "21+": "TWENTYONE_PLUS",
      }

      const refundPolicyMap: Record<string, string> = {
        "non-refundable": "NON_REFUNDABLE",
        "refundable": "REFUNDABLE",
        "partial": "PARTIAL",
      }

      const ticketTypeMap: Record<string, string> = {
        regular: "REGULAR",
        vip: "VIP",
        custom: "REGULAR",
      }

      // Build ticket types array for API
      const ticketTypes = formData.isFree ? undefined : formData.tickets.map(t => ({
        name: t.name,
        description: t.description || undefined,
        type: ticketTypeMap[t.type] || "REGULAR",
        price: parseFloat(t.price) || 0,
        quantity: parseInt(t.quantity) || 100,
      }))

      // Build the API payload
      const payload = {
        title: formData.title,
        description: formData.description,
        shortDescription: formData.description.substring(0, 200),
        categoryId: formData.categoryId || undefined,
        ageRestriction: ageRestrictionMap[formData.ageRestriction] || "ALL_AGES",
        tags: formData.tags,
        eventFormat: eventFormatMap[formData.eventFormat] || "IN_PERSON",
        venueName: formData.venueName || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country,
        latitude: formData.latitude || undefined,
        longitude: formData.longitude || undefined,
        onlineUrl: formData.onlineUrl || undefined,
        platform: formData.platform || undefined,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate || undefined,
        endTime: formData.endTime || undefined,
        isFree: formData.isFree,
        currency: formData.currency,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        refundPolicy: refundPolicyMap[formData.refundPolicy] || "NON_REFUNDABLE",
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
        isPrivate: formData.isPrivate,
        coverImage: formData.imagePreview || undefined,
        ticketTypes,
      }

      if (editEventId) {
        // Update existing event
        await apiClient(`/api/events/${editEventId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        router.push("/my-events")
      } else {
        // Create new event
        const createdEvent = await apiClient<{ id: string }>("/api/events", {
          method: "POST",
          body: JSON.stringify(payload),
        })

        // Publish the event immediately after creation
        try {
          await apiClient(`/api/events/${createdEvent.id}/publish`, {
            method: "POST",
          })
        } catch (publishError) {
          console.warn("Event created but not published:", publishError)
          // Show error to user but still redirect - event was created as draft
          if (publishError instanceof ApiError) {
            alert(`Event created as draft. Publishing failed: ${publishError.message}`)
          }
        }

        clearDraft()
        router.push("/my-events")
      }
    } catch (error) {
      console.error("Failed to create event:", error)
      if (error instanceof ApiError) {
        setSubmitError(error.message)
      } else {
        setSubmitError("Failed to create event. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckout = async () => {
    if (!formData.selectedPromotion) {
      setSubmitError("Please select a promotion package")
      return
    }
    // For now, just create the event (promotion checkout to be implemented with payment system)
    await handlePublish()
  }

  const countryCurrencyMap: Record<string, string> = {
    Nigeria: "NGN",
    Ghana: "GHS",
    Kenya: "KES",
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    if (name === "country") {
      // Auto-set currency when country changes
      setFormData(p => ({ ...p, country: value, currency: countryCurrencyMap[value] || "NGN" }))
    } else {
      setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }))
    }
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

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file)
    setFormData(p => ({ ...p, image: file, imagePreview: previewUrl }))

    // Upload to Cloudinary
    setIsUploading(true)
    setUploadError(null)

    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)
      formDataUpload.append("folder", "events")

      const result = await apiClient<{ url: string; publicId: string }>("/api/upload", {
        method: "POST",
        body: formDataUpload,
      })

      // Update with Cloudinary URL
      setFormData(p => ({ ...p, imagePreview: result.url }))
    } catch (error) {
      console.error("Failed to upload image:", error)
      if (error instanceof ApiError) {
        setUploadError(error.message)
      } else {
        setUploadError("Failed to upload image. Please try again.")
      }
      // Revert to no image on error
      setFormData(p => ({ ...p, image: null, imagePreview: "" }))
    } finally {
      setIsUploading(false)
    }
  }

  const handleAIDescription = async (mode: "generate" | "enhance") => {
    setIsGeneratingAI(true)
    setAiMode(mode)
    try {
      const categoryName = categories.find(c => c.id === formData.categoryId)?.name
      const result = await apiClient<{ description: string }>("/api/ai/generate-description", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          category: categoryName,
          eventFormat: formData.eventFormat,
          existingDescription: mode === "enhance" ? formData.description : undefined,
          mode,
        }),
      })
      setFormData(prev => ({ ...prev, description: result.description }))
      toast.success(mode === "generate" ? "Description generated!" : "Description enhanced!")
    } catch (error) {
      console.error("AI generation failed:", error)
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Failed to generate description. Please try again.")
      }
    } finally {
      setIsGeneratingAI(false)
      setAiMode(null)
    }
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
            return { ...t, type: value as "regular" | "vip" | "custom", name: names[value] || t.name }
          }
          return { ...t, [field]: value }
        }
        return t
      })
    }))
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(p => ({ ...p, tags: [...p.tags, tag] }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tagToRemove) }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
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

  const isOrganizer = user.role === "ORGANIZER" || user.role === "ADMIN"

  // Show organizer setup prompt for non-organizer users
  if (!isOrganizer) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Set Up Your Organizer Profile</h1>
            <p className="text-muted-foreground mb-6">
              To create and manage events on EventsKona, you need to set up your organizer profile first. It only takes a minute!
            </p>
            <div className="space-y-3">
              <Link href="/settings?tab=organizer">
                <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  Set Up Organizer Profile
                </button>
              </Link>
              <Link href="/">
                <button className="w-full py-3 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-muted transition-colors">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show loading state when fetching event for editing
  if (isLoadingEvent) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
            <p className="text-muted-foreground">Loading event...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="bg-card border-b px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <Link href={isEditMode ? "/my-events" : "/"}><button className="flex items-center gap-2 text-primary hover:text-primary/80"><ArrowLeft size={20} />Back</button></Link>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('eventDraft', JSON.stringify(formData))
                    alert('Draft saved successfully!')
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <Save size={18} />
                  Save Draft
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold">{isEditMode ? "Edit Event" : "Create Event"}</h1>
            <p className="text-muted-foreground">Step {step} of {formData.promoteEvent ? "7" : "6"}{!isEditMode && " • Auto-saving..."}</p>
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
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-background">
                    {categories.length === 0 ? (
                      <option value="">Loading categories...</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Age Restriction</label>
                  <select name="ageRestriction" value={formData.ageRestriction} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-background">
                    <option value="all-ages">All Ages</option>
                    <option value="family-friendly">Family Friendly</option>
                    <option value="18+">18+ Only</option>
                    <option value="21+">21+ Only</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">Specify any age requirements for attendees</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Event Tags (Optional)</label>
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1 relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        placeholder="e.g., networking, outdoor, live-band"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background"
                        disabled={formData.tags.length >= 5}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 5}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:bg-primary/20 rounded-full p-0.5">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">Add up to 5 tags to help people discover your event. Press Enter or click Add.</p>
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
                    <div>
                      <label className="block text-sm font-semibold mb-2">Venue Name</label>
                      <VenueAutocomplete
                        value={formData.venueName}
                        onChange={(val) => setFormData(prev => ({ ...prev, venueName: val }))}
                        onSelect={(venue) => {
                          const selectedCountry = venue.country || formData.country
                          setFormData(prev => ({
                            ...prev,
                            venueName: venue.name,
                            address: venue.address,
                            city: venue.city,
                            country: selectedCountry,
                            currency: countryCurrencyMap[selectedCountry] || prev.currency,
                            latitude: venue.latitude,
                            longitude: venue.longitude,
                          }))
                        }}
                        country={formData.country}
                        placeholder="Search venue name or address..."
                      />
                    </div>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address *" className="w-full px-4 py-3 border rounded-lg bg-background" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full px-4 py-3 border rounded-lg" />
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                        <option value="Nigeria">Nigeria</option><option value="Ghana">Ghana</option><option value="Kenya">Kenya</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Pin Location on Map</label>
                      <p className="text-xs text-muted-foreground mb-3">Click on the map to pin your venue, or type the address above to auto-locate.</p>
                      <MapPicker
                        latitude={formData.latitude || undefined}
                        longitude={formData.longitude || undefined}
                        address={formData.address}
                        onLocationChange={(lat, lng, address, city) => {
                          setFormData(prev => ({
                            ...prev,
                            latitude: lat,
                            longitude: lng,
                            ...(address ? { address } : {}),
                            ...(city ? { city } : {}),
                          }))
                        }}
                      />
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
                <div className="border-2 border-dashed rounded-lg p-8 text-center relative">
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" id="img" disabled={isUploading} />
                  <label htmlFor="img" className={`cursor-pointer ${isUploading ? "pointer-events-none opacity-70" : ""}`}>
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="animate-spin text-primary mb-2" size={32} />
                        <p className="font-semibold">Uploading image...</p>
                        <p className="text-sm text-muted-foreground">Please wait</p>
                      </div>
                    ) : formData.imagePreview ? (
                      <div className="relative">
                        <img src={formData.imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                        <p className="text-sm text-muted-foreground mt-2">Click to change image</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto mb-2 text-muted-foreground" size={32} />
                        <p className="font-semibold">Upload Image</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, WebP, GIF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {uploadError}
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold">Description * (min 50 chars)</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAIDescription("generate")}
                        disabled={isGeneratingAI || !formData.title}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isGeneratingAI && aiMode === "generate" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Zap size={14} />
                        )}
                        Generate with AI
                      </button>
                      {formData.description.length >= 20 && (
                        <button
                          type="button"
                          onClick={() => handleAIDescription("enhance")}
                          disabled={isGeneratingAI}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isGeneratingAI && aiMode === "enhance" ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Zap size={14} />
                          )}
                          Enhance with AI
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={10} placeholder="What should attendees expect? You can also use AI to generate or enhance your description." className="w-full px-4 py-3 border rounded-lg resize-none" />
                  <p className="text-xs text-muted-foreground mt-1">{formData.description.length} characters</p>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div><h2 className="text-2xl font-bold mb-2">Tickets & Pricing</h2><p className="text-muted-foreground">Set up your ticket types and pricing</p></div>

                {/* Event Capacity */}
                <div>
                  <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                    <Users size={18} />
                    Event Capacity (Optional)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="e.g., 500"
                    min="1"
                    className="w-full px-4 py-3 border rounded-lg bg-background"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Maximum number of attendees for this event</p>
                </div>

                <label className="flex items-center gap-3 p-4 bg-muted rounded-lg cursor-pointer">
                  <input type="checkbox" name="isFree" checked={formData.isFree} onChange={handleChange} className="w-5 h-5" />
                  <span className="font-semibold">This is a free event</span>
                </label>
                {!formData.isFree && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold mb-2">Currency</label>
                      <div className="w-full px-4 py-3 border rounded-lg bg-muted text-muted-foreground cursor-not-allowed">
                        {formData.currency === "NGN" && "Nigerian Naira (₦)"}
                        {formData.currency === "GHS" && "Ghanaian Cedi (₵)"}
                        {formData.currency === "KES" && "Kenyan Shilling (KSh)"}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Currency is set based on your event location ({formData.country})</p>
                    </div>

                    {/* Refund Policy */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Refund Policy</label>
                      <select name="refundPolicy" value={formData.refundPolicy} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg bg-background">
                        <option value="non-refundable">Non-refundable</option>
                        <option value="refundable">Refundable (until 7 days before event)</option>
                        <option value="partial">Partial refund (50% until 3 days before)</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">Let attendees know your cancellation policy</p>
                    </div>

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

                {/* Contact Information */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">Provide contact details for attendees to reach out with questions</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Mail size={18} />
                        Contact Email
                      </label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="event@example.com"
                        className="w-full px-4 py-3 border rounded-lg bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                        <Phone size={18} />
                        Contact Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 border rounded-lg bg-background"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This information will be visible to attendees on the event page</p>
                </div>
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

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
                {submitError}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              {step > 1 && <button onClick={prev} disabled={isSubmitting} className="flex-1 py-3 border rounded-lg font-semibold hover:bg-muted flex items-center justify-center gap-2 disabled:opacity-50"><ArrowLeft size={20} />Back</button>}

              {step < 6 && <button onClick={next} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">Continue <ArrowRight size={20} /></button>}

              {step === 6 && !formData.promoteEvent && (
                <button
                  onClick={next}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <><Loader2 size={20} className="animate-spin" />{isEditMode ? "Updating..." : "Creating Event..."}</>
                  ) : (
                    <><Check size={20} />{isEditMode ? "Update Event" : "Publish Event"}</>
                  )}
                </button>
              )}

              {step === 6 && formData.promoteEvent && <button onClick={next} className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 flex items-center justify-center gap-2">Continue to Promotion <ArrowRight size={20} /></button>}

              {step === 7 && (
                <button
                  onClick={handleCheckout}
                  disabled={!formData.selectedPromotion || isSubmitting}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 size={20} className="animate-spin" />Creating Event...</>
                  ) : (
                    <><Check size={20} />Proceed to Checkout</>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}