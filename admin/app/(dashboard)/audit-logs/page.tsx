"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Calendar, Download } from "lucide-react";
import { auditLogger } from "@/lib/audit-logger";
import { AuditLog } from "@/types/admin";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterResource, setFilterResource] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = auditLogger.getLogs();
    setLogs(allLogs);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesResource = filterResource === "all" || log.resource === filterResource;
    const matchesAction = filterAction === "all" || log.action === filterAction;
    return matchesSearch && matchesResource && matchesAction;
  });

  const exportLogs = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "text-green-600";
    if (action.includes("update")) return "text-blue-600";
    if (action.includes("delete") || action.includes("ban")) return "text-red-600";
    if (action.includes("login")) return "text-purple-600";
    return "text-foreground";
  };

  const resources = Array.from(new Set(logs.map((log) => log.resource)));
  const actions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track all administrative actions and system events
          </p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by admin, action, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Resources</option>
              {resources.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Admin
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Action
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Resource
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  Resource ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground font-medium">
                      {log.adminName}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground capitalize">
                      {log.resource.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {log.resourceId || "-"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground font-mono">
                      {log.ipAddress}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {logs.length === 0
                  ? "No audit logs yet. Actions will be logged here."
                  : "No logs match your filters"}
              </p>
            </div>
          )}
        </div>

        {filteredLogs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} total logs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
