-- ============================================================
-- BARANGAY PROFILING SYSTEM - DATABASE SCHEMA
-- Updated per June 29 revision notes
-- Engine: Microsoft SQL Server (T-SQL)
-- ============================================================

-- ------------------------------------------------------------
-- 1. BARANGAYS
-- Supports scaling to multiple barangays (e.g. near Benilde / Sta. Ana area)
-- ------------------------------------------------------------
CREATE TABLE barangays (
    barangay_id     INT IDENTITY(1,1) PRIMARY KEY,
    barangay_name   VARCHAR(100) NOT NULL,
    city            VARCHAR(100) NOT NULL,        -- e.g. "Manila", "Taguig"
    zone_id         VARCHAR(20)  NULL,             -- optional zone grouping within city
    is_active       BIT DEFAULT 1,
    created_at      DATETIME DEFAULT GETDATE()
);

-- ------------------------------------------------------------
-- 2. STREETS
-- Second level of the barangay -> street -> house no. process flow
-- ------------------------------------------------------------
CREATE TABLE streets (
    street_id       INT IDENTITY(1,1) PRIMARY KEY,
    barangay_id     INT NOT NULL,
    street_name     VARCHAR(150) NOT NULL,
    CONSTRAINT fk_street_barangay
        FOREIGN KEY (barangay_id) REFERENCES barangays(barangay_id)
);

-- ------------------------------------------------------------
-- 3. ADDRESSES
-- Refactored: barangay -> street -> house no. (via streets FK)
-- Status column removed (moved to Household/Resident level instead)
-- ------------------------------------------------------------
CREATE TABLE addresses (
    address_id      INT IDENTITY(1,1) PRIMARY KEY,
    street_id       INT NOT NULL,
    house_no        VARCHAR(30) NOT NULL,
    unit_no         VARCHAR(30) NULL,              -- for apartments/dorms sharing one house_no
    CONSTRAINT fk_address_street
        FOREIGN KEY (street_id) REFERENCES streets(street_id),
    CONSTRAINT uq_full_address UNIQUE (street_id, house_no, unit_no)  -- flags duplicate addresses
);

-- ------------------------------------------------------------
-- 4. HOUSEHOLDS
-- One address can have one household; one household can hold multiple families.
-- residency_length no longer lives here -- moved to Residents (see notes).
-- ------------------------------------------------------------
CREATE TABLE households (
    household_id          INT IDENTITY(1,1) PRIMARY KEY,
    address_id             INT NOT NULL,
    household_head_id      INT NULL,               -- FK to residents, set after resident is created
    household_type         VARCHAR(20) NOT NULL DEFAULT 'House'
        CONSTRAINT ck_household_type CHECK (household_type IN ('House','Apartment','Boarding House','Compound','Other')),
    household_contact_no   VARCHAR(20) NULL,        -- single contact number representing the household
    created_at              DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_household_address
        FOREIGN KEY (address_id) REFERENCES addresses(address_id)
);

-- ------------------------------------------------------------
-- 5. FAMILIES
-- member_count column removed -- derive count via COUNT(resident_id) query instead.
-- ------------------------------------------------------------
CREATE TABLE families (
    family_id        INT IDENTITY(1,1) PRIMARY KEY,
    household_id      INT NOT NULL,
    family_head_id    INT NULL,                    -- FK to residents, set after resident is created
    family_status     VARCHAR(20) NOT NULL DEFAULT 'Active'
        CONSTRAINT ck_family_status CHECK (family_status IN ('Active','Transferred','Inactive')),
    created_at        DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_family_household
        FOREIGN KEY (household_id) REFERENCES households(household_id)
);

