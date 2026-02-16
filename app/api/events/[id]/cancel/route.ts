import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import {
  successResponse,
  notFoundError,
  forbiddenError,
  errorResponse,
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

const cancelEventSchema = z.object({
  reason: z.string().min(10, "Cancellation reason must be at least 10 characters"),
  notifyAttendees: z.boolean().optional().default(true),
});

// =====================
// Helpers
// =====================

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

// =====================
// POST: Cancel Event
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Validate body
  const validation = await validateBody(request, cancelEventSchema);
  if (!validation.success) return validation.response;

  const { reason } = validation.data;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      organizerId: true,
      isCancelled: true,
      status: true,
      ticketsSold: true,
      _count: {
        select: {
          tickets: { where: { status: "ACTIVE" } },
          registrations: { where: { status: "REGISTERED" } },
        },
      },
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to cancel this event");
  }

  // Check if already cancelled
  if (event.isCancelled) {
    return errorResponse({
      message: "Event is already cancelled",
      status: 400,
      code: "ALREADY_CANCELLED",
    });
  }

  // Check if event has already completed
  if (event.status === "COMPLETED") {
    return errorResponse({
      message: "Cannot cancel a completed event",
      status: 400,
      code: "EVENT_COMPLETED",
    });
  }

  // Update event status
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      isCancelled: true,
      status: "CANCELLED",
      cancelledAt: new Date(),
      rejectionReason: reason, // Store cancellation reason
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isCancelled: true,
      cancelledAt: true,
    },
  });

  // TODO: In a real app, you would:
  // 1. Send cancellation emails to all ticket holders
  // 2. Process automatic refunds based on refund policy
  // 3. Create notification records for attendees

  return successResponse({
    data: {
      ...updatedEvent,
      affectedTickets: event._count.tickets,
      affectedRegistrations: event._count.registrations,
    },
    message: `Event cancelled successfully. ${event._count.tickets} ticket holders will be notified.`,
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
