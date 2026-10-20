-- ==========================================================================
-- NISHKÈA — Relational Schema Migration 002 (PostgreSQL / Neon / Supabase)
-- Node 9: Suppliers, Purchase Approvals & Partial Receipts
-- Enforces: MOQs, lead times, PO approval states, and quantity reconciliation:
-- Ordered = Received + Remaining Pending; Net Accepted = Received - Returned
-- ==========================================================================

-- 1. SUPPLIERS DIRECTORY
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  contact_person VARCHAR(128) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  lead_time_days INTEGER NOT NULL CHECK (lead_time_days >= 0),
  payment_terms VARCHAR(64) DEFAULT 'Net 30',
  status VARCHAR(24) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNDER_EVALUATION', 'SUSPENDED', 'ARCHIVED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(code);

-- 2. SUPPLIER PRODUCT MAPPINGS (MOQ and Wholesale Unit Cost)
CREATE TABLE IF NOT EXISTS supplier_products (
  id VARCHAR(64) PRIMARY KEY,
  supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE CASCADE,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE CASCADE,
  supplier_sku VARCHAR(64) NOT NULL,
  unit_cost_minor INTEGER NOT NULL CHECK (unit_cost_minor >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  minimum_order_quantity INTEGER NOT NULL CHECK (minimum_order_quantity > 0),
  lead_time_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_products_variant ON supplier_products(variant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_products_supplier ON supplier_products(supplier_id);

-- 3. PURCHASE ORDERS & APPROVAL STATES
CREATE TABLE IF NOT EXISTS purchase_orders (
  id VARCHAR(64) PRIMARY KEY,
  po_number VARCHAR(64) UNIQUE NOT NULL,
  supplier_id VARCHAR(64) REFERENCES suppliers(id) ON DELETE RESTRICT,
  status VARCHAR(32) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PARTIALLY_RECEIVED', 'FULFILLED', 'CANCELLED')),
  total_cost_minor INTEGER NOT NULL CHECK (total_cost_minor >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  created_by VARCHAR(64) NOT NULL,
  approved_by VARCHAR(64),
  approval_notes TEXT,
  approved_at TIMESTAMPTZ,
  expected_delivery_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);

-- 4. PURCHASE ORDER LINES (Ordered, Received, and Returned Quantities)
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id BIGSERIAL PRIMARY KEY,
  po_id VARCHAR(64) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE RESTRICT,
  ordered_quantity INTEGER NOT NULL CHECK (ordered_quantity > 0),
  received_quantity INTEGER DEFAULT 0 CHECK (received_quantity >= 0),
  returned_quantity INTEGER DEFAULT 0 CHECK (returned_quantity >= 0),
  unit_cost_minor INTEGER NOT NULL CHECK (unit_cost_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK (line_total_minor >= 0),
  CONSTRAINT chk_po_received_bounded CHECK (received_quantity <= ordered_quantity),
  CONSTRAINT chk_po_returned_bounded CHECK (returned_quantity <= received_quantity)
);

CREATE INDEX IF NOT EXISTS idx_po_lines_po ON purchase_order_lines(po_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_variant ON purchase_order_lines(variant_id);
