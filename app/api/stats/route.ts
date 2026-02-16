import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const [eventCount, organizerCount, totalRegistrations] = await Promise.all([
      prisma.event.count({
        where: { status: "PUBLISHED" },
      }),
      prisma.user.count({
        where: { role: "ORGANIZER" },
      }),
      prisma.registration.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        events: eventCount,
        organizers: organizerCount,
        attendees: totalRegistrations,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: true, data: { events: 0, organizers: 0, attendees: 0 } },
    );
  }
}
