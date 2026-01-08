"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, Cookie } from "lucide-react"

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
    // You can add analytics tracking here
    console.log("Cookies accepted")
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowBanner(false)
    console.log("Cookies declined")
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-2xl p-6 md:flex md:items-center md:justify-between gap-6">
          {/* Content */}
          <div className="flex items-start gap-4 mb-4 md:mb-0 flex-1">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Cookie className="text-primary" size={20} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">We use cookies</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                By clicking "Accept All", you consent to our use of cookies.{" "}
                <Link href="/cookie-policy" className="text-primary hover:underline font-medium">
                  Learn more
                </Link>
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
            <button
              onClick={declineCookies}
              className="px-6 py-2.5 border border-border rounded-lg font-semibold hover:bg-muted transition-colors text-sm"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
            >
              Accept All
            </button>
          </div>

          {/* Close button (optional) */}
          <button
            onClick={declineCookies}
            className="absolute top-4 right-4 md:relative md:top-0 md:right-0 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
