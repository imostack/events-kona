import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

const onboardingSchema = z.object({
  firstName: z.string().min(1).trim().optional(),
  lastName: z.string().min(1).trim().optional(),
  phone: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  preferences: z.record(z.unknown()).optional(),
  notificationSettings: z.record(z.unknown()).optional(),
  payoutAccount: z.record(z.unknown()).optional(),
  // Organizer fields (only if becoming organizer)
  becomeOrganizer: z.boolean().optional(),
  organizerName: z.string().min(2).trim().optional(),
  organizerBio: z.string().trim().optional(),
  organizerWebsite: z.string().url().optional().or(z.literal("")),
  organizerLogo: z.string().url().optional().or(z.literal("")),
  organizerSocials: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
});

// GET: Return current user's onboarding data
async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      role: true,
      preferences: true,
      notificationSettings: true,
      organizerName: true,
      organizerSlug: true,
      organizerBio: true,
      organizerLogo: true,
      organizerWebsite: true,
      organizerSocials: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return errorResponse({ message: "User not found", status: 404 });
  }

  return successResponse({ data: user });
}

// POST: Save onboarding data
async function postHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, onboardingSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Build update payload
  const updateData: Record<string, unknown> = {};

  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.phone) updateData.phone = data.phone;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
  // Get current user (for preference merging + organizer check)
  const currentUser = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: { role: true, organizerSlug: true, preferences: true },
  });

  // Merge preferences with existing ones instead of replacing
  if (data.preferences || data.payoutAccount) {
    const existingPrefs = (currentUser?.preferences as Record<string, unknown>) || {};

    if (data.preferences) {
      updateData.preferences = { ...existingPrefs, ...data.preferences };
    }
    if (data.payoutAccount) {
      const mergedPrefs = (updateData.preferences as Record<string, unknown>) || existingPrefs;
      updateData.preferences = { ...mergedPrefs, payoutAccount: data.payoutAccount };
    }
  }
  if (data.notificationSettings) updateData.notificationSettings = data.notificationSettings;

  const isAlreadyOrganizer = currentUser?.role === "ORGANIZER" || currentUser?.role === "ADMIN";

  // Handle organizer upgrade (new organizer)
  if (data.becomeOrganizer && data.organizerName && !isAlreadyOrganizer) {
    // Generate slug from organizer name
    const slug = data.organizerName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existingSlug = await prisma.user.findFirst({
      where: {
        organizerSlug: slug,
        id: { not: request.user.sub },
      },
    });

    if (existingSlug) {
      return errorResponse({
        message: "Organizer name is already taken. Please choose another.",
        status: 409,
        code: "SLUG_EXISTS",
      });
    }

    updateData.role = "ORGANIZER";
    updateData.organizerName = data.organizerName;
    updateData.organizerSlug = slug;
    updateData.organizerSince = new Date();
  }

  // Update organizer fields (for both new and existing organizers)
  if (data.organizerName !== undefined) updateData.organizerName = data.organizerName;
  if (data.organizerBio !== undefined) updateData.organizerBio = data.organizerBio;
  if (data.organizerWebsite !== undefined) updateData.organizerWebsite = data.organizerWebsite;
  if (data.organizerLogo !== undefined) updateData.organizerLogo = data.organizerLogo || null;
  if (data.organizerSocials !== undefined) updateData.organizerSocials = data.organizerSocials;

  const user = await prisma.user.update({
    where: { id: request.user.sub },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      role: true,
      preferences: true,
      organizerName: true,
      organizerSlug: true,
      emailVerified: true,
    },
  });

  return successResponse({
    data: user,
    message: "Onboarding data saved successfully",
  });
}

export const GET = withErrorHandler(withAuth(getHandler));
export const POST = withErrorHandler(withAuth(postHandler));
