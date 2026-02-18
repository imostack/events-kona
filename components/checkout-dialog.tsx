"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePaystackPayment } from "react-paystack"
import { Loader2, Minus, Plus, Tag, AlertCircle, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { formatPrice, type Currency } from "@/lib/currency-utils"
import type { ApiEvent, ApiTicketType } from "@/lib/types"

interface CheckoutDialogProps {
  event: ApiEvent
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (orderId: string, isFree: boolean) => void
}

interface PromoResult {
  valid: boolean
  code: string
  discountType: "PERCENTAGE" | "FLAT"
  discountValue: number
  discountAmount: number
}

interface OrderResponse {
  order: {
    id: string
    orderNumber: string
    status: string
    subtotal: number
    discountAmount: number
    serviceFee: number
    totalAmount: number
    currency: string
  }
  payment?: {
    reference: string
    amount: number
    email: string
    currency: string
    callbackUrl: string
  }
  message: string
}

// Paystack payment wrapper component — hook must be called at top level
// but config is only known after order creation, so we render this conditionally
function PaystackPayment({
  config,
  onPaymentSuccess,
  onPaymentClose,
}: {
  config: { reference: string; amount: number; email: string; currency: string; publicKey: string }
  onPaymentSuccess: (reference: string) => void
  onPaymentClose: () => void
}) {
  const initializePayment = usePaystackPayment(config)
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      initializePayment({
        onSuccess: (ref: { reference: string }) => onPaymentSuccess(ref.reference),
        onClose: onPaymentClose,
      })
    }
  }, [initializePayment, onPaymentSuccess, onPaymentClose])

  return (
    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
      <Loader2 className="animate-spin" size={20} />
      <span>Opening payment window...</span>
    </div>
  )
}

