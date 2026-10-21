-- ==========================================================================
-- NISHKÈA — Relational Schema Migration 003 (PostgreSQL / Neon / Supabase)
-- Node 10: CRM, Wholesale / Retail Customer Segmentation & Sales Pipeline
-- Enforces: Customer segmentation, marketing consent separation,
-- lead pipeline stages, follow-up tracking, and team task recurrence.
-- ==========================================================================

-- 1. CUSTOMERS DIRECTORY (Retail & Wholesale Segmentation)
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32) NOT NULL,
  segment VARCHAR(24) DEFAULT 'RETAIL' CHECK (segment IN ('RETAIL', 'WHOLESALE')),
  company_name VARCHAR(128),
  gst_number VARCHAR(32),
  marketing_consent BOOLEAN DEFAULT FALSE,
  total_orders INTEGER DEFAULT 0 CHECK (total_orders >= 0),
  total_spend_minor BIGINT DEFAULT 0 CHECK (total_spend_minor >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- 2. CRM LEADS & SALES PIPELINE (Enquiry -> Qualified -> Quotation -> Won / Lost)
CREATE TABLE IF NOT EXISTS crm_leads (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(32),
  segment VARCHAR(24) DEFAULT 'RETAIL' CHECK (segment IN ('RETAIL', 'WHOLESALE')),
  lead_source VARCHAR(32) DEFAULT 'WEBSITE' CHECK (lead_source IN ('WEBSITE', 'CONCIERGE_AI', 'INSTAGRAM', 'WALK_IN', 'WHATSAPP_ENQUIRY')),
  stage VARCHAR(32) DEFAULT 'ENQUIRY' CHECK (stage IN ('ENQUIRY', 'QUALIFIED', 'QUOTATION', 'WON', 'LOST')),
  lost_reason TEXT,
  estimated_value_minor INTEGER DEFAULT 0 CHECK (estimated_value_minor >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  owner_name VARCHAR(128),
  next_follow_up_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_crm_lost_reason CHECK (stage != 'LOST' OR (lost_reason IS NOT NULL AND length(trim(lost_reason)) > 0))
);

CREATE INDEX IF NOT EXISTS idx_crm_leads_customer ON crm_leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_owner ON crm_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON crm_leads(stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_followup ON crm_leads(next_follow_up_date);

-- 3. CRM ACTIVITY AUDIT TIMELINE
CREATE TABLE IF NOT EXISTS crm_activities (
  id BIGSERIAL PRIMARY KEY,
  lead_id VARCHAR(64) REFERENCES crm_leads(id) ON DELETE CASCADE,
  actor_id VARCHAR(64),
  activity_type VARCHAR(32) NOT NULL CHECK (activity_type IN ('NOTE', 'STAGE_CHANGE', 'CALL', 'EMAIL', 'MEETING', 'QUOTATION_SENT')),
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON crm_activities(lead_id);

-- 4. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS support_tickets (
  id VARCHAR(64) PRIMARY KEY,
  ticket_number VARCHAR(64) UNIQUE NOT NULL,
  customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  priority VARCHAR(16) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(24) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED')),
  category VARCHAR(32) DEFAULT 'PRODUCT_ENQUIRY' CHECK (category IN ('ORDER_STATUS', 'CUSTOMIZATION', 'RETURN_EXCHANGE', 'PRODUCT_ENQUIRY')),
  assigned_to VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  linked_order_number VARCHAR(64),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_assigned ON support_tickets(assigned_to);

-- 5. RECURRENCE ENHANCEMENT FOR TASKS
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence VARCHAR(24) CHECK (recurrence IN ('DAILY', 'WEEKLY', 'MONTHLY'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_generated_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
