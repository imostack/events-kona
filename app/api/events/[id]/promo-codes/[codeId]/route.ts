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
  params: Promise<{ id: string; codeId: string }>;
};

// =====================
// Schemas
// =====================

const updatePromoCodeSchema = z.object({
  discountValue: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  maxUsesPerUser: z.number().int().positive().optional(),
  minOrderAmount: z.number().min(0).optional().nullable(),
  validFrom: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  validUntil: z.string().optional().nullable().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  isActive: z.boolean().optional(),
});

// =====================
// Helpers
// =====================

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  if (user.role === "ADMIN") return true;
  return event.organizerId === user.sub;
}

// =====================
// GET: Get Single Promo Code
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId, codeId } = await context.params;

  const promoCode = await prisma.promoCode.findFirst({
    where: {
      id: codeId,
      eventId,
    },
    include: {
      event: {
        select: {
          id: true,
          organizerId: true,
        },
      },
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
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!promoCode) {
    return notFoundError("Promo code not found");
  }

  // Check permission
  if (!canManageEvent(promoCode.event, request.user)) {
    return forbiddenError("You don't have permission to view this promo code");
  }

  return successResponse({
    data: {
      id: promoCode.id,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      maxUses: promoCode.maxUses,
      usedCount: promoCode.usedCount,
      maxUsesPerUser: promoCode.maxUsesPerUser,
      minOrderAmount: promoCode.minOrderAmount,
      validFrom: promoCode.validFrom,
      validUntil: promoCode.validUntil,
      isActive: promoCode.isActive,
      appliesToAllTicketTypes: promoCode.appliesToAllTicketTypes,
      ticketTypes: promoCode.ticketTypes.map((t) => t.ticketType),
      ordersUsed: promoCode._count.orders,
    },
  });
}

// =====================
// PUT: Update Promo Code
// =====================

async function putHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId, codeId } = await context.params;

  // Get promo code
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      id: codeId,
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

  if (!promoCode) {
    return notFoundError("Promo code not found");
  }

  // Check permission
  if (!canManageEvent(promoCode.event, request.user)) {
    return forbiddenError("You don't have permission to update this promo code");
  }

  // Validate body
  const validation = await validateBody(request, updatePromoCodeSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Validate percentage discount doesn't exceed 100
  if (
    data.discountValue !== undefined &&
    promoCode.discountType === "PERCENTAGE" &&
    data.discountValue > 100
  ) {
    return errorResponse({
      message: "Percentage discount cannot exceed 100%",
      status: 400,
      code: "INVALID_DISCOUNT",
    });
  }

  // Build update object
  const updateData: Record<string, unknown> = {};

  if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
  if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
  if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser;
  if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount;
  if (data.validFrom !== undefined) {
    updateData.validFrom = data.validFrom ? new Date(data.validFrom) : null;
  }
  if (data.validUntil !== undefined) {
    updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Update promo code
  const updatedCode = await prisma.promoCode.update({
    where: { id: codeId },
    data: updateData,
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
    },
  });

  return successResponse({
    data: updatedCode,
    message: "Promo code updated successfully",
  });
}

// =====================
// DELETE: Delete Promo Code
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id: eventId, codeId } = await context.params;

  // Get promo code
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      id: codeId,
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
        select: { orders: true },
      },
    },
  });

  if (!promoCode) {
    return notFoundError("Promo code not found");
  }

  // Check permission
  if (!canManageEvent(promoCode.event, request.user)) {
    return forbiddenError("You don't have permission to delete this promo code");
  }

  // Prevent deletion if code has been used
  if (promoCode.usedCount > 0 || promoCode._count.orders > 0) {
    return errorResponse({
      message: "Cannot delete promo code that has been used. Deactivate it instead.",
      status: 400,
      code: "CODE_IN_USE",
    });
  }

  // Delete promo code (cascade deletes ticket type links)
  await prisma.promoCode.delete({
    where: { id: codeId },
  });

  return successResponse({
    message: "Promo code deleted successfully",
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
export const PUT = withErrorHandler(withAuth(putHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
