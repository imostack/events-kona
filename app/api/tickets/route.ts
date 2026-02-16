import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateQuery } from "@/lib/validate";
import { successResponse, buildPagination } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Schemas
// =====================

const listTicketsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || "10", 10), 50)),
  status: z.enum(["ACTIVE", "USED", "CANCELLED", "REFUNDED", "TRANSFERRED", "all"]).optional(),
  eventId: z.string().optional(),
  upcoming: z.string().optional().transform((val) => val === "true"),
  past: z.string().optional().transform((val) => val === "true"),
});

// =====================
// GET: Get User's Tickets
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const { searchParams } = new URL(request.url);
  const validation = validateQuery(searchParams, listTicketsQuerySchema);
  if (!validation.success) return validation.response;

  const { page, limit, status, eventId, upcoming, past } = validation.data;

  const where: Record<string, unknown> = {
    userId: request.user.sub,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (eventId) {
    where.eventId = eventId;
  }

  // Filter by upcoming/past events
  if (upcoming && !past) {
    where.event = { startDate: { gte: new Date() } };
  } else if (past && !upcoming) {
    where.event = { startDate: { lt: new Date() } };
  }

  const total = await prisma.ticket.count({ where });

  const tickets = await prisma.ticket.findMany({
    where,
    select: {
      id: true,
      ticketNumber: true,
      qrCode: true,
      status: true,
      checkedIn: true,
      checkedInAt: true,
      attendeeName: true,
      attendeeEmail: true,
      createdAt: true,
      ticketType: {
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
        },
      },
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
          country: true,
          eventFormat: true,
          onlineUrl: true,
          isCancelled: true,
          organizer: {
            select: {
              id: true,
              organizerName: true,
              organizerSlug: true,
            },
          },
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
    orderBy: [
      { event: { startDate: "asc" } },
      { createdAt: "desc" },
    ],
    skip: (page - 1) * limit,
    take: limit,
  });

  // Add computed fields
  const ticketsWithStatus = tickets.map((ticket) => {
    const now = new Date();
    const eventStart = new Date(ticket.event.startDate);

    let eventStatus: "upcoming" | "ongoing" | "past" = "upcoming";
    if (eventStart < now) {
      eventStatus = ticket.event.endDate && new Date(ticket.event.endDate) > now ? "ongoing" : "past";
    }

    return {
      ...ticket,
      eventStatus,
      isUsable: ticket.status === "ACTIVE" && !ticket.event.isCancelled && eventStatus !== "past",
    };
  });

  return successResponse({
    data: ticketsWithStatus,
    pagination: buildPagination(page, limit, total),
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
