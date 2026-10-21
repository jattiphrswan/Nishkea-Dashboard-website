-- ============================================================================
-- Migration 005: Finance, Payment Ledgers, Supplier Dues & Operating Expenses
-- Node 12: Payment/Expense Records, Balances & Business Financial Reports
-- ============================================================================

-- 1. Customer Payments (Incoming payments from retail & wholesale clients)
CREATE TABLE IF NOT EXISTS customer_payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    order_number TEXT NOT NULL,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('RAZORPAY_UPI', 'RAZORPAY_CARD', 'RAZORPAY_NETBANKING', 'BANK_TRANSFER_NEFT', 'CASH_ON_DELIVERY', 'CHEQUE')),
    gateway_txn_id VARCHAR(100) UNIQUE NOT NULL,
    payment_type VARCHAR(50) NOT NULL DEFAULT 'FULL_PAYMENT' CHECK (payment_type IN ('FULL_PAYMENT', 'PARTIAL_PAYMENT', 'ADVANCE_DEPOSIT', 'FINAL_SETTLEMENT')),
    allocated_to_order BOOLEAN NOT NULL DEFAULT true,
    received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_payments_order ON customer_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_payments_received_at ON customer_payments(received_at);

-- 2. Supplier Disbursements (Outgoing disbursements against purchase orders)
CREATE TABLE IF NOT EXISTS supplier_disbursements (
    id TEXT PRIMARY KEY,
    purchase_order_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    purchase_order_number TEXT NOT NULL,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    supplier_name TEXT NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    disbursement_method VARCHAR(50) NOT NULL CHECK (disbursement_method IN ('NEFT_RTGS', 'CHEQUE', 'CORPORATE_UPI', 'WIRE_TRANSFER')),
    bank_reference VARCHAR(100) UNIQUE NOT NULL,
    disbursement_type VARCHAR(50) NOT NULL DEFAULT 'ADVANCE_DEPOSIT' CHECK (disbursement_type IN ('ADVANCE_DEPOSIT', 'PROGRESS_PAYMENT', 'FINAL_SETTLEMENT')),
    disbursed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_supplier_disbursements_po ON supplier_disbursements(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_disbursements_supplier ON supplier_disbursements(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_disbursements_date ON supplier_disbursements(disbursed_at);

-- 3. Operating Overhead Expenses
CREATE TABLE IF NOT EXISTS operating_expenses (
    id TEXT PRIMARY KEY,
    expense_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'SHOWROOM_RENT',
        'LOGISTICS_PACKAGING',
        'MARKETING_MEDIA',
        'UTILITIES_SECURITY',
        'STUDIO_EQUIPMENT',
        'INSURANCE_VAULT',
        'LEGAL_PROFESSIONAL',
        'OFFICE_ADMIN'
    )),
    description TEXT NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    tax_minor BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    vendor_name VARCHAR(255) NOT NULL,
    invoice_reference VARCHAR(100),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'BANK_TRANSFER' CHECK (payment_mode IN ('BANK_TRANSFER', 'CORPORATE_CARD', 'UPI', 'PETTY_CASH')),
    status VARCHAR(50) NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    approved_by VARCHAR(100),
    expense_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_operating_expenses_category ON operating_expenses(category);
CREATE INDEX IF NOT EXISTS idx_operating_expenses_date ON operating_expenses(expense_date);

-- 4. Customer Refunds Ledger
CREATE TABLE IF NOT EXISTS refund_records (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    order_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    refund_method VARCHAR(50) NOT NULL CHECK (refund_method IN ('GATEWAY_REVERSAL', 'BANK_NEFT', 'STORE_CREDIT')),
    gateway_refund_id VARCHAR(100) UNIQUE NOT NULL,
    reason TEXT NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refund_records_order ON refund_records(order_id);
CREATE INDEX IF NOT EXISTS idx_refund_records_processed_at ON refund_records(processed_at);
