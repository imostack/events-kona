"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const [step, setStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState({
    role: "",
    eventTypes: [] as string[],
    eventFrequency: "",
    attendeeCount: "",
    primaryGoal: "",
    experience: "",
  })

  const nextStep = () => setStep((s) => (s + 1) as OnboardingStep)
  const prevStep = () => setStep((s) => (s - 1) as OnboardingStep)

  const toggleEventType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(type)
        ? prev.eventTypes.filter((t) => t !== type)
        : [...prev.eventTypes, type],
    }))
  }

  const handleComplete = async () => {
    try {
      await apiClient("/api/auth/onboarding", {
        method: "POST",
        body: JSON.stringify({
          preferences: {
            role: formData.role,
            eventTypes: formData.eventTypes,
            eventFrequency: formData.eventFrequency,
            attendeeCount: formData.attendeeCount,
            primaryGoal: formData.primaryGoal,
            experience: formData.experience,
          },
        }),
      })
      router.replace("/")
      router.refresh()
    } catch (error) {
      console.error("Failed to complete onboarding", error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Calendar size={24} />
            </div>
            <span className="text-2xl font-bold text-foreground">EventsKona</span>
          </div>
        </div>

       {/* Progress Bar */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Step 1: Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What is your role?</h1>
                <p className="text-muted-foreground">Help us personalize your experience</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "event_organizer", label: "Event Organizer", desc: "I plan and manage events" },
                  { id: "business_owner", label: "Business Owner", desc: "I host events for my business" },
                  { id: "nonprofit", label: "Non-Profit", desc: "I organize community or charity events" },
                  { id: "venue_manager", label: "Venue Manager", desc: "I manage a space that hosts events" },
                  { id: "corporate", label: "Corporate Event Planner", desc: "I organize company events" },
                  { id: "individual", label: "Individual/Personal", desc: "I host personal or small events" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setFormData({ ...formData, role: option.id })
                      nextStep()
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.role === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-1">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Event Types */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What types of events do you host?</h1>
                <p className="text-muted-foreground">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Conferences & Seminars",
                  "Workshops & Classes",
                  "Concerts & Performances",
                  "Networking Events",
                  "Fundraisers & Galas",
                  "Festivals & Fairs",
                  "Sports & Fitness",
                  "Parties & Social Gatherings",
                  "Virtual/Online Events",
                  "Other",
                ].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleEventType(type)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.eventTypes.includes(type)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={formData.eventTypes.length === 0}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Event Frequency */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">How often do you host events?</h1>
                <p className="text-muted-foreground">This helps us understand your needs</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "first_time", label: "This is my first event", desc: "Just getting started" },
                  { id: "occasionally", label: "Occasionally", desc: "1-5 events per year" },
                  { id: "regularly", label: "Regularly", desc: "6-12 events per year" },
                  { id: "frequently", label: "Frequently", desc: "1-3 events per month" },
                  { id: "very_frequently", label: "Very Frequently", desc: "Multiple events per week" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, eventFrequency: option.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.eventFrequency === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-1">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.eventFrequency}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Attendee Count */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What size are your typical events?</h1>
                <p className="text-muted-foreground">Average number of attendees</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "small", label: "Small (1-50)", desc: "Intimate gatherings" },
                  { id: "medium", label: "Medium (51-200)", desc: "Mid-size events" },
                  { id: "large", label: "Large (201-500)", desc: "Large events" },
                  { id: "very_large", label: "Very Large (501-2000)", desc: "Major events" },
                  { id: "massive", label: "Massive (2000+)", desc: "Festival-scale events" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, attendeeCount: option.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.attendeeCount === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-1">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.attendeeCount}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Primary Goal */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What is your primary goal?</h1>
                <p className="text-muted-foreground">What matters most to you?</p>
              </div>
              <div className="grid gap-3">
                {[
                  { id: "sell_tickets", label: "Sell Tickets", desc: "Generate revenue from ticket sales" },
                  { id: "build_community", label: "Build Community", desc: "Grow and engage my audience" },
                  { id: "raise_awareness", label: "Raise Awareness", desc: "Promote my brand or cause" },
                  { id: "fundraising", label: "Fundraising", desc: "Raise money for a cause" },
                  { id: "networking", label: "Networking", desc: "Connect people together" },
                  { id: "education", label: "Education", desc: "Share knowledge and skills" },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFormData({ ...formData, primaryGoal: option.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.primaryGoal === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="font-semibold text-foreground mb-1">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 border border-border rounded-xl font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} /> Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!formData.primaryGoal}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Completion */}
          {step === 6 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-bold mb-2">You are all set!</h1>
              <p className="text-muted-foreground mb-8">
                We have customized your experience based on your preferences. Welcome to the Kona community!
              </p>
              <button
                onClick={handleComplete}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          Step {step} of 6 • You can update these later in your profile settings.
        </p>
      </div>
    </div>
  )
}