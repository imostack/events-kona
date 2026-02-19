import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const [eventCount, organizerCount, ticketCount, registrationCount] = await Promise.all([
      prisma.event.count({
        where: { isPublished: true, isCancelled: false, status: "APPROVED" },
      }),
      prisma.user.count({
        where: { role: { in: ["ORGANIZER", "ADMIN"] } },
      }),
      // Paid attendees: tickets from completed orders
      prisma.ticket.count({
        where: { order: { status: "COMPLETED" } },
      }),
      // Free attendees: direct registrations
      prisma.registration.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        events: eventCount,
        organizers: organizerCount,
        attendees: ticketCount + registrationCount,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: true, data: { events: 0, organizers: 0, attendees: 0 } },
    );
  }
}
