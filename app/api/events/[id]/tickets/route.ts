import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
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
// Schemas
// =====================

const createTicketTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  type: z
    .enum(["REGULAR", "VIP", "EARLY_BIRD", "GROUP", "STUDENT", "MEMBER"])
    .optional()
    .default("REGULAR"),
  price: z.number().min(0, "Price cannot be negative"),
  currency: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
  maxPerOrder: z.number().int().positive().optional().default(10),
  minPerOrder: z.number().int().positive().optional().default(1),
  salesStartDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid sales start date",
  }),
  salesEndDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid sales end date",
  }),
  isHidden: z.boolean().optional().default(false),
});

// =====================
// Helpers
// =====================

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

async function updateEventPriceRange(eventId: string) {
  const ticketTypes = await prisma.ticketType.findMany({
    where: { eventId, isActive: true },
    select: { price: true },
  });

  if (ticketTypes.length === 0) {
    await prisma.event.update({
      where: { id: eventId },
      data: { minTicketPrice: null, maxTicketPrice: null },
    });
    return;
  }

  const prices = ticketTypes.map((t) => Number(t.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  await prisma.event.update({
    where: { id: eventId },
    data: { minTicketPrice: minPrice, maxTicketPrice: maxPrice },
  });
}

// =====================
// GET: List Ticket Types (Public)
// =====================

async function getHandler(
  request: NextRequest,
  context: RouteContext
) {
  const { id: eventId } = await context.params;

  // Check event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, isPublished: true, organizerId: true },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // For unpublished events, check if user is owner
  if (!event.isPublished) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const { verifyAccessToken, extractBearerToken } = await import("@/lib/auth");
      const token = extractBearerToken(authHeader);
      const user = token ? verifyAccessToken(token) : null;

      if (!user || (user.role !== "ADMIN" && event.organizerId !== user.sub)) {
        return notFoundError("Event not found");
      }
    } else {
      return notFoundError("Event not found");
    }
  }

  // Get ticket types
  const ticketTypes = await prisma.ticketType.findMany({
    where: {
      eventId,
      isActive: true,
      isHidden: false,
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      price: true,
      currency: true,
      quantity: true,
      quantitySold: true,
      maxPerOrder: true,
      minPerOrder: true,
      salesStartDate: true,
      salesEndDate: true,
      isActive: true,
    },
    orderBy: { price: "asc" },
  });

  // Add availability info
  const ticketTypesWithAvailability = ticketTypes.map((ticket) => {
    const available = ticket.quantity - ticket.quantitySold;
    const now = new Date();

    let status: "available" | "sold_out" | "not_started" | "ended" = "available";

    if (available <= 0) {
      status = "sold_out";
    } else if (ticket.salesStartDate && new Date(ticket.salesStartDate) > now) {
      status = "not_started";
    } else if (ticket.salesEndDate && new Date(ticket.salesEndDate) < now) {
      status = "ended";
    }

    return {
      ...ticket,
      available,
      status,
    };
  });

  return successResponse({ data: ticketTypesWithAvailability });
}

// =====================
// POST: Create Ticket Type (Owner/Admin)
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId } = await context.params;

  // Check event exists and get ownership
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, organizerId: true, currency: true },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to manage this event's tickets");
  }

  // Validate body
  const validation = await validateBody(request, createTicketTypeSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Create ticket type
  const ticketType = await prisma.ticketType.create({
    data: {
      eventId,
      name: data.name,
      description: data.description,
      type: data.type,
      price: data.price,
      currency: data.currency || event.currency,
      quantity: data.quantity,
      maxPerOrder: data.maxPerOrder,
      minPerOrder: data.minPerOrder,
      salesStartDate: data.salesStartDate ? new Date(data.salesStartDate) : null,
      salesEndDate: data.salesEndDate ? new Date(data.salesEndDate) : null,
      isHidden: data.isHidden,
    },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      price: true,
      currency: true,
      quantity: true,
      quantitySold: true,
      maxPerOrder: true,
      minPerOrder: true,
      salesStartDate: true,
      salesEndDate: true,
      isActive: true,
      isHidden: true,
    },
  });

  // Update event price range
  await updateEventPriceRange(eventId);

  return successResponse({
    data: ticketType,
    message: "Ticket type created successfully",
    status: 201,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(withAuth(postHandler));
