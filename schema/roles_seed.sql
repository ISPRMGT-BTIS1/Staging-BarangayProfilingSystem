-- ============================================================
-- BARANGAY PROFILING SYSTEM — ROLES SEED
-- ============================================================
-- Run this script once in your Supabase SQL Editor to
-- insert/replace the four official Barangay role records.
--
-- Role IDs are fixed integers that match the frontend
-- permission constants in frontend/src/shared/lib/permissions.ts
-- ============================================================

-- Clear existing roles (safe during initial setup)
-- WARNING: If users already reference role_id values, disable this line.
-- DELETE FROM roles;

-- Insert / upsert the four Barangay roles
INSERT INTO roles (role_id, role_name) VALUES
  (1, 'Brgy. Captain'),
  (2, 'Brgy. Secretary'),
  (3, 'Brgy. Kagawad'),
  (4, 'Tanod')
ON CONFLICT (role_id) DO UPDATE
  SET role_name = EXCLUDED.role_name;

-- Reset sequence so future auto-generated IDs start after 4
SELECT setval('roles_role_id_seq', 4, true);

-- Verify
SELECT role_id, role_name FROM roles ORDER BY role_id;
