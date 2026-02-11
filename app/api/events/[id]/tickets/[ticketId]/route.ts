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
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string; ticketId: string }>;
};

// =====================
// Schemas
// =====================

const updateTicketTypeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["REGULAR", "VIP", "EARLY_BIRD", "GROUP", "STUDENT", "MEMBER"]).optional(),
  price: z.number().min(0).optional(),
  quantity: z.number().int().positive().optional(),
  maxPerOrder: z.number().int().positive().optional(),
  minPerOrder: z.number().int().positive().optional(),
  salesStartDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid sales start date",
  }),
  salesEndDate: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid sales end date",
  }),
  isActive: z.boolean().optional(),
  isHidden: z.boolean().optional(),
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
// GET: Get Single Ticket Type
// =====================

async function getHandler(
  request: NextRequest,
  context: RouteContext
) {
  const { id: eventId, ticketId } = await context.params;

  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
      eventId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          organizerId: true,
          isPublished: true,
        },
      },
    },
  });

  if (!ticketType) {
    return notFoundError("Ticket type not found");
  }

  // For unpublished events, check auth
  if (!ticketType.event.isPublished) {
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      const { verifyAccessToken, extractBearerToken } = await import("@/lib/auth");
      const token = extractBearerToken(authHeader);
      const user = token ? verifyAccessToken(token) : null;

      if (!user || (user.role !== "ADMIN" && ticketType.event.organizerId !== user.sub)) {
        return notFoundError("Ticket type not found");
      }
    } else {
      return notFoundError("Ticket type not found");
    }
  }

  const available = ticketType.quantity - ticketType.quantitySold;
  const now = new Date();

  let status: "available" | "sold_out" | "not_started" | "ended" = "available";

  if (available <= 0) {
    status = "sold_out";
  } else if (ticketType.salesStartDate && new Date(ticketType.salesStartDate) > now) {
    status = "not_started";
  } else if (ticketType.salesEndDate && new Date(ticketType.salesEndDate) < now) {
    status = "ended";
  }

  return successResponse({
    data: {
      id: ticketType.id,
      name: ticketType.name,
      description: ticketType.description,
      type: ticketType.type,
      price: ticketType.price,
      currency: ticketType.currency,
      quantity: ticketType.quantity,
      quantitySold: ticketType.quantitySold,
      maxPerOrder: ticketType.maxPerOrder,
      minPerOrder: ticketType.minPerOrder,
      salesStartDate: ticketType.salesStartDate,
      salesEndDate: ticketType.salesEndDate,
      isActive: ticketType.isActive,
      isHidden: ticketType.isHidden,
      available,
      status,
      event: ticketType.event,
    },
  });
}

// =====================
// PUT: Update Ticket Type
// =====================

async function putHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId, ticketId } = await context.params;

  // Get ticket type with event info
  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
      eventId,
    },
    include: {
      event: {
        select: {
          id: true,
          organizerId: true,
        },
      },
    },
  });

  if (!ticketType) {
    return notFoundError("Ticket type not found");
  }

  // Check permission
  if (!canManageEvent(ticketType.event, request.user)) {
    return forbiddenError("You don't have permission to manage this ticket type");
  }

  // Validate body
  const validation = await validateBody(request, updateTicketTypeSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // If tickets have been sold, restrict certain changes
  if (ticketType.quantitySold > 0) {
    // Can't reduce quantity below sold amount
    if (data.quantity !== undefined && data.quantity < ticketType.quantitySold) {
      return errorResponse({
        message: `Cannot reduce quantity below sold amount (${ticketType.quantitySold} sold)`,
        status: 400,
        code: "QUANTITY_TOO_LOW",
      });
    }

    // Warn about price changes (but allow them)
    // In a real app, you might want to prevent price changes for sold tickets
  }

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.price !== undefined) updateData.price = data.price;
  if (data.quantity !== undefined) updateData.quantity = data.quantity;
  if (data.maxPerOrder !== undefined) updateData.maxPerOrder = data.maxPerOrder;
  if (data.minPerOrder !== undefined) updateData.minPerOrder = data.minPerOrder;
  if (data.salesStartDate !== undefined) {
    updateData.salesStartDate = data.salesStartDate ? new Date(data.salesStartDate) : null;
  }
  if (data.salesEndDate !== undefined) {
    updateData.salesEndDate = data.salesEndDate ? new Date(data.salesEndDate) : null;
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.isHidden !== undefined) updateData.isHidden = data.isHidden;

  // Update ticket type
  const updatedTicketType = await prisma.ticketType.update({
    where: { id: ticketId },
    data: updateData,
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

  // Update event price range if price or active status changed
  if (data.price !== undefined || data.isActive !== undefined) {
    await updateEventPriceRange(eventId);
  }

  return successResponse({
    data: updatedTicketType,
    message: "Ticket type updated successfully",
  });
}

// =====================
// DELETE: Delete Ticket Type
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId, ticketId } = await context.params;

  // Get ticket type with event info
  const ticketType = await prisma.ticketType.findFirst({
    where: {
      id: ticketId,
      eventId,
    },
    include: {
      event: {
        select: {
          id: true,
          organizerId: true,
        },
      },
      _count: {
        select: {
          tickets: true,
          orderItems: true,
        },
      },
    },
  });

  if (!ticketType) {
    return notFoundError("Ticket type not found");
  }

  // Check permission
  if (!canManageEvent(ticketType.event, request.user)) {
    return forbiddenError("You don't have permission to delete this ticket type");
  }

  // Prevent deletion if tickets have been sold
  if (ticketType.quantitySold > 0 || ticketType._count.tickets > 0 || ticketType._count.orderItems > 0) {
    return errorResponse({
      message: "Cannot delete ticket type with existing sales. Deactivate it instead.",
      status: 400,
      code: "HAS_SALES",
    });
  }

  // Delete ticket type
  await prisma.ticketType.delete({
    where: { id: ticketId },
  });

  // Update event price range
  await updateEventPriceRange(eventId);

  return successResponse({
    message: "Ticket type deleted successfully",
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(withAuth(putHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
