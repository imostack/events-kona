"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { usePaystackPayment } from "react-paystack"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { formatPrice, type Currency } from "@/lib/currency-utils"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  QrCode,
  AlertCircle,
} from "lucide-react"

interface OrderDetail {
  id: string
  orderNumber: string
  status: string
  totalAmount: number | string
  currency: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  subtotal: number | string
  discountAmount: number | string
  serviceFee: number | string
  taxAmount: number | string
  createdAt: string
  completedAt?: string | null
  paidAt?: string | null
  paymentMethod?: string | null
  paymentReference?: string | null
  event: {
    id: string
    title: string
    slug: string
    coverImage?: string | null
    startDate: string
    startTime?: string | null
    endDate?: string | null
    endTime?: string | null
    venueName?: string | null
    address?: string | null
    city?: string | null
    state?: string | null
    country: string
    eventFormat: string
    onlineUrl?: string | null
    organizer: {
      id: string
      organizerName: string
      organizerSlug: string
      email: string
    }
  }
  orderItems: Array<{
    id: string
    quantity: number
    unitPrice: number | string
    totalPrice: number | string
    ticketType: {
      id: string
      name: string
      description?: string | null
      type: string
    }
  }>
  tickets: Array<{
    id: string
    ticketNumber: string
    qrCode: string
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
  }>
  payment?: {
    id: string
    status: string
    method: string
    paidAt?: string | null
    paymentReference: string
  } | null
  promoCode?: {
    code: string
    discountType: string
    discountValue: number | string
  } | null
}