-- ------------------------------------------------------------
-- 6. RESIDENTS
-- - Age column removed (compute from birth_date)
-- - Name split into first/middle/last
-- - company column added (occupation now paired with company/workplace)
-- - is_dependent flags whether the resident is the family head or not
-- - parent_id (self-referencing FK) answers "sino mga anak ko" / links children to a parent
--   resident record, independent of who the family_head is
-- - household_id + residency_length moved here from Addresses
-- - emergency contact fields added
-- - created_by / updated_by support the audit trail requirement
-- ------------------------------------------------------------
CREATE TABLE residents (
    resident_id              INT IDENTITY(1,1) PRIMARY KEY,
    first_name                VARCHAR(100) NOT NULL,
    middle_name                VARCHAR(100) NULL,
    last_name                  VARCHAR(100) NOT NULL,
    birth_date                  DATE NOT NULL,
    sex                          VARCHAR(10) NOT NULL
        CONSTRAINT ck_resident_sex CHECK (sex IN ('Male','Female','Other')),
    civil_status                 VARCHAR(20) NOT NULL
        CONSTRAINT ck_resident_civil_status CHECK (civil_status IN ('Single','Married','Widowed','Separated','Other')),
    contact_number                VARCHAR(20) NULL,
    occupation                     VARCHAR(150) NULL,
    company                        VARCHAR(150) NULL,   -- workplace/employer, "complete with the area"
    citizenship                     VARCHAR(100) DEFAULT 'Filipino',
    residency_status                 VARCHAR(20) NOT NULL DEFAULT 'Active'
        CONSTRAINT ck_resident_residency_status CHECK (residency_status IN ('Active','Inactive','Moved','Deceased')),
    residency_length_years             DECIMAL(4,1) NULL,  -- moved from Addresses per notes
    is_dependent                        BIT DEFAULT 1,     -- 0 = this resident IS a family head

    household_id                         INT NOT NULL,
    family_id                             INT NOT NULL,
    parent_id                              INT NULL,       -- self-referencing: links a child to a parent resident

    emergency_contact_name                  VARCHAR(150) NULL,
    emergency_contact_relationship           VARCHAR(50)  NULL,
    emergency_contact_number                  VARCHAR(20)  NULL,

    created_by     INT NULL,
    created_at     DATETIME DEFAULT GETDATE(),
    updated_by     INT NULL,
    updated_at     DATETIME DEFAULT GETDATE(),

    CONSTRAINT fk_resident_household
        FOREIGN KEY (household_id) REFERENCES households(household_id),
    CONSTRAINT fk_resident_family
        FOREIGN KEY (family_id) REFERENCES families(family_id),
    CONSTRAINT fk_resident_parent
        FOREIGN KEY (parent_id) REFERENCES residents(resident_id)
);

-- Now that residents exists, wire up household_head_id / family_head_id
ALTER TABLE households
    ADD CONSTRAINT fk_household_head
    FOREIGN KEY (household_head_id) REFERENCES residents(resident_id);

ALTER TABLE families
    ADD CONSTRAINT fk_family_head
    FOREIGN KEY (family_head_id) REFERENCES residents(resident_id);

-- ------------------------------------------------------------
-- 7. RESIDENT_STATUSES
-- A resident can hold MORE THAN ONE status at once (e.g. Senior AND PWD),
-- so this is a separate table instead of one flat "status" column.
-- Filtering for reports: WHERE status_type = 'Senior Citizen', etc.
-- ------------------------------------------------------------
CREATE TABLE resident_statuses (
    resident_status_id   INT IDENTITY(1,1) PRIMARY KEY,
    resident_id            INT NOT NULL,
    status_type             VARCHAR(20) NOT NULL
        CONSTRAINT ck_status_type CHECK (status_type IN ('Senior Citizen','PWD','Voter','Student','Solo Parent','Indigent','Other')),
    date_added                DATE DEFAULT CAST(GETDATE() AS DATE),
    notes                      VARCHAR(255) NULL,
    CONSTRAINT fk_status_resident
        FOREIGN KEY (resident_id) REFERENCES residents(resident_id)
        ON DELETE CASCADE,
    CONSTRAINT uq_resident_status UNIQUE (resident_id, status_type)
);

-- ------------------------------------------------------------
-- 8. ROLES & USERS
-- Supports role-based access control (barangay staff vs officials)
-- ------------------------------------------------------------
CREATE TABLE roles (
    role_id     INT IDENTITY(1,1) PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE    -- e.g. 'Barangay Staff', 'Barangay Official', 'Admin'
);

