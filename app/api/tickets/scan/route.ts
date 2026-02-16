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
// Schemas
// =====================

const scanTicketSchema = z.object({
  // Can scan by QR code or ticket number
  qrCode: z.string().optional(),
  ticketNumber: z.string().optional(),
  eventId: z.string().min(1, "Event ID is required"),
  action: z.enum(["validate", "check_in"]).default("check_in"),
}).refine((data) => data.qrCode || data.ticketNumber, {
  message: "Either qrCode or ticketNumber is required",
});

// =====================
// POST: Scan Ticket
// =====================

async function postHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, scanTicketSchema);
  if (!validation.success) return validation.response;

  const { qrCode, ticketNumber, eventId, action } = validation.data;

  // Verify event exists and user has permission
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      organizerId: true,
      startDate: true,
      endDate: true,
      isCancelled: true,
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  const isAdmin = request.user.role === "ADMIN";
  const isOrganizer = event.organizerId === request.user.sub;

  if (!isAdmin && !isOrganizer) {
    return forbiddenError("You don't have permission to scan tickets for this event");
  }

  // Find ticket
  const ticket = await prisma.ticket.findFirst({
    where: {
      eventId,
      OR: [
        ...(qrCode ? [{ qrCode }] : []),
        ...(ticketNumber ? [{ ticketNumber }] : []),
      ],
    },
    include: {
      ticketType: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
      },
    },
  });

  if (!ticket) {
    return errorResponse({
      message: "Ticket not found for this event",
      status: 404,
      code: "TICKET_NOT_FOUND",
    });
  }

  // Build response with ticket status
  const response: Record<string, unknown> = {
    ticket: {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      checkedIn: ticket.checkedIn,
      checkedInAt: ticket.checkedInAt,
      attendeeName: ticket.attendeeName || `${ticket.user.firstName} ${ticket.user.lastName}`,
      attendeeEmail: ticket.attendeeEmail || ticket.user.email,
      ticketType: ticket.ticketType,
      order: ticket.order,
    },
  };

  // Validate ticket
  if (ticket.status !== "ACTIVE") {
    response.valid = false;
    response.reason = `Ticket is ${ticket.status.toLowerCase()}`;
    return successResponse({ data: response });
  }

  if (ticket.checkedIn) {
    response.valid = false;
    response.reason = "Ticket already checked in";
    response.checkedInAt = ticket.checkedInAt;
    return successResponse({ data: response });
  }

  if (event.isCancelled) {
    response.valid = false;
    response.reason = "Event is cancelled";
    return successResponse({ data: response });
  }

  // Ticket is valid
  response.valid = true;

  // If action is just validate, return without checking in
  if (action === "validate") {
    return successResponse({ data: response });
  }

  // Check in the ticket
  const checkedInTicket = await prisma.ticket.update({
    where: { id: ticket.id },
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
    },
  });

  response.ticket = { ...response.ticket, ...checkedInTicket };
  response.action = "checked_in";
  response.message = `${ticket.attendeeName || "Attendee"} checked in successfully`;

  return successResponse({ data: response });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
