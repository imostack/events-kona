"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus, Trash2, Tag, Copy, Check } from "lucide-react"

interface PromoCode {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  maxUses: number | null
  usedCount: number
  maxUsesPerUser: number
  minOrderAmount: number | null
  validFrom: string | null
  validUntil: string | null
  isActive: boolean
  appliesToAllTicketTypes: boolean
  ticketTypes: { id: string; name: string }[]
  createdAt: string
}

interface PromoCodeManagerProps {
  eventId: string
  eventTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PromoCodeManager({ eventId, eventTitle, open, onOpenChange }: PromoCodeManagerProps) {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create form state
  const [newCode, setNewCode] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState("")
  const [maxUses, setMaxUses] = useState("")
  const [validFrom, setValidFrom] = useState("")
  const [validUntil, setValidUntil] = useState("")

  const fetchCodes = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiClient<PromoCode[]>(`/api/events/${eventId}/promo-codes`)
      setCodes(Array.isArray(data) ? data : [])
    } catch {
      setCodes([])
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (open) {
      fetchCodes()
    }
  }, [open, fetchCodes])

  const resetForm = () => {
    setNewCode("")
    setDiscountType("PERCENTAGE")
    setDiscountValue("")
    setMaxUses("")
    setValidFrom("")
    setValidUntil("")
    setShowCreate(false)
  }

  const handleCreate = async () => {
    if (!newCode.trim() || !discountValue) return

    const val = parseFloat(discountValue)
    if (isNaN(val) || val <= 0) {
      alert("Discount value must be a positive number.")
      return
    }
    if (discountType === "PERCENTAGE" && val > 100) {
      alert("Percentage discount cannot exceed 100%.")
      return
    }

    setCreating(true)
    try {
      const body: Record<string, unknown> = {
        code: newCode.trim().toUpperCase(),
        discountType,
        discountValue: val,
      }
      if (maxUses) body.maxUses = parseInt(maxUses)
      if (validFrom) body.validFrom = new Date(validFrom).toISOString()
      if (validUntil) body.validUntil = new Date(validUntil).toISOString()

      const created = await apiClient<PromoCode>(`/api/events/${eventId}/promo-codes`, {
        method: "POST",
        body: JSON.stringify(body),
      })
      setCodes(prev => [created, ...prev])
      resetForm()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create promo code"
      alert(message)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      await apiClient(`/api/events/${eventId}/promo-codes/${codeId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !isActive }),
      })
      setCodes(prev => prev.map(c => c.id === codeId ? { ...c, isActive: !isActive } : c))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update promo code"
      alert(message)
    }
  }

  const handleDelete = async (codeId: string, usedCount: number) => {
    if (usedCount > 0) {
      alert("Cannot delete a promo code that has been used. You can deactivate it instead.")
      return
    }
    if (!confirm("Delete this promo code?")) return
    try {
      await apiClient(`/api/events/${eventId}/promo-codes/${codeId}`, {
        method: "DELETE",
      })
      setCodes(prev => prev.filter(c => c.id !== codeId))
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete promo code"
      alert(message)
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag size={20} />
            Promo Codes
          </DialogTitle>
          <p className="text-sm text-muted-foreground truncate">{eventTitle}</p>
        </DialogHeader>

        {/* Create New Code */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2.5 border-2 border-dashed border-border rounded-lg text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Create Promo Code
          </button>
        ) : (
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Code</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. EARLYBIRD20"
                maxLength={20}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Value {discountType === "PERCENTAGE" ? "(%)" : ""}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "PERCENTAGE" ? "20" : "500"}
                  min="1"
                  max={discountType === "PERCENTAGE" ? "100" : undefined}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Uses (leave empty for unlimited)</label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valid From</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valid Until</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCreate}
                disabled={creating || !newCode.trim() || !discountValue}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Codes List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No promo codes yet. Create one to offer discounts.
          </div>
        ) : (
          <div className="space-y-2">
            {codes.map((code) => (
              <div
                key={code.id}
                className={`border rounded-lg p-3 ${code.isActive ? "border-border" : "border-border bg-muted/50 opacity-70"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm">{code.code}</span>
                    <button
                      onClick={() => handleCopy(code.code, code.id)}
                      className="p-1 hover:bg-muted rounded transition-colors"
                      title="Copy code"
                    >
                      {copiedId === code.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(code.id, code.isActive)}
                      className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                        code.isActive
                          ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {code.isActive ? "Active" : "Inactive"}
                    </button>
                    <button
                      onClick={() => handleDelete(code.id, code.usedCount)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                      title={code.usedCount > 0 ? "Cannot delete used code" : "Delete"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    {code.discountType === "PERCENTAGE" ? `${code.discountValue}% off` : `${code.discountValue} off`}
                  </span>
                  <span>
                    Used: {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ""}
                  </span>
                  {code.validFrom && <span>From: {formatDate(code.validFrom)}</span>}
                  {code.validUntil && <span>Until: {formatDate(code.validUntil)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
