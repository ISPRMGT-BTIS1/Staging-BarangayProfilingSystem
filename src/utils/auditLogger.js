import { auditLog } from "../mockData";

let auditCounter = 1;

export function logAudit(tableName, recordId, actionType, performedBy, details) {
  auditLog.push({
    auditId: `AUD-${Date.now()}-${auditCounter++}`,
    tableName,
    recordId,
    actionType,
    performedBy,
    performedAt: new Date().toISOString(),
    details: typeof details === "string" ? details : JSON.stringify(details)
  });
}