export default function CheckoutDialog({ event, open, onOpenChange, onSuccess }: CheckoutDialogProps) {
  const { user } = useAuth()
  const currency = event.currency as Currency

  // Ticket selection
  const [tickets, setTickets] = useState<ApiTicketType[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loadingTickets, setLoadingTickets] = useState(true)

  // Promo code
  const [promoInput, setPromoInput] = useState("")
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null)
  const [promoError, setPromoError] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)

  // Buyer info
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")

  // Checkout state
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [paystackConfig, setPaystackConfig] = useState<{
    reference: string
    amount: number
    email: string
    currency: string
    publicKey: string
  } | null>(null)
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [paymentDismissed, setPaymentDismissed] = useState(false)

  // Pre-fill buyer info from user
  useEffect(() => {
    if (user) {
      setBuyerName(user.name || "")
      setBuyerEmail(user.email || "")
    }
  }, [user])

  // Fetch ticket types when dialog opens
  useEffect(() => {
    if (!open) return
    setLoadingTickets(true)
    setError("")
    setPaystackConfig(null)
    setPendingOrderId(null)
    setPaymentDismissed(false)

    apiClient<ApiTicketType[]>(`/api/events/${event.id}/tickets`)
      .then((data) => {
        setTickets(data)
        // Initialize quantities to 0
        const initial: Record<string, number> = {}
        data.forEach((t) => { initial[t.id] = 0 })
        setQuantities(initial)
      })
      .catch(() => setError("Failed to load ticket types"))
      .finally(() => setLoadingTickets(false))
  }, [open, event.id])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setPromoInput("")
      setPromoResult(null)
      setPromoError("")
      setError("")
      setSubmitting(false)
      setPaystackConfig(null)
      setPendingOrderId(null)
      setPaymentDismissed(false)
    }
  }, [open])

  const updateQuantity = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const ticket = tickets.find((t) => t.id === ticketId)
      if (!ticket) return prev
      const current = prev[ticketId] || 0
      const next = current + delta
      const max = Math.min(ticket.maxPerOrder, ticket.available ?? (ticket.quantity - ticket.quantitySold))
      const min = 0 // Allow 0 (deselected)
      return { ...prev, [ticketId]: Math.max(min, Math.min(next, max)) }
    })
  }

  // Computed values
  const selectedTickets = tickets.filter((t) => (quantities[t.id] || 0) > 0)
  const subtotal = selectedTickets.reduce((sum, t) => sum + Number(t.price) * (quantities[t.id] || 0), 0)
  const discountAmount = promoResult?.discountAmount || 0
  const total = Math.max(0, subtotal - discountAmount)
  const hasSelection = selectedTickets.length > 0
  const isFreeCheckout = total === 0
  const canSubmit = hasSelection && buyerName.trim() && buyerEmail.trim() && !submitting && !paystackConfig

  // Promo code
  const applyPromo = async () => {
    if (!promoInput.trim()) return
    setApplyingPromo(true)
    setPromoError("")
    setPromoResult(null)
    try {
      const result = await apiClient<PromoResult>(`/api/events/${event.id}/validate-promo`, {
        method: "POST",
        body: JSON.stringify({
          code: promoInput.trim(),
          ticketTypeIds: selectedTickets.map((t) => t.id),
          subtotal,
        }),
      })
      setPromoResult(result)
    } catch (err) {
      setPromoError(err instanceof Error ? err.message : "Invalid promo code")
    } finally {
      setApplyingPromo(false)
    }
  }

  const removePromo = () => {
    setPromoResult(null)
    setPromoInput("")
    setPromoError("")
  }

  // Submit order
  const handleCheckout = async () => {
    setSubmitting(true)
    setError("")
    try {
      const orderData = {
        eventId: event.id,
        tickets: selectedTickets.map((t) => ({
          ticketTypeId: t.id,
          quantity: quantities[t.id],
        })),
        promoCode: promoResult?.code || undefined,
        buyerName: buyerName.trim(),
        buyerEmail: buyerEmail.trim(),
      }

      const result = await apiClient<OrderResponse>("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      })

      if (result.order.status === "COMPLETED") {
        // Free order — done
        onSuccess(result.order.id, true)
        return
      }

      // Paid order — trigger Paystack
      if (result.payment) {
        setPendingOrderId(result.order.id)
        setPaystackConfig({
          reference: result.payment.reference,
          amount: result.payment.amount,
          email: result.payment.email,
          currency: result.payment.currency,
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create order")
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = useCallback(async () => {
    if (!pendingOrderId) return
    setVerifying(true)
    setPaystackConfig(null)
    try {
      await apiClient(`/api/orders/${pendingOrderId}/verify-payment`, { method: "POST" })
      onSuccess(pendingOrderId, false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment verification failed. Check your Orders page.")
    } finally {
      setVerifying(false)
    }
  }, [pendingOrderId, onSuccess])

  const handlePaymentClose = useCallback(() => {
    setPaystackConfig(null)
    setPaymentDismissed(true)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Get Tickets</DialogTitle>
          <DialogDescription>{event.title}</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-lg text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment dismissed message */}
        {paymentDismissed && pendingOrderId && (
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500 text-yellow-700 dark:text-yellow-400 px-3 py-2 rounded-lg text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>Payment not completed. You can retry from your <a href={`/orders/${pendingOrderId}`} className="underline font-medium">Orders page</a>.</span>
          </div>
        )}

        {/* Paystack payment in progress */}
        {paystackConfig && (
          <PaystackPayment
            config={paystackConfig}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentClose={handlePaymentClose}
          />
        )}

        {/* Verifying payment */}
        {verifying && (
          <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
            <Loader2 className="animate-spin" size={20} />
            <span>Verifying payment...</span>
          </div>
        )}

        {/* Main checkout form - hidden during payment */}
        {!paystackConfig && !verifying && (
          <>
            {/* Ticket Selection */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Select Tickets</h3>
              {loadingTickets ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="animate-spin text-muted-foreground" size={24} />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No tickets available for this event.</p>
              ) : (
                <div className="space-y-2">
                  {tickets.map((ticket) => {
                    const available = ticket.available ?? (ticket.quantity - ticket.quantitySold)
                    const soldOut = ticket.status === "sold_out" || available <= 0
                    const notAvailable = ticket.status === "not_started" || ticket.status === "ended"
                    const disabled = soldOut || notAvailable
                    const qty = quantities[ticket.id] || 0

                    return (
                      <div
                        key={ticket.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          disabled ? "opacity-50 bg-muted" : qty > 0 ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{ticket.name}</span>
                            {soldOut && (
                              <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Sold out</span>
                            )}
                            {ticket.status === "not_started" && (
                              <span className="text-xs bg-yellow-500/10 text-yellow-600 px-1.5 py-0.5 rounded">Coming soon</span>
                            )}
                            {ticket.status === "ended" && (
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Sales ended</span>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">{ticket.description}</p>
                          )}
                          <p className="text-sm font-semibold text-foreground mt-0.5">
                            {formatPrice(ticket.price, currency)}
                          </p>
                        </div>
                        {!disabled && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(ticket.id, -1)}
                              disabled={qty <= 0}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(ticket.id, 1)}
                              disabled={qty >= Math.min(ticket.maxPerOrder, available)}
                              className="w-7 h-7 flex items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Promo Code */}
            {hasSelection && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Promo Code</h3>
                {promoResult ? (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500 px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">
                        {promoResult.code} — {promoResult.discountType === "PERCENTAGE"
                          ? `${promoResult.discountValue}% off`
                          : `${formatPrice(promoResult.discountValue, currency)} off`}
                      </span>
                    </div>
                    <button onClick={removePromo} className="text-sm text-muted-foreground hover:text-foreground">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value); setPromoError("") }}
                        placeholder="Enter code"
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={applyPromo}
                      disabled={!promoInput.trim() || applyingPromo}
                      className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {applyingPromo ? <Loader2 className="animate-spin" size={16} /> : "Apply"}
                    </button>
                  </div>
                )}
                {promoError && <p className="text-xs text-destructive">{promoError}</p>}
              </div>
            )}

            {/* Buyer Info */}
            {hasSelection && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Your Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Full Name</label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {hasSelection && (
              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-1">
                  <span>Total</span>
                  <span>{isFreeCheckout ? "Free" : formatPrice(total, currency)}</span>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            {hasSelection && (
              <button
                onClick={handleCheckout}
                disabled={!canSubmit}
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Processing...
                  </>
                ) : isFreeCheckout ? (
                  "Complete Registration"
                ) : (
                  `Pay ${formatPrice(total, currency)}`
                )}
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
