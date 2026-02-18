"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Loader2,
  CheckCircle,
  XCircle,
  Search,
  Ticket,
  User,
  AlertCircle,
} from "lucide-react"

interface MyEvent {
  id: string
  title: string
  startDate: string
  isPublished: boolean
  isCancelled: boolean
  status: string
}

interface ScanResult {
  valid: boolean
  action?: string
  message?: string
  reason?: string
  ticket?: {
    id: string
    ticketNumber: string
    status: string
    checkedIn: boolean
    checkedInAt?: string | null
    attendeeName: string
    attendeeEmail: string
    ticketType: {
      id: string
      name: string
      type: string
    }
    order?: {
      id: string
      orderNumber: string
      status: string
    }
  }
  checkedInAt?: string | null
}

export default function ScanPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [events, setEvents] = useState<MyEvent[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [loadingEvents, setLoadingEvents] = useState(true)

  // Manual entry
  const [ticketNumber, setTicketNumber] = useState("")
  const [scanning, setScanning] = useState(false)

  // Camera scanning
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null)

  // Result
  const [result, setResult] = useState<ScanResult | null>(null)
  const [resultError, setResultError] = useState<string | null>(null)

  // Fetch organizer's events
  useEffect(() => {
    if (!isAuthenticated) return
    const fetchEvents = async () => {
      setLoadingEvents(true)
      try {
        const data = await apiClient<{ events: MyEvent[] }>("/api/events/my")
        const liveEvents = (data.events || []).filter(e => e.isPublished && !e.isCancelled)
        setEvents(liveEvents)
        if (liveEvents.length === 1) {
          setSelectedEventId(liveEvents[0].id)
        }
      } catch {
        setEvents([])
      } finally {
        setLoadingEvents(false)
      }
    }
    fetchEvents()
  }, [isAuthenticated])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/scan")
    }
  }, [authLoading, isAuthenticated, router])

  const handleScan = useCallback(async (qrCode?: string, ticketNum?: string) => {
    if (!selectedEventId) {
      alert("Please select an event first.")
      return
    }
    if (!qrCode && !ticketNum) return

    setScanning(true)
    setResult(null)
    setResultError(null)

    try {
      const body: Record<string, string> = {
        eventId: selectedEventId,
        action: "check_in",
      }
      if (qrCode) body.qrCode = qrCode
      if (ticketNum) body.ticketNumber = ticketNum

      const data = await apiClient<ScanResult>("/api/tickets/scan", {
        method: "POST",
        body: JSON.stringify(body),
      })
      setResult(data)
    } catch (err) {
      setResultError(err instanceof Error ? err.message : "Scan failed")
    } finally {
      setScanning(false)
    }
  }, [selectedEventId])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ticketNumber.trim()) {
      handleScan(undefined, ticketNumber.trim())
    }
  }

  const startCamera = useCallback(async () => {
    setCameraError(null)
    try {
      const { Html5Qrcode } = await import("html5-qrcode")
      const qrScanner = new Html5Qrcode("qr-reader")
      html5QrCodeRef.current = qrScanner

      await qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText)
          // Don't stop — allow continuous scanning
        },
        () => {
          // Ignore QR scan failure (happens every frame without a QR code)
        }
      )
      setCameraActive(true)
    } catch (err) {
      console.error("Camera error:", err)
      setCameraError("Could not access camera. Please check permissions or use manual entry.")
    }
  }, [handleScan])

  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch {
        // Ignore stop errors
      }
      html5QrCodeRef.current = null
    }
    setCameraActive(false)
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const clearResult = () => {
    setResult(null)
    setResultError(null)
    setTicketNumber("")
  }

  if (authLoading) {
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

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/my-events">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Scan Tickets</h1>
            <p className="text-muted-foreground mt-1">Check in attendees by scanning QR codes or entering ticket numbers</p>
          </div>

          {/* Event Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Select Event</label>
            {loadingEvents ? (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-2">
                <Loader2 className="animate-spin" size={16} />
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">No published events found. Create an event first.</p>
              </div>
            ) : (
              <select
                value={selectedEventId}
                onChange={(e) => { setSelectedEventId(e.target.value); clearResult() }}
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} — {new Date(event.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedEventId && (
            <>
              {/* Camera Scanner */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">QR Scanner</h2>
                  <button
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      cameraActive
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {cameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </button>
                </div>

                <div
                  ref={scannerRef}
                  id="qr-reader"
                  className={`w-full rounded-lg overflow-hidden ${cameraActive ? "border border-border" : ""}`}
                />

                {cameraError && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle size={16} />
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground font-medium">OR</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Manual Entry */}
              <form onSubmit={handleManualSubmit} className="mb-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Manual Entry</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="Enter ticket number..."
                    className="flex-1 px-3 py-2.5 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="submit"
                    disabled={scanning || !ticketNumber.trim()}
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {scanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Check In
                  </button>
                </div>
              </form>

              {/* Scan Result */}
              {(result || resultError) && (
                <div className="mb-6">
                  {resultError ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5 text-center">
                      <XCircle size={48} className="mx-auto mb-3 text-red-500" />
                      <p className="font-semibold text-red-700 dark:text-red-400">{resultError}</p>
                      <button onClick={clearResult} className="mt-3 text-sm text-red-600 underline hover:no-underline">
                        Dismiss
                      </button>
                    </div>
                  ) : result?.valid ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-5">
                      <div className="text-center mb-4">
                        <CheckCircle size={48} className="mx-auto mb-2 text-green-500" />
                        <p className="font-bold text-green-700 dark:text-green-400 text-lg">
                          {result.action === "checked_in" ? "Checked In!" : "Valid Ticket"}
                        </p>
                        {result.message && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-1">{result.message}</p>
                        )}
                      </div>
                      {result.ticket && (
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-green-600" />
                            <span className="font-medium">{result.ticket.attendeeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket size={14} className="text-green-600" />
                            <span>{result.ticket.ticketType.name} — #{result.ticket.ticketNumber}</span>
                          </div>
                        </div>
                      )}
                      <button onClick={clearResult} className="mt-3 w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-sm">
                        Scan Next
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-5">
                      <div className="text-center mb-4">
                        <XCircle size={48} className="mx-auto mb-2 text-red-500" />
                        <p className="font-bold text-red-700 dark:text-red-400 text-lg">Invalid</p>
                        {result?.reason && (
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{result.reason}</p>
                        )}
                      </div>
                      {result?.ticket && (
                        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-red-600" />
                            <span className="font-medium">{result.ticket.attendeeName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket size={14} className="text-red-600" />
                            <span>{result.ticket.ticketType.name} — #{result.ticket.ticketNumber}</span>
                          </div>
                          {result.checkedInAt && (
                            <p className="text-xs text-red-500">
                              Already checked in at {new Date(result.checkedInAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      <button onClick={clearResult} className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm">
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
