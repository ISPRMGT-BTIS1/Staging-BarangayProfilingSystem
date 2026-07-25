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
 */
export async function logCertificateRequest({
  certificateType,
  residentName = null,
  residentId = null,
  purpose = null,
  issuedBy = null,
  orNumber = null,
}) {
  try {
    const { error } = await supabase.from('certificate_requests').insert([{
      certificate_type: certificateType,
      resident_name: residentName,
      resident_id: residentId,
      purpose: purpose,
      issued_by: issuedBy,
      or_number: orNumber,
      status: 'ISSUED',
    }]);

    if (error) {
      // Non-fatal: log to console but don't interrupt the print workflow
      console.warn('[logCertificateRequest] Failed to save record:', error.message);
    }
  } catch (err) {
    console.warn('[logCertificateRequest] Unexpected error:', err);
  }
}
