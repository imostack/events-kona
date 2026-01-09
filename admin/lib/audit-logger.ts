import { AuditLog } from "@/types/admin";

class AuditLogger {
  private logs: AuditLog[] = [];
  private storageKey = "admin_audit_logs";

  constructor() {
    if (typeof window !== "undefined") {
      this.loadLogs();
    }
  }

  private loadLogs() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.logs = JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse audit logs:", error);
        this.logs = [];
      }
    }
  }

  private saveLogs() {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    }
  }

  log(
    adminId: string,
    adminName: string,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>
  ) {
    const logEntry: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      adminId,
      adminName,
      action,
      resource,
      resourceId,
      details: details || {},
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1", // In production, this would come from the request
    };

    this.logs.unshift(logEntry);

    // Keep only the last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    this.saveLogs();
  }

  getLogs(filters?: {
    adminId?: string;
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): AuditLog[] {
    let filtered = [...this.logs];

    if (filters?.adminId) {
      filtered = filtered.filter((log) => log.adminId === filters.adminId);
    }

    if (filters?.resource) {
      filtered = filtered.filter((log) => log.resource === filters.resource);
    }

    if (filters?.action) {
      filtered = filtered.filter((log) => log.action === filters.action);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= new Date(filters.startDate!)
      );
    }

    if (filters?.endDate) {
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) <= new Date(filters.endDate!)
      );
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
}

export const auditLogger = new AuditLogger();
