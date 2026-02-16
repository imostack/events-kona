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

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

// Validate event has required fields for publishing
function validateEventForPublishing(event: {
  title: string;
  description: string;
  startDate: Date;
  eventFormat: string;
  venueName: string | null;
  address: string | null;
  city: string | null;
  onlineUrl: string | null;
  ticketTypes: { id: string }[];
  isFree: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!event.title || event.title.length < 3) {
    errors.push("Event must have a title");
  }

  if (!event.description || event.description.length < 10) {
    errors.push("Event must have a description");
  }

  if (!event.startDate) {
    errors.push("Event must have a start date");
  }

  // Allow events starting today (compare dates only, not times)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (event.startDate && event.startDate < today) {
    errors.push("Event start date must be today or in the future");
  }

  // Check location requirements based on format
  if (event.eventFormat === "IN_PERSON" || event.eventFormat === "HYBRID") {
    if (!event.venueName && !event.address && !event.city) {
      errors.push("In-person events must have a venue or location");
    }
  }

  if (event.eventFormat === "ONLINE" || event.eventFormat === "HYBRID") {
    if (!event.onlineUrl) {
      errors.push("Online events must have a meeting URL");
    }
  }

  // Check for ticket types (unless free event)
  if (!event.isFree && event.ticketTypes.length === 0) {
    errors.push("Paid events must have at least one ticket type");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================
// POST: Publish Event
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get event with ticket types
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: {
        where: { isActive: true },
        select: { id: true },
      },
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to publish this event");
  }

  // Check if already published
  if (event.isPublished) {
    return errorResponse({
      message: "Event is already published",
      status: 400,
      code: "ALREADY_PUBLISHED",
    });
  }

  // Check if cancelled
  if (event.isCancelled) {
    return errorResponse({
      message: "Cannot publish a cancelled event",
      status: 400,
      code: "EVENT_CANCELLED",
    });
  }

  // Validate event is ready for publishing
  const validation = validateEventForPublishing(event);
  if (!validation.valid) {
    return errorResponse({
      message: "Event is not ready for publishing",
      status: 400,
      code: "VALIDATION_FAILED",
      details: validation.errors,
    });
  }

  // Update event status
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      isPublished: true,
      status: "APPROVED", // Auto-approve for now (can add moderation later)
      publishedAt: new Date(),
      approvedAt: new Date(),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPublished: true,
      publishedAt: true,
    },
  });

  return successResponse({
    data: updatedEvent,
    message: "Event published successfully",
  });
}

// =====================
// DELETE: Unpublish Event
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      organizerId: true,
      isPublished: true,
      ticketsSold: true,
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to unpublish this event");
  }

  // Check if not published
  if (!event.isPublished) {
    return errorResponse({
      message: "Event is not published",
      status: 400,
      code: "NOT_PUBLISHED",
    });
  }

  // Warn if tickets have been sold
  if (event.ticketsSold > 0) {
    return errorResponse({
      message: "Cannot unpublish event with sold tickets. Consider cancelling instead.",
      status: 400,
      code: "HAS_SALES",
    });
  }

  // Update event status
  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      isPublished: false,
      status: "DRAFT",
      publishedAt: null,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPublished: true,
    },
  });

  return successResponse({
    data: updatedEvent,
    message: "Event unpublished successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
