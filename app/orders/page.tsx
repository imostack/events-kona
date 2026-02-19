"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { PageSkeleton } from "@/components/page-skeleton"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import type { ApiOrder, ApiPagination } from "@/lib/types"
import { formatPrice, type Currency } from "@/lib/currency-utils"
import {
  ArrowLeft,
  Calendar,
  Ticket,
  Loader2,
  ShoppingBag,
  MapPin,
} from "lucide-react"

type StatusFilter = "all" | "COMPLETED" | "PENDING" | "CANCELLED"

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  REFUNDED: { label: "Refunded", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [pagination, setPagination] = useState<ApiPagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState<StatusFilter>("all")

  const fetchOrders = useCallback(async (page: number, status: StatusFilter, append = false) => {
    if (append) setLoadingMore(true)
    else setIsLoading(true)

    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" })
      if (status !== "all") params.set("status", status)

      const data = await apiClient<{ orders: ApiOrder[]; pagination: ApiPagination }>(
        `/api/orders?${params.toString()}`
      )
      // The API returns data at root level since apiClient returns json.data
      // Check if it has orders property or if data itself is the array
      const ordersList = Array.isArray(data) ? data : (data.orders || [])
      const paginationData = Array.isArray(data) ? null : (data.pagination || null)

      if (append) {
        setOrders((prev) => [...prev, ...ordersList])
      } else {
        setOrders(ordersList)
      }
      setPagination(paginationData)
    } catch {
      // If error, just show empty state
      if (!append) setOrders([])
    } finally {
      setIsLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/orders")
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch orders when filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(1, filter)
    }
  }, [isAuthenticated, filter, fetchOrders])

  const handleLoadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchOrders(pagination.page + 1, filter, true)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (authLoading) {
    return <PageSkeleton variant="list" />
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/">
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4">
                <ArrowLeft size={20} />
                Back to Events
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground mt-1">View your ticket purchases and order history</p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {(["all", "COMPLETED", "PENDING", "CANCELLED"] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {status === "all" ? "All Orders" : STATUS_LABELS[status]?.label || status}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h2 className="text-xl font-semibold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">Browse events and get your first tickets!</p>
              <Link href="/">
                <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Browse Events
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING
                return (
                  <Link key={order.id} href={`/orders/${order.id}`}>
                    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
                      <div className="flex gap-4">
                        {/* Event Image */}
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                          {order.event.coverImage ? (
                            <Image
                              src={order.event.coverImage}
                              alt={order.event.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Ticket className="text-muted-foreground" size={24} />
                            </div>
                          )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{order.event.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">{order.orderNumber}</p>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(order.event.startDate)}
                            </span>
                            {(order.event.venueName || order.event.city) && (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {[order.event.venueName, order.event.city].filter(Boolean).join(", ")}
                              </span>
                            )}
                            {order._count?.tickets != null && (
                              <span className="flex items-center gap-1">
                                <Ticket size={12} />
                                {order._count.tickets} ticket{order._count.tickets !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">
                              {formatPrice(order.totalAmount, order.currency as Currency)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Ordered {formatDate(order.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Load More */}
              {pagination && pagination.page < pagination.totalPages && (
                <div className="text-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                  >
                    {loadingMore ? <Loader2 className="animate-spin" size={16} /> : null}
                    {loadingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
