import { supabase } from '../../../utils/supabaseClient';

/**
 * Logs a certificate print/request to the `certificate_requests` table.
 *
 * Table schema expected (create via Supabase dashboard or migration):
 *
 *   CREATE TABLE certificate_requests (
 *     id              BIGSERIAL PRIMARY KEY,
 *     certificate_type TEXT NOT NULL,
 *     resident_name   TEXT,
 *     resident_id     TEXT,
 *     purpose         TEXT,
 *     issued_by       TEXT,          -- userId of the staff
 *     issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     or_number       TEXT,
 *     control_number  TEXT,
 *     status          TEXT NOT NULL DEFAULT 'ISSUED'
 *   );
 *
 * @param {object} params
 * @param {string} params.certificateType  - CertificateType enum value
 * @param {string} [params.residentName]   - Full name of the resident
 * @param {string} [params.residentId]     - residentId from the residents table
 * @param {string} [params.purpose]        - Stated purpose
 * @param {string} [params.issuedBy]       - userId of the logged-in user
 * @param {string} [params.orNumber]       - Optional official receipt number
 * @param {string} [params.controlNumber]  - The generated control number
 */
export async function logCertificateRequest({
  certificateType,
  residentName = null,
  residentId = null,
  purpose = null,
  issuedBy = null,
  orNumber = null,
  controlNumber = null,
}) {
  try {
    const { data: certData, error } = await supabase.from('certificate_requests').insert([{
      certificate_type: certificateType,
      resident_name: residentName,
      resident_id: residentId,
      purpose: purpose,
      issued_by: issuedBy,
      or_number: orNumber,
      control_number: controlNumber,
      status: 'ISSUED',
    }]).select().single();

    if (error) {
      console.warn('[logCertificateRequest] Failed to save record:', error.message);
      return;
    }

    if (certData && certData.id) {
      // Also log to audit_log
      const { error: auditError } = await supabase.from('audit_log').insert([{
        table_name: 'certificate_requests',
        record_id: String(certData.id),
        action_type: 'CREATE',
        performed_by: issuedBy,
      }]);

      if (auditError) {
        console.warn('[logCertificateRequest] Failed to save audit log:', auditError.message);
      }
    }
  } catch (err) {
    console.warn('[logCertificateRequest] Unexpected error:', err);
  }
}

/**
 * Generates a sequential control number for today in the format B46-YYYYMMDD-####.
 */
export async function generateControlNumber() {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // Get count of certificates issued today
    const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
    const endOfDay = new Date(today.setHours(23,59,59,999)).toISOString();

    const { count, error } = await supabase
      .from('certificate_requests')
      .select('*', { count: 'exact', head: true })
      .gte('issued_at', startOfDay)
      .lte('issued_at', endOfDay);

    if (error) throw error;

    const sequence = String((count || 0) + 1).padStart(4, '0');
    return `B46-${dateStr}-${sequence}`;
  } catch (err) {
    console.warn('[generateControlNumber] Failed to generate control number:', err);
    // Fallback if network fails
    const fallbackDate = new Date().toISOString().slice(0,10).replace(/-/g, '');
    const randomSeq = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `B46-${fallbackDate}-${randomSeq}`;
  }
}
