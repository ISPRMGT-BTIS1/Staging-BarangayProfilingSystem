import { supabase } from "./supabaseClient";

export async function logAudit(tableName, recordId, actionType, performedBy, details) {
  try {
    await supabase.from("audit_log").insert([{
      table_name: tableName,
      record_id: recordId,
      action_type: actionType,
      performed_by: performedBy,
      details: typeof details === "string" ? details : JSON.stringify(details)
    }]);
  } catch (err) {
    console.error("Failed to log audit to Supabase", err);
  }
}
