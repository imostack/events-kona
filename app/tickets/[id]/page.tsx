"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { apiClient, ApiError } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import type { ApiTicket } from "@/lib/types"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Loader2,
  Ticket,
  Send,
  XCircle,
  Download,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  User,
  Mail,
} from "lucide-react"

interface TransferInfo {
  id: string
  toEmail: string
  status: string
  expiresAt: string
  createdAt: string
}

interface TicketDetail extends ApiTicket {
  checkedInBy?: string | null
  ticketType: ApiTicket["ticketType"] & {
    price?: number
    currency?: string
  }
  event: ApiTicket["event"] & {
    description?: string
    timezone?: string
    doorsOpenTime?: string | null
    state?: string | null
    platform?: string | null
    contactEmail?: string
    contactPhone?: string | null
  }
  order?: ApiTicket["order"] & {
    buyerName?: string
    buyerEmail?: string
    createdAt?: string
  }
  transfer?: TransferInfo | null
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Transfer form state
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferEmail, setTransferEmail] = useState("")
  const [transferName, setTransferName] = useState("")
  const [transferring, setTransferring] = useState(false)
  const [cancellingTransfer, setCancellingTransfer] = useState(false)

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient<TicketDetail>(`/api/tickets/${ticketId}`)
      setTicket(data)
    } catch (err) {
      console.error("Failed to fetch ticket:", err)
      setError("Ticket not found")
    } finally {
      setIsLoading(false)
    }
  }, [ticketId])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/tickets/${ticketId}`)
      return
    }
    if (isAuthenticated) {
      fetchTicket()
    }
  }, [authLoading, isAuthenticated, ticketId, router, fetchTicket])

  const handleTransfer = async () => {
    if (!transferEmail.trim()) return
    setTransferring(true)
    try {
      const body: Record<string, string> = { recipientEmail: transferEmail.trim() }
      if (transferName.trim()) body.recipientName = transferName.trim()

      const data = await apiClient<{ transfer: TransferInfo }>(`/api/tickets/${ticketId}/transfer`, {
        method: "POST",
        body: JSON.stringify(body),
      })
      setTicket(prev => prev ? { ...prev, transfer: data.transfer } : prev)
      setShowTransfer(false)
      setTransferEmail("")
      setTransferName("")
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to initiate transfer"
      alert(message)
    } finally {
      setTransferring(false)
    }
  }

  const handleCancelTransfer = async () => {
    if (!confirm("Cancel this ticket transfer?")) return
    setCancellingTransfer(true)
    try {
      await apiClient(`/api/tickets/${ticketId}/transfer`, { method: "DELETE" })
      setTicket(prev => prev ? { ...prev, transfer: null } : prev)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to cancel transfer"
      alert(message)
    } finally {
      setCancellingTransfer(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!ticket) return
    const { generateTicketPdf } = await import("@/lib/generate-ticket-pdf")
    generateTicketPdf(ticket)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatShortDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getLocation = (event: TicketDetail["event"]) => {
    if (event.eventFormat === "ONLINE") return "Online Event"
    return [event.venueName, event.city, event.country].filter(Boolean).join(", ") || "Location TBA"
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      USED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      REFUNDED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      TRANSFERRED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    }
    return styles[status] || styles.ACTIVE
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Ticket className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h1 className="text-2xl font-bold mb-2">Ticket not found</h1>
            <p className="text-muted-foreground mb-6">This ticket doesn&apos;t exist or you don&apos;t have access.</p>
            <Link href="/my-events">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90">
                Back to Dashboard
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const canTransfer = ticket.status === "ACTIVE" && !ticket.checkedIn && ticket.eventStatus === "upcoming" && !ticket.event.isCancelled && !ticket.transfer

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/my-events">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to My Tickets
              </button>
            </Link>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Ticket Details</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusBadge(ticket.status)}`}>
                {ticket.status === "ACTIVE" ? "Valid" : ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}
              </span>
            </div>
            <p className="text-muted-foreground font-mono text-sm">#{ticket.ticketNumber}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column — QR + Actions */}
            <div className="space-y-4">
              {/* QR Code */}
              <div className="bg-card border border-border rounded-lg p-6 flex flex-col items-center">
                {ticket.qrCode ? (
                  <Image
                    src={ticket.qrCode}
                    alt="Ticket QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">No QR Code</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Show this QR code at the venue
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleDownloadPdf}
                  className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download PDF
                </button>

                {canTransfer && (
                  <button
                    onClick={() => setShowTransfer(!showTransfer)}
                    className="w-full border border-border text-foreground py-2.5 rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Transfer Ticket
                  </button>
                )}
              </div>

              {/* Transfer Form */}
              {showTransfer && (
                <div className="bg-card border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Transfer to someone</p>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recipient Email *</label>
                    <input
                      type="email"
                      value={transferEmail}
                      onChange={(e) => setTransferEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Recipient Name</label>
                    <input
                      type="text"
                      value={transferName}
                      onChange={(e) => setTransferName(e.target.value)}
                      placeholder="Optional"
                      className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleTransfer}
                      disabled={transferring || !transferEmail.trim()}
                      className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {transferring && <Loader2 size={14} className="animate-spin" />}
                      Send
                    </button>
                    <button
                      onClick={() => setShowTransfer(false)}
                      className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Pending Transfer */}
              {ticket.transfer && ticket.transfer.status === "PENDING" && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">Transfer Pending</p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                        Sent to {ticket.transfer.toEmail}
                      </p>
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">
                        Expires {formatShortDate(ticket.transfer.expiresAt)}
                      </p>
                      <button
                        onClick={handleCancelTransfer}
                        disabled={cancellingTransfer}
                        className="mt-2 text-xs font-medium text-yellow-800 dark:text-yellow-300 underline hover:no-underline disabled:opacity-50"
                      >
                        {cancellingTransfer ? "Cancelling..." : "Cancel Transfer"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column — Details */}
            <div className="md:col-span-2 space-y-4">
              {/* Event Info */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="relative h-40 bg-muted">
                  {ticket.event.coverImage && (
                    <Image src={ticket.event.coverImage} alt={ticket.event.title} fill className="object-cover" />
                  )}
                </div>
                <div className="p-5">
                  <Link href={`/event/${ticket.event.id}`}>
                    <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                      {ticket.event.title}
                    </h2>
                  </Link>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={16} />
                      {formatDate(ticket.event.startDate)}
                    </span>
                    {ticket.event.startTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {ticket.event.startTime}
                        {ticket.event.endTime && ` - ${ticket.event.endTime}`}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <MapPin size={16} />
                      {getLocation(ticket.event)}
                    </span>
                  </div>
                  {ticket.event.organizer && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Link href={`/organizer/${ticket.event.organizer.organizerSlug || ticket.event.organizer.id}`}>
                        <span className="text-sm text-primary hover:underline flex items-center gap-1.5">
                          <ExternalLink size={14} />
                          {ticket.event.organizer.organizerName || "View Organizer"}
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Info */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-lg font-bold text-foreground mb-4">Ticket Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold text-foreground">{ticket.ticketType.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Ticket Number</p>
                    <p className="font-semibold text-foreground font-mono">#{ticket.ticketNumber}</p>
                  </div>
                  {ticket.attendeeName && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1"><User size={14} /> Attendee</p>
                      <p className="font-semibold text-foreground">{ticket.attendeeName}</p>
                    </div>
                  )}
                  {ticket.attendeeEmail && (
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1"><Mail size={14} /> Email</p>
                      <p className="font-semibold text-foreground">{ticket.attendeeEmail}</p>
                    </div>
                  )}
                </div>

                {/* Check-in Status */}
                {ticket.checkedIn && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={18} />
                      <span className="text-sm font-semibold">Checked In</span>
                    </div>
                    {ticket.checkedInAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatShortDate(ticket.checkedInAt)}
                      </p>
                    )}
                  </div>
                )}

                {ticket.event.isCancelled && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle size={18} />
                      <span className="text-sm font-semibold">Event Cancelled</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Link */}
              {ticket.order && (
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-lg font-bold text-foreground mb-2">Order</h3>
                  <Link href={`/orders/${ticket.order.id}`}>
                    <div className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{ticket.order.orderNumber}</p>
                        {ticket.order.createdAt && (
                          <p className="text-xs text-muted-foreground">
                            Ordered {formatShortDate(ticket.order.createdAt)}
                          </p>
                        )}
                      </div>
                      <ExternalLink size={16} className="text-primary" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
