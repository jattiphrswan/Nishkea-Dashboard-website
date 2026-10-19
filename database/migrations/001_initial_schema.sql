-- ==========================================================================
-- NISHKÈA — Relational Schema Migration 001 (PostgreSQL / Neon / Supabase)
-- Node 3: Database, Migrations, Authentication & Permissions
-- Enforces: Integer minor currency, non-negative stock, RBAC, and audit logs.
-- ==========================================================================

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(64) PRIMARY KEY,
  action VARCHAR(64) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(32) REFERENCES roles(id) ON DELETE CASCADE,
  permission_id VARCHAR(64) REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. STAFF USERS & SESSIONS
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(128) NOT NULL,
  role_id VARCHAR(32) REFERENCES roles(id) ON DELETE RESTRICT,
  status VARCHAR(24) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  user_agent TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- 3. AUDIT LOGS (Immutable security and operational events)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_id VARCHAR(64),
  action VARCHAR(64) NOT NULL,
  resource_type VARCHAR(64) NOT NULL,
  resource_id VARCHAR(64),
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 4. MERCHANDISING: CATEGORIES & COLLECTIONS
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  description TEXT,
  default_sales_unit VARCHAR(24) DEFAULT 'piece' CHECK (default_sales_unit IN ('pair', 'piece', 'set', 'pack')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  slug VARCHAR(128) UNIQUE NOT NULL,
  collection_type VARCHAR(32) DEFAULT 'permanent' CHECK (collection_type IN ('permanent', 'monthly_trend', 'limited', 'seasonal')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. PRODUCTS & VARIANTS
CREATE TABLE IF NOT EXISTS product_designs (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  category_id VARCHAR(64) REFERENCES categories(id) ON DELETE RESTRICT,
  collection_id VARCHAR(64) REFERENCES collections(id) ON DELETE SET NULL,
  lifecycle VARCHAR(32) DEFAULT 'active' CHECK (lifecycle IN ('draft', 'active', 'under_review', 'clearance', 'discontinued', 'archived')),
  publish_state VARCHAR(24) DEFAULT 'draft' CHECK (publish_state IN ('draft', 'published', 'hidden')),
  sales_unit VARCHAR(24) DEFAULT 'piece' CHECK (sales_unit IN ('pair', 'piece', 'set', 'pack')),
  price_minor INTEGER NOT NULL CHECK (price_minor >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  launch_date DATE,
  review_date DATE,
  reorder_policy VARCHAR(32) DEFAULT 'review_required',
  materials TEXT,
  care_instructions TEXT,
  dimensions TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_designs_slug ON product_designs(slug);
CREATE INDEX IF NOT EXISTS idx_designs_category ON product_designs(category_id);
CREATE INDEX IF NOT EXISTS idx_designs_review ON product_designs(review_date);

CREATE TABLE IF NOT EXISTS product_variants (
  id VARCHAR(64) PRIMARY KEY,
  design_id VARCHAR(64) REFERENCES product_designs(id) ON DELETE CASCADE,
  sku VARCHAR(64) UNIQUE NOT NULL,
  colour VARCHAR(64) NOT NULL,
  size VARCHAR(64),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_variants_design ON product_variants(design_id);

-- 6. TRANSACTIONAL INVENTORY: BATCHES & MOVEMENTS (FIFO Ledger)
CREATE TABLE IF NOT EXISTS stock_batches (
  id VARCHAR(64) PRIMARY KEY,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE RESTRICT,
  batch_reference VARCHAR(64) NOT NULL,
  unit_cost_minor INTEGER NOT NULL CHECK (unit_cost_minor >= 0),
  initial_quantity INTEGER NOT NULL CHECK (initial_quantity >= 0),
  current_quantity INTEGER NOT NULL CHECK (current_quantity >= 0),
  received_date DATE NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batches_variant ON stock_batches(variant_id);
CREATE INDEX IF NOT EXISTS idx_batches_received ON stock_batches(received_date);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,
  batch_id VARCHAR(64) REFERENCES stock_batches(id) ON DELETE RESTRICT,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL, -- Signed: + for incoming receipt, - for dispatch/damage
  movement_type VARCHAR(32) NOT NULL CHECK (movement_type IN ('RECEIPT', 'DISPATCH', 'RESERVATION_HOLD', 'RESERVATION_RELEASE', 'DAMAGE', 'RETURN_RESTOCK', 'ADJUSTMENT')),
  source_ref VARCHAR(128),
  actor_id VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_movements_batch ON stock_movements(batch_id);

-- 7. RESERVATIONS (Checkout Atomic Holds)
CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(64) PRIMARY KEY,
  order_ref VARCHAR(64),
  expires_at TIMESTAMPTZ NOT NULL,
  state VARCHAR(24) DEFAULT 'ACTIVE' CHECK (state IN ('ACTIVE', 'CONSUMED', 'EXPIRED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservation_lines (
  id BIGSERIAL PRIMARY KEY,
  reservation_id VARCHAR(64) REFERENCES reservations(id) ON DELETE CASCADE,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE RESTRICT,
  batch_id VARCHAR(64) REFERENCES stock_batches(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_reservations_expiry ON reservations(expires_at) WHERE state = 'ACTIVE';

-- 8. ORDERS & ORDER LINES (Price Snapshot)
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  order_number VARCHAR(64) UNIQUE NOT NULL,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  total_minor INTEGER NOT NULL CHECK (total_minor >= 0),
  currency VARCHAR(3) DEFAULT 'INR',
  payment_status VARCHAR(32) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'REFUNDED_RETURN')),
  fulfillment_status VARCHAR(32) DEFAULT 'UNFULFILLED' CHECK (fulfillment_status IN ('UNFULFILLED', 'PENDING_PICKING', 'PACKED', 'DISPATCHED', 'RETURNED_INSPECTED')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_lines (
  id BIGSERIAL PRIMARY KEY,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE CASCADE,
  variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE RESTRICT,
  sku VARCHAR(64) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_minor INTEGER NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor INTEGER NOT NULL CHECK (line_total_minor >= 0)
);

-- 9. 30-DAY REVIEW DECISIONS & TEAM TASKS
CREATE TABLE IF NOT EXISTS review_decisions (
  id VARCHAR(64) PRIMARY KEY,
  design_id VARCHAR(64) REFERENCES product_designs(id) ON DELETE CASCADE,
  decision VARCHAR(32) NOT NULL CHECK (decision IN ('CONTINUE_30_DAYS', 'MAKE_PERMANENT', 'MOVE_TO_CLEARANCE', 'DISCONTINUE')),
  reason TEXT NOT NULL,
  actor_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  priority VARCHAR(16) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(24) DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE')),
  assigned_to_user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  linked_record VARCHAR(128),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
