"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Users, Ticket, UserCheck, Search } from "lucide-react"

interface AttendeeTicket {
  id: string
  ticketNumber: string
  status: string
  checkedIn: boolean
  checkedInAt: string | null
  attendeeName: string | null
  attendeeEmail: string | null
  createdAt: string
  ticketType: {
    name: string
    type: string
  }
  order: {
    id: string
    orderNumber: string
    status: string
    buyerName: string
    buyerEmail: string
    totalAmount: number
    currency: string
  }
}

interface AttendeeRegistration {
  id: string
  name: string
  email: string
  avatar: string | null
  registeredAt: string
}

interface AttendeeData {
  tickets: AttendeeTicket[]
  registrations: AttendeeRegistration[]
  totalTickets: number
  totalRegistrations: number
  checkedIn: number
}

interface AttendeeListProps {
  eventId: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function AttendeeList({ eventId, eventTitle, open, onOpenChange }: AttendeeListProps) {
  const [data, setData] = useState<AttendeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"all" | "tickets" | "registrations">("all")

  const fetchAttendees = useCallback(async () => {
    setLoading(true)
    try {
      const result = await apiClient<AttendeeData>(`/api/events/${eventId}/attendees`)
      setData(result)
    } catch (error) {
      console.error("Failed to fetch attendees:", error)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (open) {
      fetchAttendees()
    }
  }, [open, fetchAttendees])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter by search
  const filteredTickets = data?.tickets.filter(t => {
    const q = search.toLowerCase()
    if (!q) return true
    return (
      (t.attendeeName?.toLowerCase().includes(q)) ||
      (t.attendeeEmail?.toLowerCase().includes(q)) ||
      (t.order.buyerName.toLowerCase().includes(q)) ||
      (t.order.buyerEmail.toLowerCase().includes(q)) ||
      t.ticketNumber.toLowerCase().includes(q)
    )
  }) || []

  const filteredRegistrations = data?.registrations.filter(r => {
    const q = search.toLowerCase()
    if (!q) return true
    return r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
  }) || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Attendees — {eventTitle}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span className="ml-2 text-muted-foreground">Loading attendees...</span>
          </div>
        ) : data ? (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{data.totalTickets}</div>
                <div className="text-xs text-muted-foreground">Ticket Holders</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{data.totalRegistrations}</div>
                <div className="text-xs text-muted-foreground">Free Registrations</div>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-foreground">{data.checkedIn}</div>
                <div className="text-xs text-muted-foreground">Checked In</div>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or ticket number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-foreground text-sm"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              {(["all", "tickets", "registrations"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    tab === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {t === "all" ? "All" : t === "tickets" ? `Tickets (${data.totalTickets})` : `Registrations (${data.totalRegistrations})`}
                </button>
              ))}
            </div>

            {/* Ticket holders */}
            {(tab === "all" || tab === "tickets") && filteredTickets.length > 0 && (
              <div>
                {tab === "all" && <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Ticket size={14} /> Ticket Holders</h3>}
                <div className="space-y-2">
                  {filteredTickets.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm truncate">
                            {ticket.attendeeName || ticket.order.buyerName}
                          </span>
                          {ticket.checkedIn && (
                            <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                              <UserCheck size={12} /> Checked in
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ticket.attendeeEmail || ticket.order.buyerEmail}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>#{ticket.ticketNumber}</span>
                          <span className="px-1.5 py-0.5 bg-muted rounded text-xs">{ticket.ticketType.name}</span>
                          <span>{formatDate(ticket.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ticket.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          ticket.status === "USED" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {ticket.status === "ACTIVE" ? "Valid" : ticket.status.toLowerCase()}
                        </span>
                        {ticket.order.totalAmount > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {ticket.order.currency} {Number(ticket.order.totalAmount).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Free registrations */}
            {(tab === "all" || tab === "registrations") && filteredRegistrations.length > 0 && (
              <div>
                {tab === "all" && <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Users size={14} /> Free Registrations</h3>}
                <div className="space-y-2">
                  {filteredRegistrations.map(reg => (
                    <div key={reg.id} className="border rounded-lg p-3 flex items-center gap-3">
                      {reg.avatar ? (
                        <img src={reg.avatar} alt={reg.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                          {reg.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground text-sm">{reg.name}</span>
                        <div className="text-xs text-muted-foreground">{reg.email}</div>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatDate(reg.registeredAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredTickets.length === 0 && filteredRegistrations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {search ? "No attendees match your search." : "No attendees yet for this event."}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Failed to load attendees.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
