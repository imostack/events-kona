import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { successResponse } from "@/lib/api-response";
import { withRoles, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Schemas
// =====================

const createCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().max(200).optional(),
  sortOrder: z.number().int().optional(),
});

// =====================
// Helpers
// =====================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// =====================
// GET: List Categories (Public)
// =====================

async function getHandler() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      description: true,
      eventCount: true,
      sortOrder: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { name: "asc" },
    ],
  });

  return successResponse({ data: categories });
}

// =====================
// POST: Create Category (Admin only)
// =====================

async function postHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, createCategorySchema);
  if (!validation.success) return validation.response;

  const { name, icon, color, description, sortOrder } = validation.data;

  const slug = generateSlug(name);

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      icon,
      color,
      description,
      sortOrder: sortOrder ?? 0,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      description: true,
      sortOrder: true,
    },
  });

  return successResponse({
    data: category,
    message: "Category created successfully",
    status: 201,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(withRoles(["ADMIN"], postHandler));
