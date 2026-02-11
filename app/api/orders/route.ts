import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody, validateQuery } from "@/lib/validate";
import {
  successResponse,
  errorResponse,
  notFoundError,
  buildPagination,
} from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";
import crypto from "crypto";

// =====================
// Schemas
// =====================

const createOrderSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  tickets: z
    .array(
      z.object({
        ticketTypeId: z.string().min(1),
        quantity: z.number().int().positive(),
        // Optional attendee info per ticket
        attendees: z
          .array(
            z.object({
              name: z.string().min(1),
              email: z.string().email(),
              phone: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .min(1, "At least one ticket is required"),
  promoCode: z.string().optional(),
  buyerName: z.string().min(1, "Buyer name is required"),
  buyerEmail: z.string().email("Valid email is required"),
  buyerPhone: z.string().optional(),
});

const listOrdersQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || "10", 10), 50)),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED", "all"]).optional(),
});

// =====================
// Helpers
// =====================

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `EK-${timestamp}-${random}`;
}

function generateTicketNumber(): string {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `TKT-${random}`;
}

function generatePaymentReference(): string {
  return `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

// =====================
// GET: List User's Orders
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const { searchParams } = new URL(request.url);
  const validation = validateQuery(searchParams, listOrdersQuerySchema);
  if (!validation.success) return validation.response;

  const { page, limit, status } = validation.data;

  const where: Record<string, unknown> = {
    userId: request.user.sub,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      totalAmount: true,
      currency: true,
      buyerName: true,
      buyerEmail: true,
      createdAt: true,
      completedAt: true,
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          startDate: true,
          venueName: true,
          city: true,
        },
      },
      _count: {
        select: { tickets: true },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  return successResponse({
    data: orders,
    pagination: buildPagination(page, limit, total),
  });
}

// =====================
// POST: Create Order (Checkout)
// =====================

async function postHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, createOrderSchema);
  if (!validation.success) return validation.response;

  const { eventId, tickets, promoCode, buyerName, buyerEmail, buyerPhone } = validation.data;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      isPublished: true,
      isCancelled: true,
      startDate: true,
      currency: true,
      isFree: true,
      serviceFeePercentage: true,
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  if (!event.isPublished || event.isCancelled) {
    return errorResponse({
      message: "This event is not available for booking",
      status: 400,
      code: "EVENT_UNAVAILABLE",
    });
  }

  if (event.startDate < new Date()) {
    return errorResponse({
      message: "This event has already started",
      status: 400,
      code: "EVENT_STARTED",
    });
  }

  // Validate ticket types and availability
  const ticketTypeIds = tickets.map((t) => t.ticketTypeId);
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      id: { in: ticketTypeIds },
      eventId,
      isActive: true,
    },
  });

  if (ticketTypes.length !== ticketTypeIds.length) {
    return errorResponse({
      message: "One or more ticket types are invalid or unavailable",
      status: 400,
      code: "INVALID_TICKETS",
    });
  }

  // Check availability and sales windows
  const now = new Date();
  for (const ticketRequest of tickets) {
    const ticketType = ticketTypes.find((t) => t.id === ticketRequest.ticketTypeId);
    if (!ticketType) continue;

    const available = ticketType.quantity - ticketType.quantitySold;
    if (ticketRequest.quantity > available) {
      return errorResponse({
        message: `Not enough "${ticketType.name}" tickets available (${available} remaining)`,
        status: 400,
        code: "INSUFFICIENT_TICKETS",
      });
    }

    if (ticketRequest.quantity > ticketType.maxPerOrder) {
      return errorResponse({
        message: `Maximum ${ticketType.maxPerOrder} "${ticketType.name}" tickets per order`,
        status: 400,
        code: "MAX_PER_ORDER_EXCEEDED",
      });
    }

    if (ticketRequest.quantity < ticketType.minPerOrder) {
      return errorResponse({
        message: `Minimum ${ticketType.minPerOrder} "${ticketType.name}" tickets per order`,
        status: 400,
        code: "MIN_PER_ORDER_NOT_MET",
      });
    }

    if (ticketType.salesStartDate && ticketType.salesStartDate > now) {
      return errorResponse({
        message: `"${ticketType.name}" tickets are not yet on sale`,
        status: 400,
        code: "SALES_NOT_STARTED",
      });
    }

    if (ticketType.salesEndDate && ticketType.salesEndDate < now) {
      return errorResponse({
        message: `"${ticketType.name}" ticket sales have ended`,
        status: 400,
        code: "SALES_ENDED",
      });
    }
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems: { ticketTypeId: string; quantity: number; unitPrice: number; totalPrice: number }[] = [];

  for (const ticketRequest of tickets) {
    const ticketType = ticketTypes.find((t) => t.id === ticketRequest.ticketTypeId)!;
    const unitPrice = Number(ticketType.price);
    const totalPrice = unitPrice * ticketRequest.quantity;

    subtotal += totalPrice;
    orderItems.push({
      ticketTypeId: ticketType.id,
      quantity: ticketRequest.quantity,
      unitPrice,
      totalPrice,
    });
  }

  // Apply promo code if provided
  let discountAmount = 0;
  let appliedPromoCode = null;

  if (promoCode) {
    appliedPromoCode = await prisma.promoCode.findFirst({
      where: {
        eventId,
        code: promoCode.toUpperCase(),
        isActive: true,
        OR: [
          { validFrom: null },
          { validFrom: { lte: now } },
        ],
      },
    });

    if (appliedPromoCode) {
      // Check if still valid
      if (appliedPromoCode.validUntil && appliedPromoCode.validUntil < now) {
        appliedPromoCode = null;
      } else if (appliedPromoCode.maxUses && appliedPromoCode.usedCount >= appliedPromoCode.maxUses) {
        appliedPromoCode = null;
      } else if (appliedPromoCode.minOrderAmount && subtotal < Number(appliedPromoCode.minOrderAmount)) {
        appliedPromoCode = null;
      } else {
        // Calculate discount
        if (appliedPromoCode.discountType === "PERCENTAGE") {
          discountAmount = subtotal * (Number(appliedPromoCode.discountValue) / 100);
        } else {
          discountAmount = Number(appliedPromoCode.discountValue);
        }
        // Don't allow discount to exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }
  }

  // Calculate service fee (on amount after discount)
  const amountAfterDiscount = subtotal - discountAmount;
  const serviceFee = event.isFree ? 0 : Math.round(amountAfterDiscount * (event.serviceFeePercentage / 100) * 100) / 100;

  // Total amount
  const totalAmount = amountAfterDiscount + serviceFee;

  // Create order in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create order
    const newOrder = await tx.order.create({
      data: {
        userId: request.user.sub,
        eventId,
        orderNumber: generateOrderNumber(),
        status: totalAmount === 0 ? "COMPLETED" : "PENDING",
        subtotal,
        discountAmount,
        serviceFee,
        taxAmount: 0,
        totalAmount,
        currency: event.currency,
        buyerName,
        buyerEmail,
        buyerPhone,
        promoCodeId: appliedPromoCode?.id,
        paymentReference: generatePaymentReference(),
        completedAt: totalAmount === 0 ? new Date() : null,
      },
    });

    // Create order items
    await tx.orderItem.createMany({
      data: orderItems.map((item) => ({
        orderId: newOrder.id,
        ticketTypeId: item.ticketTypeId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
    });

    // If free event, create tickets immediately
    if (totalAmount === 0) {
      for (const ticketRequest of tickets) {
        const ticketType = ticketTypes.find((t) => t.id === ticketRequest.ticketTypeId)!;

        for (let i = 0; i < ticketRequest.quantity; i++) {
          const attendee = ticketRequest.attendees?.[i];

          await tx.ticket.create({
            data: {
              orderId: newOrder.id,
              userId: request.user.sub,
              eventId,
              ticketTypeId: ticketType.id,
              ticketNumber: generateTicketNumber(),
              qrCode: crypto.randomBytes(16).toString("hex"),
              status: "ACTIVE",
              attendeeName: attendee?.name || buyerName,
              attendeeEmail: attendee?.email || buyerEmail,
              attendeePhone: attendee?.phone || buyerPhone,
            },
          });
        }

        // Update sold count
        await tx.ticketType.update({
          where: { id: ticketType.id },
          data: { quantitySold: { increment: ticketRequest.quantity } },
        });
      }

      // Update event sold count
      const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
      await tx.event.update({
        where: { id: eventId },
        data: { ticketsSold: { increment: totalTickets } },
      });

      // Update promo code usage
      if (appliedPromoCode) {
        await tx.promoCode.update({
          where: { id: appliedPromoCode.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    return newOrder;
  });

  // Prepare response
  const response: Record<string, unknown> = {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      discountAmount: order.discountAmount,
      serviceFee: order.serviceFee,
      totalAmount: order.totalAmount,
      currency: order.currency,
    },
  };

  // If payment is needed, include payment initialization info
  if (totalAmount > 0) {
    response.payment = {
      reference: order.paymentReference,
      amount: totalAmount * 100, // Paystack expects kobo
      email: buyerEmail,
      currency: event.currency,
      // Frontend will use this to initialize Paystack
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}/complete`,
    };
    response.message = "Order created. Proceed to payment.";
  } else {
    response.message = "Order completed successfully (free tickets)";
  }

  return successResponse({
    data: response,
    status: 201,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
export const POST = withErrorHandler(withAuth(postHandler));
