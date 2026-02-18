import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

async function handler(request: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("[auth/google] Missing JWT_SECRET or REFRESH_TOKEN_SECRET in environment");
    return errorResponse({ message: "Internal server error", status: 500 });
  }

  let body: { accessToken?: string };
  try {
    body = await request.json();
  } catch {
    return errorResponse({ message: "Invalid request body", status: 400 });
  }

  const { accessToken: googleAccessToken } = body;
  if (!googleAccessToken) {
    return errorResponse({ message: "Google access token is required", status: 400 });
  }

  // Fetch user info from Google using the access token
  let googleUser: GoogleUserInfo;
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });
    if (!res.ok) {
      return errorResponse({ message: "Invalid Google token", status: 401 });
    }
    googleUser = await res.json();
  } catch {
    return errorResponse({ message: "Failed to verify Google token", status: 401 });
  }

  if (!googleUser.email) {
    return errorResponse({ message: "Could not retrieve email from Google", status: 401 });
  }

  const { email, given_name, family_name, picture, sub: googleId } = googleUser;

  // Check if user already exists
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Existing user — check if suspended
    if (user.status === "SUSPENDED") {
      return errorResponse({
        message: "Your account has been suspended. Please contact support.",
        status: 403,
        code: "ACCOUNT_SUSPENDED",
      });
    }

    if (user.status === "DELETED") {
      return errorResponse({
        message: "This account is no longer available.",
        status: 401,
      });
    }

    // Link Google provider if not already linked
    if (!user.authProvider) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: "google",
          authProviderId: googleId,
          avatarUrl: user.avatarUrl || picture || null,
          emailVerified: true,
        },
      });
    }
  } else {
    // Create new user via Google
    user = await prisma.user.create({
      data: {
        email,
        firstName: given_name || null,
        lastName: family_name || null,
        avatarUrl: picture || null,
        authProvider: "google",
        authProviderId: googleId,
        emailVerified: true,
      },
    });
  }

  // Generate tokens
  const tokenPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLoginAt: new Date(),
    },
  });

  return successResponse({
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        organizerName: user.organizerName,
        organizerSlug: user.organizerSlug,
      },
      accessToken,
      refreshToken,
    },
    message: "Login successful",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
