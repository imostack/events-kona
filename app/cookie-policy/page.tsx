"use client"

import { useState } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHeader from "@/components/page-header"
import {
  Cookie,
  Shield,
  Settings,
  Eye,
  BarChart3,
  Target,
  CheckCircle2,
  XCircle,
  Mail,
  Info
} from "lucide-react"

export default function CookiePolicyPage() {
  const lastUpdated = "January 6, 2025"
  const [essentialEnabled] = useState(true)
  const [functionalEnabled, setFunctionalEnabled] = useState(true)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [advertisingEnabled, setAdvertisingEnabled] = useState(true)

  const cookieTypes = [
    {
      id: "essential",
      name: "Essential Cookies",
      icon: Shield,
      description: "Required for the website to function properly. Cannot be disabled.",
      enabled: essentialEnabled,
      canToggle: false,
      examples: [
        { name: "session_id", purpose: "Maintains your login session", duration: "Session" },
        { name: "csrf_token", purpose: "Security and fraud prevention", duration: "Session" },
        { name: "cookie_consent", purpose: "Remembers your cookie preferences", duration: "1 year" }
      ]
    },
    {
      id: "functional",
      name: "Functional Cookies",
      icon: Settings,
      description: "Enable enhanced functionality and personalization, such as remembering your preferences.",
      enabled: functionalEnabled,
      canToggle: true,
      examples: [
        { name: "language_preference", purpose: "Remembers your language choice", duration: "1 year" },
        { name: "theme_mode", purpose: "Remembers dark/light mode preference", duration: "1 year" },
        { name: "location_data", purpose: "Remembers your location for event recommendations", duration: "6 months" }
      ]
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      icon: BarChart3,
      description: "Help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      enabled: analyticsEnabled,
      canToggle: true,
      examples: [
        { name: "_ga", purpose: "Google Analytics - tracks user behavior", duration: "2 years" },
        { name: "_gid", purpose: "Google Analytics - distinguishes users", duration: "24 hours" },
        { name: "amplitude_id", purpose: "Analytics and user behavior tracking", duration: "1 year" }
      ]
    },
    {
      id: "advertising",
      name: "Advertising Cookies",
      icon: Target,
      description: "Used to deliver relevant advertisements and track ad campaign performance.",
      enabled: advertisingEnabled,
      canToggle: true,
      examples: [
        { name: "fb_pixel", purpose: "Facebook advertising and retargeting", duration: "90 days" },
        { name: "google_ads", purpose: "Google Ads conversion tracking", duration: "90 days" },
        { name: "linkedin_insight", purpose: "LinkedIn advertising analytics", duration: "90 days" }
      ]
    }
  ]

  const handleToggle = (id: string) => {
    switch (id) {
      case "functional":
        setFunctionalEnabled(!functionalEnabled)
        break
      case "analytics":
        setAnalyticsEnabled(!analyticsEnabled)
        break
      case "advertising":
        setAdvertisingEnabled(!advertisingEnabled)
        break
    }
  }

  const handleSavePreferences = () => {
    // In production, save preferences to localStorage or backend
    alert("Cookie preferences saved successfully!")
  }

  const handleAcceptAll = () => {
    setFunctionalEnabled(true)
    setAnalyticsEnabled(true)
    setAdvertisingEnabled(true)
    alert("All cookies accepted!")
  }

  const handleRejectAll = () => {
    setFunctionalEnabled(false)
    setAnalyticsEnabled(false)
    setAdvertisingEnabled(false)
    alert("Optional cookies rejected!")
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader
          title="Cookie Policy"
          description={`Last updated: ${lastUpdated}`}
          icon={Cookie}
        />

        {/* Introduction */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              This Cookie Policy explains how EventsKona (owned and operated by App Guts) uses cookies and similar tracking technologies when you visit our website and use our services. This policy helps you understand what cookies are, how we use them, and your choices regarding their use.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              By continuing to use our website, you consent to our use of cookies in accordance with this Cookie Policy. You can change your cookie preferences at any time using the controls below.
            </p>
          </div>
        </section>

        {/* What Are Cookies */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Info size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">What Are Cookies?</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device (computer, smartphone, or tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
                </p>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device after you close your browser and are used when you visit the site again. Session cookies are deleted from your device when you close your browser.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="text-blue-900 font-semibold mb-2">Similar Technologies</p>
                  <p className="text-blue-800 text-sm">
                    We also use similar technologies such as web beacons, pixels, and local storage. For simplicity, we refer to all these technologies as "cookies" in this policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cookie Types & Preferences */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">Cookie Types & Your Preferences</h2>
              <p className="text-muted-foreground">
                Manage which cookies you want to allow. Changes will take effect immediately.
              </p>
            </div>

            <div className="space-y-6">
              {cookieTypes.map((type) => (
                <div key={type.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="p-6 flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <type.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">{type.name}</h3>
                        <p className="text-muted-foreground text-sm">{type.description}</p>
                      </div>
                    </div>
                    
                    {/* Toggle */}
                    <div className="ml-4">
                      {type.canToggle ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={type.enabled}
                            onChange={() => handleToggle(type.id)}
                            className="sr-only peer"
                          />
                          <div className="w-14 h-7 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold bg-muted px-3 py-1 rounded-full">
                          Always Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Examples Table */}
                  {type.enabled && (
                    <div className="border-t border-border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Cookie Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Purpose</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {type.examples.map((cookie, idx) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="px-6 py-4 text-sm font-mono text-foreground">{cookie.name}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cookie.purpose}</td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{cookie.duration}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSavePreferences}
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="flex-1 border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Reject Optional
              </button>
            </div>
          </div>
        </section>

        {/* How to Control Cookies */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">How to Control Cookies</h2>
                <p className="text-foreground/80 leading-relaxed mb-6">
                  You have several options to control and manage cookies:
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Browser Settings</h3>
                    <p className="text-foreground/80 mb-4">
                      Most web browsers allow you to control cookies through their settings. You can typically:
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>View what cookies are stored and delete them individually</span>
                      </li>
                      <li className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>Block third-party cookies</span>
                      </li>
                      <li className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>Block cookies from specific websites</span>
                      </li>
                      <li className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>Block all cookies</span>
                      </li>
                      <li className="flex items-start gap-2 text-foreground/80">
                        <CheckCircle2 className="text-primary mt-1 flex-shrink-0" size={18} />
                        <span>Delete all cookies when you close your browser</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">Browser-Specific Instructions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: "Chrome", url: "https://support.google.com/chrome/answer/95647" },
                        { name: "Firefox", url: "https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" },
                        { name: "Safari", url: "https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" },
                        { name: "Edge", url: "https://support.microsoft.com/en-us/microsoft-edge/view-and-delete-browser-history-in-microsoft-edge-00cf7943-a9e1-975a-a33d-ac10ce454ca4" }
                      ].map((browser) => (
                        <a
                          key={browser.name}
                          href={browser.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                        >
                          <span className="font-semibold text-foreground">{browser.name}</span>
                          <span className="text-primary text-sm block mt-1">View instructions →</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <p className="text-yellow-900 font-semibold mb-2">Important Note</p>
                    <p className="text-yellow-800 text-sm">
                      Blocking or deleting cookies may impact your experience on EventsKona. Some features may not work properly, and you may need to manually adjust your preferences each time you visit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="py-12 px-4 border-b bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Third-Party Cookies</h2>
                <p className="text-foreground/80 leading-relaxed mb-6">
                  We work with third-party service providers who may set cookies on your device. These include:
                </p>

                <div className="space-y-4">
                  {[
                    { name: "Google Analytics", purpose: "Website analytics and performance tracking", link: "https://policies.google.com/privacy" },
                    { name: "Facebook Pixel", purpose: "Advertising and conversion tracking", link: "https://www.facebook.com/policy/cookies/" },
                    { name: "Stripe/Paystack", purpose: "Payment processing and fraud prevention", link: "https://stripe.com/privacy" },
                    { name: "LinkedIn Insight", purpose: "Professional network advertising", link: "https://www.linkedin.com/legal/cookie-policy" }
                  ].map((provider) => (
                    <div key={provider.name} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-foreground mb-1">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground">{provider.purpose}</p>
                        </div>
                        <a
                          href={provider.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm font-medium hover:underline whitespace-nowrap ml-4"
                        >
                          Privacy Policy →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-foreground/80 leading-relaxed mt-6">
                  We do not control these third-party cookies. Please review the privacy policies of these providers for information about their use of cookies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Updates to Policy */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Updates to This Cookie Policy</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by updating the "Last Updated" date at the top of this policy.
                </p>
                <p className="text-foreground/80 leading-relaxed">
                  We encourage you to review this Cookie Policy periodically to stay informed about how we use cookies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Questions About Cookies?</h2>
                  <p className="text-muted-foreground">
                    If you have questions about our use of cookies, please contact us:
                  </p>
                </div>
              </div>

              <div className="space-y-4 ml-16">
                <div>
                  <p className="font-semibold text-foreground mb-1">Email:</p>
                  <a href="mailto:privacy@eventskona.com" className="text-primary hover:underline">
                    privacy@eventskona.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Data Protection Officer:</p>
                  <a href="mailto:dpo@eventskona.com" className="text-primary hover:underline">
                    dpo@eventskona.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-8 px-4 border-t">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4">Related Policies:</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              <Link href="/help-center" className="text-primary hover:underline font-medium">
                Help Center
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}