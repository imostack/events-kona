import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
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
// Helpers
// =====================

function canCheckInTickets(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

// =====================
// POST: Check In Ticket
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
          startDate: true,
          endDate: true,
          isCancelled: true,
        },
      },
      ticketType: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  if (!ticket) {
    return notFoundError("Ticket not found");
  }

  // Check permission - only organizer or admin can check in
  if (!canCheckInTickets(ticket.event, request.user)) {
    return forbiddenError("You don't have permission to check in tickets for this event");
  }

  // Validate ticket can be checked in
  if (ticket.status !== "ACTIVE") {
    return errorResponse({
      message: `Cannot check in a ${ticket.status.toLowerCase()} ticket`,
      status: 400,
      code: "TICKET_NOT_ACTIVE",
    });
  }

  if (ticket.checkedIn) {
    return errorResponse({
      message: "Ticket has already been checked in",
      status: 400,
      code: "ALREADY_CHECKED_IN",
      details: {
        checkedInAt: ticket.checkedInAt,
        checkedInBy: ticket.checkedInBy,
      },
    });
  }

  if (ticket.event.isCancelled) {
    return errorResponse({
      message: "Cannot check in ticket for a cancelled event",
      status: 400,
      code: "EVENT_CANCELLED",
    });
  }

  // Check in the ticket
  const checkedInTicket = await prisma.ticket.update({
    where: { id },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: request.user.sub,
      status: "USED",
    },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      checkedIn: true,
      checkedInAt: true,
      attendeeName: true,
      attendeeEmail: true,
      ticketType: {
        select: {
          name: true,
          type: true,
        },
      },
    },
  });

  return successResponse({
    data: checkedInTicket,
    message: `${ticket.attendeeName || "Attendee"} checked in successfully`,
  });
}

// =====================
// DELETE: Undo Check In (Admin only)
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Only admins can undo check-ins
  if (request.user.role !== "ADMIN") {
    return forbiddenError("Only administrators can undo check-ins");
  }

  // Get ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: {
      id: true,
      checkedIn: true,
      status: true,
    },
  });

  if (!ticket) {
    return notFoundError("Ticket not found");
  }

  if (!ticket.checkedIn) {
    return errorResponse({
      message: "Ticket is not checked in",
      status: 400,
      code: "NOT_CHECKED_IN",
    });
  }

  // Undo check-in
  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      checkedIn: false,
      checkedInAt: null,
      checkedInBy: null,
      status: "ACTIVE",
    },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      checkedIn: true,
      attendeeName: true,
    },
  });

  return successResponse({
    data: updatedTicket,
    message: "Check-in undone successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
