import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// GET: List attendees for an event (organizer/admin only)
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Verify event exists and user is the organizer
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      organizerId: true,
      title: true,
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  if (event.organizerId !== request.user.sub && request.user.role !== "ADMIN") {
    return errorResponse({
      message: "Only the event organizer can view attendees",
      status: 403,
      code: "FORBIDDEN",
    });
  }

  // Get attendees from completed orders with their tickets
  const tickets = await prisma.ticket.findMany({
    where: {
      order: {
        eventId: id,
        status: { in: ["COMPLETED", "PENDING"] },
      },
    },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      checkedIn: true,
      checkedInAt: true,
      attendeeName: true,
      attendeeEmail: true,
      createdAt: true,
      ticketType: {
        select: {
          name: true,
          type: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          buyerName: true,
          buyerEmail: true,
          totalAmount: true,
          currency: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Also get free registrations (from the register endpoint, not through orders)
  const registrations = await prisma.registration.findMany({
    where: {
      eventId: id,
      status: "REGISTERED",
    },
    select: {
      id: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({
    data: {
      tickets,
      registrations: registrations.map((r) => ({
        id: r.id,
        name: [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") || "User",
        email: r.user.email,
        avatar: r.user.avatarUrl,
        registeredAt: r.createdAt,
      })),
      totalTickets: tickets.length,
      totalRegistrations: registrations.length,
      checkedIn: tickets.filter((t) => t.checkedIn).length,
    },
  });
}

export const GET = withErrorHandler(withAuth(getHandler));
