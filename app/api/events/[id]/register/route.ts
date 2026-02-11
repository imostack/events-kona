import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundError,
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
// POST: Register for a Free Event
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      isFree: true,
      isPublished: true,
      isCancelled: true,
      capacity: true,
      startDate: true,
      ticketTypes: {
        where: { isActive: true },
        select: { id: true },
        take: 1,
      },
      _count: {
        select: { registrations: true },
      },
    },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  if (!event.isPublished) {
    return errorResponse({
      message: "This event is not available for registration",
      status: 400,
      code: "NOT_PUBLISHED",
    });
  }

  if (event.isCancelled) {
    return errorResponse({
      message: "This event has been cancelled",
      status: 400,
      code: "EVENT_CANCELLED",
    });
  }

  // Check if event is in the past
  const now = new Date();
  if (new Date(event.startDate) < now) {
    return errorResponse({
      message: "This event has already started",
      status: 400,
      code: "EVENT_PAST",
    });
  }

  // Check capacity
  if (event.capacity && event._count.registrations >= event.capacity) {
    return errorResponse({
      message: "This event is at full capacity",
      status: 400,
      code: "AT_CAPACITY",
    });
  }

  // Check if user already registered
  const existingRegistration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: request.user.sub,
        eventId: id,
      },
    },
  });

  if (existingRegistration) {
    if (existingRegistration.status === "CANCELLED") {
      // Re-register
      const updated = await prisma.registration.update({
        where: { id: existingRegistration.id },
        data: { status: "REGISTERED" },
      });
      return successResponse({
        data: updated,
        message: "You have been re-registered for this event",
      });
    }
    return errorResponse({
      message: "You are already registered for this event",
      status: 400,
      code: "ALREADY_REGISTERED",
    });
  }

  // Create registration
  const registration = await prisma.registration.create({
    data: {
      userId: request.user.sub,
      eventId: id,
      ticketTypeId: event.ticketTypes[0]?.id || null,
      status: "REGISTERED",
    },
  });

  // Increment ticketsSold count on the event
  await prisma.event.update({
    where: { id },
    data: { ticketsSold: { increment: 1 } },
  });

  return successResponse({
    data: registration,
    message: `Successfully registered for "${event.title}"`,
    status: 201,
  });
}

// =====================
// GET: Check registration status
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: request.user.sub,
        eventId: id,
      },
    },
  });

  return successResponse({
    data: {
      isRegistered: !!registration && registration.status !== "CANCELLED",
      registration,
    },
  });
}

// =====================
// DELETE: Cancel registration
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const registration = await prisma.registration.findUnique({
    where: {
      userId_eventId: {
        userId: request.user.sub,
        eventId: id,
      },
    },
  });

  if (!registration) {
    return notFoundError("Registration not found");
  }

  if (registration.status === "CANCELLED") {
    return errorResponse({
      message: "Registration is already cancelled",
      status: 400,
      code: "ALREADY_CANCELLED",
    });
  }

  await prisma.registration.update({
    where: { id: registration.id },
    data: { status: "CANCELLED" },
  });

  // Decrement ticketsSold
  await prisma.event.update({
    where: { id },
    data: { ticketsSold: { decrement: 1 } },
  });

  return successResponse({
    message: "Registration cancelled successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const GET = withErrorHandler(withAuth(getHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
