"use client"

import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHeader from "@/components/page-header"
import { Shield, Eye, Lock, UserCheck, Database, Globe, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 6, 2025"

  const sections = [
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, register for events, or use our services, we collect information such as your name, email address, phone number, payment information, and profile details."
        },
        {
          subtitle: "Event Information",
          text: "When you create or attend events, we collect details about the events including dates, locations, ticket purchases, and attendance records."
        },
        {
          subtitle: "Automatically Collected Information",
          text: "We automatically collect certain information when you use our platform, including IP address, browser type, device information, pages visited, and interaction data."
        },
        {
          subtitle: "Payment Information",
          text: "Payment card information is collected and processed by our payment partners (Stripe, Paystack, Flutterwave) and is not stored on our servers. We only retain transaction confirmations and receipt information."
        }
      ]
    },
    {
      id: "how-we-use-information",
      title: "How We Use Your Information",
      icon: UserCheck,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our services, including creating and managing events, processing ticket sales, and facilitating communication between organizers and attendees."
        },
        {
          subtitle: "Communication",
          text: "We send you service-related emails, event confirmations, reminders, updates from organizers you follow, and promotional communications (which you can opt out of at any time)."
        },
        {
          subtitle: "Personalization",
          text: "We use your preferences and behavior to personalize your experience, recommend relevant events, and improve our platform."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to understand how our services are used, identify issues, and develop new features."
        },
        {
          subtitle: "Legal Compliance",
          text: "We process data to comply with legal obligations, enforce our terms of service, protect against fraud, and resolve disputes."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Globe,
      content: [
        {
          subtitle: "Event Organizers",
          text: "When you register for an event, your registration information is shared with the event organizer. This includes your name, email, and any information you provide during registration."
        },
        {
          subtitle: "Service Providers",
          text: "We share information with third-party service providers who help us operate our platform, including payment processors, email service providers, hosting services, and analytics tools."
        },
        {
          subtitle: "Business Transfers",
          text: "In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, in response to legal processes, to protect our rights, or to protect the safety of our users and the public."
        },
        {
          subtitle: "Public Information",
          text: "Information you choose to make public (such as your public profile, events you create, or events you're attending) may be visible to other users and search engines."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits."
        },
        {
          subtitle: "Data Encryption",
          text: "All data transmitted between your device and our servers is encrypted using SSL/TLS protocols. Payment information is encrypted and processed through PCI-compliant payment processors."
        },
        {
          subtitle: "Access Controls",
          text: "We maintain strict internal access controls and only grant access to personal information to employees and contractors who need it to perform their jobs."
        },
        {
          subtitle: "Limitations",
          text: "While we take reasonable measures to protect your information, no system is completely secure. We cannot guarantee absolute security of data transmitted over the internet."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Privacy Rights",
      icon: Eye,
      content: [
        {
          subtitle: "Access and Correction",
          text: "You can access and update your personal information at any time through your account settings."
        },
        {
          subtitle: "Data Deletion",
          text: "You have the right to request deletion of your personal information. You can delete your account from the Settings page. Note that some information may be retained for legal or legitimate business purposes."
        },
        {
          subtitle: "Opt-Out Rights",
          text: "You can opt out of promotional emails by clicking the unsubscribe link in any email or adjusting your notification preferences in Settings. You cannot opt out of service-related communications."
        },
        {
          subtitle: "Data Portability",
          text: "You have the right to request a copy of your personal information in a structured, commonly used format."
        },
        {
          subtitle: "Withdraw Consent",
          text: "Where we process your data based on consent, you can withdraw that consent at any time through your account settings."
        }
      ]
    },
    {
      id: "cookies",
      title: "Cookies and Tracking Technologies",
      icon: Database,
      content: [
        {
          subtitle: "What We Use",
          text: "We use cookies, web beacons, and similar technologies to enhance your experience, remember your preferences, analyze usage, and deliver targeted content."
        },
        {
          subtitle: "Types of Cookies",
          text: "Essential cookies (required for the platform to function), functional cookies (remember your preferences), analytics cookies (help us understand usage), and advertising cookies (deliver relevant ads)."
        },
        {
          subtitle: "Your Choices",
          text: "Most browsers allow you to control cookies through their settings. Disabling cookies may limit your ability to use certain features of our platform."
        },
        {
          subtitle: "Third-Party Cookies",
          text: "Our service providers and advertising partners may set their own cookies. We do not control these third-party cookies."
        }
      ]
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: Globe,
      content: [
        {
          subtitle: "Data Storage",
          text: "EventsKona operates primarily in Nigeria, Ghana, and Kenya. Your information may be stored and processed in these countries or other locations where our service providers operate."
        },
        {
          subtitle: "Data Protection",
          text: "When we transfer data internationally, we ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws."
        }
      ]
    },
    {
      id: "children-privacy",
      title: "Children's Privacy",
      icon: Shield,
      content: [
        {
          subtitle: "Age Requirement",
          text: "EventsKona is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13."
        },
        {
          subtitle: "Parental Notice",
          text: "If you believe we have collected information from a child under 13, please contact us immediately and we will take steps to delete such information."
        }
      ]
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: Database,
      content: [
        {
          subtitle: "Retention Period",
          text: "We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information for longer periods for legal, tax, or legitimate business purposes."
        },
        {
          subtitle: "Deletion",
          text: "When you delete your account, we will delete or anonymize your personal information within a reasonable timeframe, except where we are required to retain it by law."
        }
      ]
    },
    {
      id: "changes",
      title: "Changes to This Privacy Policy",
      icon: Shield,
      content: [
        {
          subtitle: "Updates",
          text: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by email or through a notice on our platform."
        },
        {
          subtitle: "Your Acceptance",
          text: "By continuing to use EventsKona after changes are made, you accept the updated Privacy Policy."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader
          title="Privacy Policy"
          description={`Last updated: ${lastUpdated}`}
          icon={Shield}
        />

        {/* Introduction */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              EventsKona is owned and operated by App Guts. At EventsKona, we take your privacy seriously. This Privacy Policy explains how we (App Guts) collect, use, disclose, and safeguard your information when you use our event management platform. Please read this policy carefully to understand our practices regarding your personal data.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              By using EventsKona, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <p className="text-blue-900 font-semibold mb-2">Your Privacy Matters</p>
              <p className="text-blue-800 text-sm">
                We are committed to protecting your privacy and being transparent about our data practices. If you have any questions or concerns about this policy, please contact us at privacy@eventskona.com
              </p>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Table of Contents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <section.icon size={20} />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{index + 1}.</span>
                    <div className="font-semibold text-foreground">{section.title}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto space-y-16">
            {sections.map((section, index) => (
              <div key={section.id} id={section.id} className="scroll-mt-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <section.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <h2 className="text-3xl font-bold text-foreground">{section.title}</h2>
                  </div>
                </div>

                <div className="space-y-6 ml-16">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-xl font-semibold text-foreground mb-3">{item.subtitle}</h3>
                      <p className="text-foreground/80 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
                  <h2 className="text-2xl font-bold text-foreground mb-2">Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
                <div>
                  <p className="font-semibold text-foreground mb-1">Mailing Address:</p>
                  <p className="text-foreground/80">
                    App Guts (EventsKona)<br />
                    123 Event Street, Victoria Island<br />
                    Lagos, Nigeria
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Response Time:</p>
                  <p className="text-foreground/80">
                    We aim to respond to all privacy-related inquiries within 30 days.
                  </p>
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
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-primary hover:underline font-medium">
                Cookie Policy
              </Link>
              <Link href="/help" className="text-primary hover:underline font-medium">
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