const STATUS_STYLES: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
  COMPLETED: { icon: CheckCircle, label: "Completed", className: "text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400" },
  PENDING: { icon: Clock, label: "Payment Pending", className: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400" },
  FAILED: { icon: XCircle, label: "Failed", className: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400" },
  CANCELLED: { icon: XCircle, label: "Cancelled", className: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400" },
  REFUNDED: { icon: CreditCard, label: "Refunded", className: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400" },
}

// Paystack retry payment wrapper
function PaystackRetry({
  config,
  onSuccess,
  onClose,
}: {
  config: { reference: string; amount: number; email: string; currency: string; publicKey: string }
  onSuccess: () => void
  onClose: () => void
}) {
  const initializePayment = usePaystackPayment(config)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initializePayment({
        onSuccess: () => onSuccess(),
        onClose,
      })
    }
  }, [initializePayment, onSuccess, onClose])

  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Loader2 className="animate-spin" size={16} />
      <span>Opening payment window...</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [retryConfig, setRetryConfig] = useState<{
    reference: string; amount: number; email: string; currency: string; publicKey: string
  } | null>(null)
  const [verifying, setVerifying] = useState(false)

  const fetchOrder = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiClient<OrderDetail>(`/api/orders/${orderId}`)
      setOrder(data)
    } catch {
      setError("Order not found")
    } finally {
      setIsLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/orders/${orderId}`)
      return
    }
    if (isAuthenticated) fetchOrder()
  }, [authLoading, isAuthenticated, router, orderId, fetchOrder])

  const handleCancel = async () => {
    if (!order) return
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return

    setCancelling(true)
    try {
      await apiClient(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        body: JSON.stringify({}),
      })
      await fetchOrder() // Refresh
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel order")
    } finally {
      setCancelling(false)
    }
  }

  const handleRetryPayment = () => {
    if (!order || !order.paymentReference) return
    setRetryConfig({
      reference: order.paymentReference,
      amount: Math.round(Number(order.totalAmount) * 100), // Convert to kobo
      email: order.buyerEmail,
      currency: order.currency,
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    })
  }

  const handleRetrySuccess = useCallback(async () => {
    setRetryConfig(null)
    setVerifying(true)
    try {
      await apiClient(`/api/orders/${orderId}/verify-payment`, { method: "POST" })
      await fetchOrder()
    } catch {
      setError("Payment verification failed. Please try again.")
    } finally {
      setVerifying(false)
    }
  }, [orderId, fetchOrder])

  const handleRetryClose = useCallback(() => {
    setRetryConfig(null)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <p className="text-muted-foreground mb-6">This order doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Link href="/orders">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90">
                Back to Orders
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const currency = order.currency as Currency
  const statusInfo = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING
  const StatusIcon = statusInfo.icon
  const canCancel = order.status === "PENDING" || order.status === "COMPLETED"
  const canRetry = order.status === "PENDING" && order.paymentReference

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link href="/orders">
            <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6">
              <ArrowLeft size={20} />
              Back to Orders
            </button>
          </Link>

          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
              <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.className}`}>
              <StatusIcon size={16} />
              {statusInfo.label}
            </div>
          </div>

          {/* Retry payment / Paystack */}
          {retryConfig && (
            <PaystackRetry config={retryConfig} onSuccess={handleRetrySuccess} onClose={handleRetryClose} />
          )}
          {verifying && (
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500 text-yellow-700 dark:text-yellow-400 px-4 py-3 rounded-lg mb-4 text-sm">
              <Loader2 className="animate-spin" size={16} />
              Verifying payment...
            </div>
          )}

          {/* Event Info Card */}
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                {order.event.coverImage ? (
                  <Image src={order.event.coverImage} alt={order.event.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Ticket className="text-muted-foreground" size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/event/${order.event.id}`}>
                  <h2 className="font-semibold text-foreground hover:text-primary transition-colors">{order.event.title}</h2>
                </Link>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {formatDate(order.event.startDate)}
                    {order.event.startTime && ` at ${order.event.startTime}`}
                  </span>
                  {(order.event.venueName || order.event.city) && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {[order.event.venueName, order.event.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  by {order.event.organizer.organizerName}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-foreground">{item.ticketType.name}</span>
                    <span className="text-muted-foreground ml-1">× {item.quantity}</span>
                  </div>
                  <span className="font-medium">{formatPrice(item.totalPrice, currency)}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-border mt-3 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal, currency)}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount
                    {order.promoCode && (
                      <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                        {order.promoCode.code}
                      </span>
                    )}
                  </span>
                  <span>-{formatPrice(order.discountAmount, currency)}</span>
                </div>
              )}
              {Number(order.serviceFee) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service fee</span>
                  <span>{formatPrice(order.serviceFee, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1 border-t border-border">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <CreditCard size={18} />
                Payment
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Method</span>
                  <p className="font-medium">{order.payment.method}</p>
                </div>
                {order.payment.paidAt && (
                  <div>
                    <span className="text-muted-foreground">Paid on</span>
                    <p className="font-medium">{formatDate(order.payment.paidAt)}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Reference</span>
                  <p className="font-medium text-xs break-all">{order.payment.paymentReference}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tickets */}
          {order.tickets.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <QrCode size={18} />
                Tickets ({order.tickets.length})
              </h3>
              <div className="space-y-3">
                {order.tickets.map((ticket) => (
                  <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
                    <div className="flex items-start gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                      {/* QR Code */}
                      {ticket.qrCode && (
                        <div className="w-16 h-16 bg-white p-1 rounded shrink-0">
                          <Image
                            src={ticket.qrCode}
                            alt={`QR ${ticket.ticketNumber}`}
                            width={56}
                            height={56}
                            className="w-full h-full"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground">{ticket.ticketType.name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            ticket.status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            ticket.status === "USED" ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                            "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {ticket.status}
                          </span>
                          {ticket.checkedIn && (
                            <span className="text-xs text-green-600 flex items-center gap-0.5">
                              <CheckCircle size={12} /> Checked in
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ticket.ticketNumber}</p>
                        {ticket.attendeeName && (
                          <p className="text-xs text-muted-foreground">{ticket.attendeeName} · {ticket.attendeeEmail}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Buyer Info */}
          <div className="bg-card border border-border rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-2">Buyer Details</h3>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Name:</span> {order.buyerName}</p>
              <p><span className="text-muted-foreground">Email:</span> {order.buyerEmail}</p>
              {order.buyerPhone && <p><span className="text-muted-foreground">Phone:</span> {order.buyerPhone}</p>}
            </div>
          </div>

          {/* Actions */}
          {(canCancel || canRetry) && (
            <div className="flex gap-3">
              {canRetry && !retryConfig && (
                <button
                  onClick={handleRetryPayment}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard size={18} />
                  Complete Payment
                </button>
              )}
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 border border-destructive text-destructive py-3 rounded-lg font-semibold hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {cancelling ? <Loader2 className="animate-spin" size={18} /> : <XCircle size={18} />}
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
