"use client"

import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import PageHeader from "@/components/page-header"
import {
  FileText,
  Users,
  CreditCard,
  Shield,
  AlertTriangle,
  Scale,
  Ban,
  Mail,
  CheckCircle2
} from "lucide-react"

export default function TermsOfServicePage() {
  const lastUpdated = "January 6, 2025"
  const effectiveDate = "January 6, 2025"

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: CheckCircle2,
      content: [
        {
          text: "By accessing or using EventsKona (the 'Service', 'Platform', or 'Site'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use the Service."
        },
        {
          text: "EventsKona is owned and operated by App Guts ('Company', 'we', 'us', 'our'). These Terms constitute a legally binding agreement between you and App Guts. We reserve the right to update these Terms at any time, and your continued use of the Service after such changes constitutes acceptance of the modified Terms."
        },
        {
          text: "You must be at least 13 years old to use EventsKona. If you are under 18, you represent that you have your parent or guardian's permission to use the Service."
        }
      ]
    },
    {
      id: "account-registration",
      title: "Account Registration and Security",
      icon: Users,
      content: [
        {
          subtitle: "Account Creation",
          text: "To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account."
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to suspend or terminate your account at any time for any reason, including violation of these Terms. You may delete your account at any time through your account settings."
        },
        {
          subtitle: "One Account Per User",
          text: "Each user may maintain only one account. Creating multiple accounts may result in suspension or termination of all accounts."
        }
      ]
    },
    {
      id: "user-conduct",
      title: "User Conduct and Responsibilities",
      icon: Shield,
      content: [
        {
          subtitle: "Acceptable Use",
          text: "You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that could damage, disable, overburden, or impair the Service."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not: (a) violate any laws or regulations; (b) infringe on intellectual property rights; (c) transmit harmful code or malware; (d) impersonate others; (e) harass, abuse, or harm other users; (f) collect user data without consent; (g) interfere with the Service's operation; (h) create fraudulent events or transactions."
        },
        {
          subtitle: "Event Creator Responsibilities",
          text: "If you create events on the Platform, you are solely responsible for: (a) the accuracy of event information; (b) fulfilling your obligations to attendees; (c) complying with applicable laws and regulations; (d) obtaining necessary permits and licenses; (e) event safety and security; (f) handling refunds and disputes professionally."
        },
        {
          subtitle: "Content Standards",
          text: "All content you post must be accurate, lawful, and not violate any third-party rights. You may not post content that is defamatory, obscene, threatening, or promotes illegal activity."
        }
      ]
    },
    {
      id: "event-creation",
      title: "Event Creation and Management",
      icon: FileText,
      content: [
        {
          subtitle: "Event Information",
          text: "As an event organizer, you are responsible for providing accurate and complete event information, including title, date, time, location, description, and pricing. Misleading or false information may result in event removal and account suspension."
        },
        {
          subtitle: "Event Approval",
          text: "We reserve the right to review, approve, or reject any event listing at our sole discretion. We may remove events that violate these Terms or applicable laws."
        },
        {
          subtitle: "Event Modifications",
          text: "You may modify event details after publication, but significant changes (date, time, location) must be communicated to registered attendees promptly."
        },
        {
          subtitle: "Event Cancellation",
          text: "If you cancel an event, you must notify all attendees immediately and process refunds according to your stated refund policy. Failure to do so may result in penalties or account suspension."
        }
      ]
    },
    {
      id: "payments-fees",
      title: "Payments, Fees, and Refunds",
      icon: CreditCard,
      content: [
        {
          subtitle: "Platform Fees",
          text: "EventsKona charges a service fee on paid ticket sales. The current fee structure is available on our pricing page. Fees are subject to change with 30 days notice."
        },
        {
          subtitle: "Payment Processing",
          text: "Payments are processed through third-party payment processors (Stripe, Paystack, Flutterwave). You agree to their respective terms of service. We are not responsible for payment processing errors or delays."
        },
        {
          subtitle: "Payouts",
          text: "Event organizers will receive payouts according to the payout schedule specified in their account settings, typically 3-5 business days after the event concludes. Payouts may be delayed for verification or fraud prevention purposes."
        },
        {
          subtitle: "Refund Policy",
          text: "Refunds are at the discretion of event organizers according to their stated refund policy. EventsKona facilitates refunds but is not responsible for organizer refund decisions. Platform fees are non-refundable."
        },
        {
          subtitle: "Chargebacks",
          text: "Chargebacks and payment disputes are handled according to payment processor policies. Excessive chargebacks may result in account suspension or termination."
        },
        {
          subtitle: "Taxes",
          text: "You are responsible for determining and paying any applicable taxes on your event sales. EventsKona does not provide tax advice."
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: Scale,
      content: [
        {
          subtitle: "Platform Content",
          text: "The Service and its original content, features, and functionality are owned by EventsKona and are protected by international copyright, trademark, and other intellectual property laws."
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of content you post to the Service. By posting content, you grant EventsKona a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with operating the Service."
        },
        {
          subtitle: "Trademark",
          text: "EventsKona, our logo, and related marks are trademarks of EventsKona. You may not use our trademarks without prior written consent."
        },
        {
          subtitle: "Copyright Infringement",
          text: "We respect intellectual property rights. If you believe content on our Service infringes your copyright, please contact us at copyright@eventskona.com with details of the alleged infringement."
        }
      ]
    },
    {
      id: "disclaimers",
      title: "Disclaimers and Limitations",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "Service 'As Is'",
          text: "THE SERVICE IS PROVIDED 'AS IS' AND 'AS AVAILABLE' WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE."
        },
        {
          subtitle: "Third-Party Events",
          text: "EventsKona is a platform that connects event organizers with attendees. We are not responsible for the actions, content, or services of event organizers. We do not endorse any events and make no representations about event quality, safety, or legality."
        },
        {
          subtitle: "User Interactions",
          text: "We are not responsible for disputes between users, including disputes between event organizers and attendees. You agree to resolve such disputes directly with the other party."
        },
        {
          subtitle: "External Links",
          text: "The Service may contain links to third-party websites. We are not responsible for the content or practices of third-party websites."
        }
      ]
    },
    {
      id: "limitation-liability",
      title: "Limitation of Liability",
      icon: Ban,
      content: [
        {
          text: "TO THE MAXIMUM EXTENT PERMITTED BY LAW, EVENTSKONA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES."
        },
        {
          text: "IN NO EVENT SHALL OUR AGGREGATE LIABILITY EXCEED THE AMOUNT YOU PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM."
        },
        {
          text: "Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so the above limitations may not apply to you."
        }
      ]
    },
    {
      id: "indemnification",
      title: "Indemnification",
      icon: Shield,
      content: [
        {
          text: "You agree to indemnify, defend, and hold harmless EventsKona, its affiliates, and their respective officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with:"
        },
        {
          text: "(a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any rights of another party; (d) events you create or attend; (e) your content or information you provide."
        }
      ]
    },
    {
      id: "dispute-resolution",
      title: "Dispute Resolution and Governing Law",
      icon: Scale,
      content: [
        {
          subtitle: "Governing Law",
          text: "These Terms shall be governed by and construed in accordance with the laws of Nigeria, without regard to its conflict of law provisions."
        },
        {
          subtitle: "Dispute Resolution",
          text: "Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be resolved through good faith negotiations. If negotiations fail, disputes shall be resolved through binding arbitration in Lagos, Nigeria."
        },
        {
          subtitle: "Class Action Waiver",
          text: "You agree to resolve disputes with us on an individual basis and waive any right to participate in class action lawsuits or class-wide arbitration."
        },
        {
          subtitle: "Venue",
          text: "Any legal action or proceeding relating to these Terms shall be brought exclusively in the courts located in Lagos, Nigeria."
        }
      ]
    },
    {
      id: "termination",
      title: "Termination",
      icon: Ban,
      content: [
        {
          subtitle: "By You",
          text: "You may terminate your account at any time by deleting it through your account settings or contacting us."
        },
        {
          subtitle: "By Us",
          text: "We may suspend or terminate your account immediately, without prior notice or liability, for any reason, including breach of these Terms."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability."
        }
      ]
    },
    {
      id: "general",
      title: "General Provisions",
      icon: FileText,
      content: [
        {
          subtitle: "Entire Agreement",
          text: "These Terms constitute the entire agreement between you and EventsKona regarding the Service and supersede all prior agreements."
        },
        {
          subtitle: "Severability",
          text: "If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in full force and effect."
        },
        {
          subtitle: "Waiver",
          text: "No waiver of any term of these Terms shall be deemed a further or continuing waiver of such term or any other term."
        },
        {
          subtitle: "Assignment",
          text: "You may not assign or transfer these Terms or your rights hereunder without our prior written consent. We may assign these Terms without restriction."
        },
        {
          subtitle: "Force Majeure",
          text: "We shall not be liable for any failure to perform due to circumstances beyond our reasonable control, including acts of God, war, pandemic, or internet failures."
        },
        {
          subtitle: "Language",
          text: "These Terms are written in English. Any translations are provided for convenience only. In case of conflict, the English version prevails."
        }
      ]
    },
    {
      id: "changes",
      title: "Changes to Terms",
      icon: AlertTriangle,
      content: [
        {
          text: "We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect."
        },
        {
          text: "Your continued use of the Service after any changes constitute acceptance of the new Terms. If you do not agree to the new Terms, you must stop using the Service."
        },
        {
          text: "We encourage you to review these Terms periodically. The 'Last Updated' date at the top of this page indicates when these Terms were last revised."
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
          title="Terms of Service"
          description={`Last updated: ${lastUpdated} • Effective date: ${effectiveDate}`}
          icon={FileText}
        />

        {/* Introduction */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              Welcome to EventsKona! These Terms of Service govern your access to and use of our event management platform, including our website, mobile applications, and related services.
            </p>
            <p className="text-lg text-foreground/80 leading-relaxed mb-6">
              Please read these Terms carefully before using EventsKona. By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Service.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
              <p className="text-yellow-900 font-semibold mb-2">Important Notice</p>
              <p className="text-yellow-800 text-sm">
                These Terms contain important information about your legal rights, including limitations of liability and a mandatory arbitration provision. Please review carefully.
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
                      {item.subtitle && (
                        <h3 className="text-xl font-semibold text-foreground mb-3">{item.subtitle}</h3>
                      )}
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
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                </div>
              </div>

              <div className="space-y-4 ml-16">
                <div>
                  <p className="font-semibold text-foreground mb-1">Email:</p>
                  <a href="mailto:legal@eventskona.com" className="text-primary hover:underline">
                    legal@eventskona.com
                  </a>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Support:</p>
                  <a href="mailto:support@eventskona.com" className="text-primary hover:underline">
                    support@eventskona.com
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
              </div>
            </div>
          </div>
        </section>

        {/* Acknowledgment */}
        <section className="py-12 px-4 border-t">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <CheckCircle2 className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Acknowledgment</h3>
              <p className="text-blue-800 mb-6 max-w-2xl mx-auto">
                By using EventsKona, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/privacy-policy">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Read Privacy Policy
                  </button>
                </Link>
                <Link href="/help-center">
                  <button className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                    Visit Help Center
                  </button>
                </Link>
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
              <Link href="/cookie-policy" className="text-primary hover:underline font-medium">
                Cookie Policy
              </Link>
              <Link href="/help-center" className="text-primary hover:underline font-medium">
                Help Center
              </Link>
              <Link href="/contact-us" className="text-primary hover:underline font-medium">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}