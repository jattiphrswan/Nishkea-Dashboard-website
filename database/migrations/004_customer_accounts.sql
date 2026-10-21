-- ==========================================================================
-- NISHKÈA — Relational Schema Migration 004 (PostgreSQL / Neon / Supabase)
-- Node 11: Client Account Portal, Contact Experience & Password Management
-- Enforces: Salted PBKDF2 customer passwords, client session isolation,
-- customer delivery addresses, and personal order tracking.
-- ==========================================================================

-- 1. EXTEND CUSTOMERS WITH SECURE CREDENTIALS AND ADDRESSES
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city VARCHAR(128);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS state VARCHAR(128);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code VARCHAR(32);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(64) DEFAULT 'India';

-- 2. CUSTOMER AUTHENTICATION SESSIONS (Isolated from staff sessions)
CREATE TABLE IF NOT EXISTS customer_sessions (
  id VARCHAR(64) PRIMARY KEY,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cust_sessions_token ON customer_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_cust_sessions_customer ON customer_sessions(customer_id);

-- 3. STOREFRONT CONTACT INQUIRIES
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32),
  inquiry_type VARCHAR(64) DEFAULT 'GENERAL' CHECK (inquiry_type IN ('GENERAL', 'BESPOKE_CONSULTATION', 'BRIDAL_TROUSSEAU', 'ORDER_SUPPORT', 'BOUTIQUE_VISIT')),
  preferred_location VARCHAR(64) DEFAULT 'MUMBAI_ATELIER',
  message TEXT NOT NULL,
  status VARCHAR(24) DEFAULT 'NEW' CHECK (status IN ('NEW', 'ASSIGNED', 'CONTACTED', 'RESOLVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
