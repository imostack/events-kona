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
// GET: Get Single Ticket
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      ticketType: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          price: true,
          currency: true,
        },
      },
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          coverImage: true,
          startDate: true,
          startTime: true,
          endDate: true,
          endTime: true,
          timezone: true,
          doorsOpenTime: true,
          venueName: true,
          address: true,
          city: true,
          state: true,
          country: true,
          eventFormat: true,
          onlineUrl: true,
          platform: true,
          isCancelled: true,
          contactEmail: true,
          contactPhone: true,
          organizer: {
            select: {
              id: true,
              organizerName: true,
              organizerSlug: true,
              organizerLogo: true,
              email: true,
            },
          },
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          buyerName: true,
          buyerEmail: true,
          createdAt: true,
        },
      },
    },
  });

  if (!ticket) {
    return notFoundError("Ticket not found");
  }

  // Check permission - user can view their own tickets
  // Event organizers and admins can also view tickets for their events
  const isOwner = ticket.userId === request.user.sub;
  const isAdmin = request.user.role === "ADMIN";
  const isEventOrganizer = ticket.event.organizer.id === request.user.sub;

  if (!isOwner && !isAdmin && !isEventOrganizer) {
    return forbiddenError("You don't have permission to view this ticket");
  }

  // Calculate event status
  const now = new Date();
  const eventStart = new Date(ticket.event.startDate);
  let eventStatus: "upcoming" | "ongoing" | "past" = "upcoming";
  if (eventStart < now) {
    eventStatus = ticket.event.endDate && new Date(ticket.event.endDate) > now ? "ongoing" : "past";
  }

  return successResponse({
    data: {
      ...ticket,
      eventStatus,
      isUsable: ticket.status === "ACTIVE" && !ticket.event.isCancelled && eventStatus !== "past",
    },
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
