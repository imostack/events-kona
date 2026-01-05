"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ArrowRight, ArrowLeft, Check, Users, MapPin, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

type OnboardingStep = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const router = useRouter()
  const { updateUser } = useAuth()
  const [step, setStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState({
    role: "", // organizer, attendee, both
    interests: [] as string[],
    frequency: "",
    location: "",
    orgType: "",
  })

  const categories = ["Music", "Tech", "Business", "Food & Drink", "Arts", "Sports", "Networking", "Education"]

  const nextStep = () => setStep((s) => (s + 1) as OnboardingStep)
  const prevStep = () => setStep((s) => (s - 1) as OnboardingStep)

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const handleComplete = () => {
    updateUser({ hasCompletedOnboarding: true })

    // Simulate saving preferences
    setTimeout(() => {
      router.push("/")
    }, 1000)
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
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Welcome to EventsKona!</h1>
                <p className="text-muted-foreground">How do you plan to use the platform?</p>
              </div>
              <div className="grid gap-4">
                {[
                  { id: "organizer", label: "I want to host events", icon: <Calendar className="w-6 h-6" /> },
                  { id: "attendee", label: "I want to find events to attend", icon: <Search className="w-6 h-6" /> },
                  { id: "both", label: "Both of the above", icon: <Users className="w-6 h-6" /> },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setFormData({ ...formData, role: option.id })
                      nextStep()
                    }}
                    className={`flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      formData.role === option.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${formData.role === option.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {option.icon}
                    </div>
                    <span className="font-semibold text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What are you interested in?</h1>
                <p className="text-muted-foreground">Select at least 3 to get personalized recommendations.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleInterest(cat)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      formData.interests.includes(cat)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {cat}
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
                  disabled={formData.interests.length < 3}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Where are you based?</h1>
                <p className="text-muted-foreground">This helps us find local events near you.</p>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-muted-foreground" size={20} />
                <input
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold">How often do you host or attend events?</p>
                <div className="grid gap-2">
                  {["Weekly", "Monthly", "A few times a year", "Rarely"].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFormData({ ...formData, frequency: freq })}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        formData.frequency === freq
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
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
                  disabled={!formData.location || !formData.frequency}
                  className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-bold mb-2">You're all set!</h1>
              <p className="text-muted-foreground mb-8">
                We've customized your experience based on your interests. Welcome to the Kona community!
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
          Step {step} of 4 • You can update these later in your profile settings.
        </p>
      </div>
    </div>
  )
}