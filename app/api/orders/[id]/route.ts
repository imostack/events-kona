import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
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
// GET: Get Order Details
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          startDate: true,
          startTime: true,
          endDate: true,
          endTime: true,
          venueName: true,
          address: true,
          city: true,
          state: true,
          country: true,
          eventFormat: true,
          onlineUrl: true,
          organizer: {
            select: {
              id: true,
              organizerName: true,
              organizerSlug: true,
              email: true,
            },
          },
        },
      },
      orderItems: {
        include: {
          ticketType: {
            select: {
              id: true,
              name: true,
              description: true,
              type: true,
            },
          },
        },
      },
      tickets: {
        select: {
          id: true,
          ticketNumber: true,
          qrCode: true,
          status: true,
          checkedIn: true,
          checkedInAt: true,
          attendeeName: true,
          attendeeEmail: true,
          ticketType: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          status: true,
          method: true,
          paidAt: true,
          paymentReference: true,
        },
      },
      promoCode: {
        select: {
          code: true,
          discountType: true,
          discountValue: true,
        },
      },
    },
  });

  if (!order) {
    return notFoundError("Order not found");
  }

  // Check permission - user can only see their own orders
  // Admins and event organizers can see orders for their events
  const isOwner = order.userId === request.user.sub;
  const isAdmin = request.user.role === "ADMIN";
  const isEventOrganizer = order.event.organizer.id === request.user.sub;

  if (!isOwner && !isAdmin && !isEventOrganizer) {
    return forbiddenError("You don't have permission to view this order");
  }

  return successResponse({ data: order });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
