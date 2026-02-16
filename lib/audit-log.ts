import { prisma } from "./prisma";

interface AuditLogParams {
  adminId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: params.adminId,
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ? params.details : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    // Audit log failures should not break the main operation
    console.error("Failed to create audit log:", error);
  }
}

// Helper to extract IP and user agent from a request
export function getRequestMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ipAddress = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}