CREATE TABLE users (
    user_id         INT IDENTITY(1,1) PRIMARY KEY,
    username         VARCHAR(50) NOT NULL UNIQUE,
    password_hash     VARCHAR(255) NOT NULL,
    full_name          VARCHAR(150) NOT NULL,
    role_id             INT NOT NULL,
    barangay_id          INT NOT NULL,          -- which barangay this user manages
    is_active             BIT DEFAULT 1,
    created_at             DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id),
    CONSTRAINT fk_user_barangay
        FOREIGN KEY (barangay_id) REFERENCES barangays(barangay_id)
);

-- Now that users exists, wire up residents.created_by / updated_by
ALTER TABLE residents
    ADD CONSTRAINT fk_resident_created_by
    FOREIGN KEY (created_by) REFERENCES users(user_id);

ALTER TABLE residents
    ADD CONSTRAINT fk_resident_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(user_id);

-- ------------------------------------------------------------
-- 9. AUDIT_LOG
-- Generic audit trail across tables (covers "who edited the resident?")
-- ------------------------------------------------------------
CREATE TABLE audit_log (
    audit_id       INT IDENTITY(1,1) PRIMARY KEY,
    table_name       VARCHAR(50) NOT NULL,
    record_id          INT NOT NULL,
    action_type          VARCHAR(10) NOT NULL
        CONSTRAINT ck_audit_action CHECK (action_type IN ('CREATE','UPDATE','DELETE')),
    performed_by            INT NULL,
    performed_at              DATETIME DEFAULT GETDATE(),
    details                     VARCHAR(MAX) NULL,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (performed_by) REFERENCES users(user_id)
);

-- ============================================================
-- NOTE ON "ON UPDATE" AUTO-TIMESTAMPS
-- SQL Server has no built-in "ON UPDATE CURRENT_TIMESTAMP" like MySQL.
-- If you want updated_at to auto-refresh whenever a resident row changes,
-- add this trigger:
-- ============================================================
GO
CREATE TRIGGER trg_residents_updated_at
ON residents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE r
    SET r.updated_at = GETDATE()
    FROM residents r
    INNER JOIN inserted i ON r.resident_id = i.resident_id;
END;
GO

-- ============================================================
-- USEFUL QUERIES (examples matching the revision notes)
-- ============================================================

-- a) "Ilang family members ni Fajardo? click to see the names"
--    Step 1: count members per family
--    SELECT family_id, COUNT(*) AS member_count
--    FROM residents
--    GROUP BY family_id;
--    Step 2: on click, list the actual names
--    SELECT resident_id, CONCAT(first_name,' ',ISNULL(middle_name,''),' ',last_name) AS full_name
--    FROM residents
--    WHERE family_id = @family_id;

-- b) "Sino mga anak ko?" (who are my children)
--    SELECT resident_id, CONCAT(first_name,' ',last_name) AS child_name
--    FROM residents
--    WHERE parent_id = @resident_id;

-- c) Full hierarchical view: Barangay -> Street -> Address -> Household -> Family -> Resident
--    SELECT b.barangay_name, s.street_name, a.house_no, h.household_id,
--           f.family_id, r.resident_id,
--           CONCAT(r.first_name,' ',r.last_name) AS resident_name
--    FROM residents r
--    JOIN families f ON r.family_id = f.family_id
--    JOIN households h ON r.household_id = h.household_id
--    JOIN addresses a ON h.address_id = a.address_id
--    JOIN streets s ON a.street_id = s.street_id
--    JOIN barangays b ON s.barangay_id = b.barangay_id;

-- d) Senior citizens report (status-based)
--    SELECT r.resident_id, CONCAT(r.first_name,' ',r.last_name) AS full_name, r.birth_date
--    FROM residents r
--    JOIN resident_statuses rs ON r.resident_id = rs.resident_id
--    WHERE rs.status_type = 'Senior Citizen' AND r.residency_status = 'Active';
