-- ============================================================
-- BARANGAY PROFILING SYSTEM - POSTGRESQL SCHEMA (SUPABASE)
-- ============================================================

-- 1. BARANGAYS
CREATE TABLE barangays (
    barangay_id SERIAL PRIMARY KEY,
    barangay_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    zone_id VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STREETS
CREATE TABLE streets (
    street_id SERIAL PRIMARY KEY,
    barangay_id INTEGER NOT NULL REFERENCES barangays(barangay_id),
    street_name VARCHAR(150) NOT NULL
);

-- 3. ADDRESSES
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    street_id INTEGER NOT NULL REFERENCES streets(street_id),
    house_no VARCHAR(30) NOT NULL,
    unit_no VARCHAR(30),
    CONSTRAINT uq_full_address UNIQUE (street_id, house_no, unit_no)
);

-- 4. HOUSEHOLDS
-- Note: household_head_id will be added after residents table exists
CREATE TABLE households (
    household_id SERIAL PRIMARY KEY,
    address_id INTEGER NOT NULL REFERENCES addresses(address_id),
    household_head_id INTEGER,
    household_type VARCHAR(20) DEFAULT 'House' 
        CHECK (household_type IN ('House','Apartment','Boarding House','Compound','Other')),
    household_contact_no VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. FAMILIES
CREATE TABLE families (
    family_id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL REFERENCES households(household_id),
    family_head_id INTEGER,
    family_status VARCHAR(20) DEFAULT 'Active' 
        CHECK (family_status IN ('Active','Transferred','Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RESIDENTS
CREATE TABLE residents (
    resident_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    sex VARCHAR(10) NOT NULL 
        CHECK (sex IN ('Male','Female','Other')),
    civil_status VARCHAR(20) NOT NULL 
        CHECK (civil_status IN ('Single','Married','Widowed','Separated','Other')),
    contact_number VARCHAR(20),
    occupation VARCHAR(150),
    company VARCHAR(150),
    citizenship VARCHAR(100) DEFAULT 'Filipino',
    residency_status VARCHAR(20) DEFAULT 'Active' 
        CHECK (residency_status IN ('Active','Inactive','Moved','Deceased')),
    residency_length_years DECIMAL(4,1),
    is_dependent BOOLEAN DEFAULT TRUE,
    household_id INTEGER NOT NULL REFERENCES households(household_id),
    family_id INTEGER NOT NULL REFERENCES families(family_id),
    parent_id INTEGER REFERENCES residents(resident_id),
    emergency_contact_name VARCHAR(150),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_number VARCHAR(20),
    created_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wire up head IDs
ALTER TABLE households ADD CONSTRAINT fk_household_head FOREIGN KEY (household_head_id) REFERENCES residents(resident_id);
ALTER TABLE families ADD CONSTRAINT fk_family_head FOREIGN KEY (family_head_id) REFERENCES residents(resident_id);

-- 7. RESIDENT_STATUSES
CREATE TABLE resident_statuses (
    resident_status_id SERIAL PRIMARY KEY,
    resident_id INTEGER NOT NULL REFERENCES residents(resident_id) ON DELETE CASCADE,
    status_type VARCHAR(20) NOT NULL 
        CHECK (status_type IN ('Senior Citizen','PWD','Voter','Student','Solo Parent','Indigent','Other')),
    date_added DATE DEFAULT CURRENT_DATE,
    notes VARCHAR(255),
    CONSTRAINT uq_resident_status UNIQUE (resident_id, status_type)
);

-- 8. ROLES & USERS
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(role_id),
    barangay_id INTEGER NOT NULL REFERENCES barangays(barangay_id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Complete Resident wiring
ALTER TABLE residents ADD CONSTRAINT fk_resident_created_by FOREIGN KEY (created_by) REFERENCES users(user_id);
ALTER TABLE residents ADD CONSTRAINT fk_resident_updated_by FOREIGN KEY (updated_by) REFERENCES users(user_id);

-- 9. AUDIT_LOG
CREATE TABLE audit_log (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('CREATE','UPDATE','DELETE')),
    performed_by INTEGER REFERENCES users(user_id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details TEXT
);

-- 10. POSTGRES TRIGGER FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_residents_updated_at
BEFORE UPDATE ON residents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();