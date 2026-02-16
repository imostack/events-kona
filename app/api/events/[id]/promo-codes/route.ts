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
  params: Promise<{ id: string }>;
};

// =====================
// Schemas
// =====================

const createPromoCodeSchema = z.object({
  code: z.string().min(3).max(20).transform((val) => val.toUpperCase()),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount must be positive"),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().optional().default(1),
  minOrderAmount: z.number().min(0).optional(),
  validFrom: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  validUntil: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  appliesToAllTicketTypes: z.boolean().optional().default(true),
  ticketTypeIds: z.array(z.string()).optional(),
});

// =====================
// Helpers
// =====================

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

// =====================
// GET: List Promo Codes for Event
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId } = await context.params;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, organizerId: true },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to view promo codes for this event");
  }

  const promoCodes = await prisma.promoCode.findMany({
    where: { eventId },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      maxUses: true,
      usedCount: true,
      maxUsesPerUser: true,
      minOrderAmount: true,
      validFrom: true,
      validUntil: true,
      isActive: true,
      appliesToAllTicketTypes: true,
      ticketTypes: {
        select: {
          ticketType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Flatten ticket types
  const formattedCodes = promoCodes.map((code) => ({
    ...code,
    ticketTypes: code.ticketTypes.map((t) => t.ticketType),
  }));

  return successResponse({ data: formattedCodes });
}

// =====================
// POST: Create Promo Code
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId } = await context.params;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, organizerId: true },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(event, request.user)) {
    return forbiddenError("You don't have permission to create promo codes for this event");
  }

  // Validate body
  const validation = await validateBody(request, createPromoCodeSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Validate percentage discount doesn't exceed 100
  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    return errorResponse({
      message: "Percentage discount cannot exceed 100%",
      status: 400,
      code: "INVALID_DISCOUNT",
    });
  }

  // Check for duplicate code
  const existingCode = await prisma.promoCode.findUnique({
    where: {
      eventId_code: {
        eventId,
        code: data.code,
      },
    },
  });

  if (existingCode) {
    return errorResponse({
      message: "A promo code with this name already exists for this event",
      status: 409,
      code: "DUPLICATE_CODE",
    });
  }

  // Validate ticket type IDs if provided
  if (data.ticketTypeIds && data.ticketTypeIds.length > 0) {
    const validTicketTypes = await prisma.ticketType.count({
      where: {
        id: { in: data.ticketTypeIds },
        eventId,
      },
    });

    if (validTicketTypes !== data.ticketTypeIds.length) {
      return errorResponse({
        message: "One or more ticket type IDs are invalid",
        status: 400,
        code: "INVALID_TICKET_TYPES",
      });
    }
  }

  // Create promo code
  const promoCode = await prisma.promoCode.create({
    data: {
      eventId,
      code: data.code,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses,
      maxUsesPerUser: data.maxUsesPerUser,
      minOrderAmount: data.minOrderAmount,
      validFrom: data.validFrom ? new Date(data.validFrom) : null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      appliesToAllTicketTypes: data.appliesToAllTicketTypes,
      ticketTypes: data.ticketTypeIds && !data.appliesToAllTicketTypes ? {
        create: data.ticketTypeIds.map((ticketTypeId) => ({
          ticketTypeId,
        })),
      } : undefined,
    },
    select: {
      id: true,
      code: true,
      discountType: true,
      discountValue: true,
      maxUses: true,
      usedCount: true,
      maxUsesPerUser: true,
      minOrderAmount: true,
      validFrom: true,
      validUntil: true,
      isActive: true,
      appliesToAllTicketTypes: true,
    },
  });

  return successResponse({
    data: promoCode,
    message: "Promo code created successfully",
    status: 201,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
export const POST = withErrorHandler(withAuth(postHandler));
