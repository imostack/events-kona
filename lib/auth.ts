import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const ADMIN_ACCESS_TOKEN_EXPIRY = "8h";

// =====================
// Password Hashing
// =====================

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// =====================
// Password Validation
// =====================

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]{8,}$/;

export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message:
        "Password must include uppercase, lowercase, number, and special character",
    };
  }
  return { valid: true };
}

// =====================
// JWT Token Generation
// =====================

export interface TokenPayload {
  sub: string; // user ID
  email: string;
  role: string;
}

export interface AdminTokenPayload {
  sub: string; // admin ID
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateAdminAccessToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, {
    expiresIn: ADMIN_ACCESS_TOKEN_EXPIRY,
  });
}

export function generateAdminRefreshToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, ADMIN_JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

// =====================
// JWT Token Verification
// =====================

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

// =====================
// Random Token Generation
// =====================

export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `EVK-${timestamp}-${random}`;
}

export function generateTicketNumber(): string {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `TKT-${random}`;
}

// =====================
// Token Extraction
// =====================

export function extractBearerToken(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
