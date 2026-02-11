import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import {
  successResponse,
  errorResponse,
  notFoundError,
  forbiddenError,
} from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// Schemas
// =====================

const cancelOrderSchema = z.object({
  reason: z.string().optional(),
});

// =====================
// POST: Cancel Order
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const validation = await validateBody(request, cancelOrderSchema);
  if (!validation.success) return validation.response;

  const { reason } = validation.data;

  // Get order
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          organizerId: true,
          refundPolicy: true,
          startDate: true,
        },
      },
      tickets: {
        select: {
          id: true,
          ticketTypeId: true,
          status: true,
        },
      },
      orderItems: true,
    },
  });

  if (!order) {
    return notFoundError("Order not found");
  }

  // Check permission - user can cancel their own orders
  const isOwner = order.userId === request.user.sub;
  const isAdmin = request.user.role === "ADMIN";
  const isEventOrganizer = order.event.organizerId === request.user.sub;

  if (!isOwner && !isAdmin && !isEventOrganizer) {
    return forbiddenError("You don't have permission to cancel this order");
  }

  // Check if order can be cancelled
  if (order.status === "CANCELLED") {
    return errorResponse({
      message: "Order is already cancelled",
      status: 400,
      code: "ALREADY_CANCELLED",
    });
  }

  if (order.status === "REFUNDED") {
    return errorResponse({
      message: "Order has already been refunded",
      status: 400,
      code: "ALREADY_REFUNDED",
    });
  }

  // Check if event has already started (allow admin/organizer to bypass)
  if (order.event.startDate < new Date() && !isAdmin && !isEventOrganizer) {
    return errorResponse({
      message: "Cannot cancel order for an event that has already started",
      status: 400,
      code: "EVENT_STARTED",
    });
  }

  // Check refund policy for completed orders
  const needsRefund = order.status === "COMPLETED" && Number(order.totalAmount) > 0;
  let refundEligible = false;

  if (needsRefund) {
    if (order.event.refundPolicy === "REFUNDABLE") {
      refundEligible = true;
    } else if (order.event.refundPolicy === "PARTIAL") {
      // Could implement time-based partial refund logic here
      refundEligible = true;
    }
    // NON_REFUNDABLE = no refund
  }

  // Cancel order in a transaction
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    // Update order status
    const updated = await tx.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        buyerMetadata: {
          ...(order.buyerMetadata as object || {}),
          cancellationReason: reason,
          cancelledBy: request.user.sub,
        },
      },
    });

    // Cancel all tickets
    if (order.tickets.length > 0) {
      await tx.ticket.updateMany({
        where: {
          orderId: id,
          status: "ACTIVE",
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Restore ticket quantities
      for (const item of order.orderItems) {
        await tx.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { quantitySold: { decrement: item.quantity } },
        });
      }

      // Update event sold count
      const totalTickets = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      await tx.event.update({
        where: { id: order.eventId },
        data: { ticketsSold: { decrement: totalTickets } },
      });
    }

    // If promo code was used, restore usage
    if (order.promoCodeId) {
      await tx.promoCode.update({
        where: { id: order.promoCodeId },
        data: { usedCount: { decrement: 1 } },
      });
    }

    return updated;
  });

  // Build response
  const response: Record<string, unknown> = {
    order: {
      id: cancelledOrder.id,
      orderNumber: cancelledOrder.orderNumber,
      status: cancelledOrder.status,
      cancelledAt: cancelledOrder.cancelledAt,
    },
  };

  if (needsRefund) {
    response.refund = {
      eligible: refundEligible,
      amount: refundEligible ? Number(order.totalAmount) : 0,
      policy: order.event.refundPolicy,
      note: refundEligible
        ? "Refund will be processed within 5-7 business days"
        : "This event has a non-refundable policy",
    };
  }

  return successResponse({
    data: response,
    message: "Order cancelled successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
