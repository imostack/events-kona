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
import crypto from "crypto";

// =====================
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// Schemas
// =====================

const initiateTransferSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
  recipientName: z.string().optional(),
});

// =====================
// POST: Initiate Ticket Transfer
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const validation = await validateBody(request, initiateTransferSchema);
  if (!validation.success) return validation.response;

  const { recipientEmail, recipientName } = validation.data;

  // Get ticket
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          isCancelled: true,
        },
      },
    },
  });

  if (!ticket) {
    return notFoundError("Ticket not found");
  }

  // Check ownership
  if (ticket.userId !== request.user.sub) {
    return forbiddenError("You can only transfer your own tickets");
  }

  // Check ticket is transferable
  if (ticket.status !== "ACTIVE") {
    return errorResponse({
      message: `Cannot transfer a ${ticket.status.toLowerCase()} ticket`,
      status: 400,
      code: "TICKET_NOT_ACTIVE",
    });
  }

  if (ticket.checkedIn) {
    return errorResponse({
      message: "Cannot transfer a checked-in ticket",
      status: 400,
      code: "TICKET_CHECKED_IN",
    });
  }

  if (ticket.event.isCancelled) {
    return errorResponse({
      message: "Cannot transfer ticket for a cancelled event",
      status: 400,
      code: "EVENT_CANCELLED",
    });
  }

  if (ticket.event.startDate < new Date()) {
    return errorResponse({
      message: "Cannot transfer ticket for a past event",
      status: 400,
      code: "EVENT_PAST",
    });
  }

  // Check if there's an existing pending transfer
  const existingTransfer = await prisma.ticketTransfer.findFirst({
    where: {
      ticketId: id,
      status: "PENDING",
    },
  });

  if (existingTransfer) {
    return errorResponse({
      message: "This ticket already has a pending transfer",
      status: 400,
      code: "TRANSFER_EXISTS",
    });
  }

  // Check if recipient already has this ticket (by email)
  const recipientUser = await prisma.user.findUnique({
    where: { email: recipientEmail.toLowerCase() },
    select: { id: true },
  });

  // Generate transfer token
  const transferToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  // Create transfer request
  const transfer = await prisma.ticketTransfer.create({
    data: {
      ticketId: id,
      fromUserId: request.user.sub,
      toUserId: recipientUser?.id,
      toEmail: recipientEmail.toLowerCase(),
      token: transferToken,
      status: "PENDING",
      expiresAt,
    },
    select: {
      id: true,
      toEmail: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // Update ticket with transfer info
  await prisma.ticket.update({
    where: { id },
    data: {
      transferToken,
      transferTo: recipientEmail.toLowerCase(),
    },
  });

  // TODO: Send email to recipient with transfer link
  // The link would be something like: ${APP_URL}/tickets/accept-transfer?token=${transferToken}

  return successResponse({
    data: {
      transfer,
      message: `Transfer initiated. ${recipientName || recipientEmail} will receive an email to accept the ticket.`,
      expiresAt,
    },
    status: 201,
  });
}

// =====================
// DELETE: Cancel Transfer
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get ticket with pending transfer
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      transferHistory: {
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!ticket) {
    return notFoundError("Ticket not found");
  }

  // Check ownership
  if (ticket.userId !== request.user.sub) {
    return forbiddenError("You can only cancel your own transfers");
  }

  const pendingTransfer = ticket.transferHistory[0];

  if (!pendingTransfer) {
    return errorResponse({
      message: "No pending transfer found",
      status: 400,
      code: "NO_PENDING_TRANSFER",
    });
  }

  // Cancel transfer
  await prisma.$transaction([
    prisma.ticketTransfer.update({
      where: { id: pendingTransfer.id },
      data: { status: "CANCELLED" },
    }),
    prisma.ticket.update({
      where: { id },
      data: {
        transferToken: null,
        transferTo: null,
      },
    }),
  ]);

  return successResponse({
    message: "Transfer cancelled successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
