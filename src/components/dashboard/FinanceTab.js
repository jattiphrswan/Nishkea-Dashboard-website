'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Plus,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Receipt,
  Building2,
  Package,
  Layers,
  X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

export default function FinanceTab() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState({
    customerPayments: [],
    supplierDisbursements: [],
    operatingExpenses: [],
    refunds: []
  });
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('receipts'); // 'receipts' | 'disbursements' | 'expenses' | 'refunds' | 'reconciliation'

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'SHOWROOM_RENT',
    description: '',
    amountRupees: '',
    taxRupees: '',
    vendorName: '',
    invoiceReference: '',
    paymentMode: 'BANK_TRANSFER'
  });
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    orderId: 'ord-init-1081',
    amountRupees: '',
    paymentMethod: 'RAZORPAY_UPI',
    gatewayTxnId: '',
    paymentType: 'PARTIAL_PAYMENT',
    notes: ''
  });
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [showDisbursementModal, setShowDisbursementModal] = useState(false);
  const [disbursementForm, setDisbursementForm] = useState({
    purchaseOrderId: 'po-2026-0041',
    amountRupees: '',
    disbursementMethod: 'NEFT_RTGS',
    bankReference: '',
    disbursementType: 'PROGRESS_PAYMENT',
    notes: ''
  });
  const [disbursementSubmitting, setDisbursementSubmitting] = useState(false);

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, txnRes] = await Promise.all([
        fetch('/api/finance/summary'),
        fetch('/api/finance/transactions')
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (txnRes.ok) {
        const txnData = await txnRes.json();
        setTransactions(txnData);
      }
    } catch (err) {
      console.error('Failed to load finance data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  // Submit Expense
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setExpenseSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: expenseForm.category,
          description: expenseForm.description,
          amountMinor: Math.round(parseFloat(expenseForm.amountRupees) * 100),
          taxMinor: expenseForm.taxRupees ? Math.round(parseFloat(expenseForm.taxRupees) * 100) : 0,
          vendorName: expenseForm.vendorName,
          invoiceReference: expenseForm.invoiceReference,
          paymentMode: expenseForm.paymentMode
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record expense');

      setFeedback({ type: 'success', message: `✓ Operating expense ${data.expense.expenseNumber} recorded successfully!` });
      setShowExpenseModal(false);
      setExpenseForm({
        category: 'SHOWROOM_RENT',
        description: '',
        amountRupees: '',
        taxRupees: '',
        vendorName: '',
        invoiceReference: '',
        paymentMode: 'BANK_TRANSFER'
      });
      await loadFinanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setExpenseSubmitting(false);
    }
  };

  // Submit Customer Payment
  const handleCreateCustomerPayment = async (e) => {
    e.preventDefault();
    setPaymentSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/finance/payments/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentForm.orderId,
          amountMinor: Math.round(parseFloat(paymentForm.amountRupees) * 100),
          paymentMethod: paymentForm.paymentMethod,
          gatewayTxnId: paymentForm.gatewayTxnId || `pay_manual_${Date.now()}`,
          paymentType: paymentForm.paymentType,
          notes: paymentForm.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setFeedback({
        type: 'success',
        message: `✓ Payment recorded for ${data.orderBalance.orderNumber}! Balance due: ${formatCurrency(data.orderBalance.balanceDueMinor, 'INR')}.`
      });
      setShowPaymentModal(false);
      setPaymentForm({
        orderId: 'ord-init-1081',
        amountRupees: '',
        paymentMethod: 'RAZORPAY_UPI',
        gatewayTxnId: '',
        paymentType: 'PARTIAL_PAYMENT',
        notes: ''
      });
      await loadFinanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Submit Supplier Disbursement
  const handleCreateDisbursement = async (e) => {
    e.preventDefault();
    setDisbursementSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/finance/payments/supplier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseOrderId: disbursementForm.purchaseOrderId,
          amountMinor: Math.round(parseFloat(disbursementForm.amountRupees) * 100),
          disbursementMethod: disbursementForm.disbursementMethod,
          bankReference: disbursementForm.bankReference || `NEFT_MANUAL_${Date.now()}`,
          disbursementType: disbursementForm.disbursementType,
          notes: disbursementForm.notes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record disbursement');

      setFeedback({
        type: 'success',
        message: `✓ Disbursement recorded for ${data.poBalance.poNumber}! Pending PO balance: ${formatCurrency(data.poBalance.balanceDueMinor, 'INR')}.`
      });
      setShowDisbursementModal(false);
      setDisbursementForm({
        purchaseOrderId: 'po-2026-0041',
        amountRupees: '',
        disbursementMethod: 'NEFT_RTGS',
        bankReference: '',
        disbursementType: 'PROGRESS_PAYMENT',
        notes: ''
      });
      await loadFinanceData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setDisbursementSubmitting(false);
    }
  };

  const rec = summary?.reconciliation || {};

  return (
    <div>
      {/* Top Action Bar & Statutory Standard Notice */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: 'var(--color-charcoal)' }}>
            Financial Management &amp; Commercial Reconciliations
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Strict single-currency ledger in integer paise (INR). Non-inferred payment tracking and verified batch FIFO COGS.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowPaymentModal(true)}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Record Customer Receipt
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowDisbursementModal(true)}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Disburse Supplier Dues
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowExpenseModal(true)}
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> Record Overhead Expense
          </button>
          <a
            href="/api/finance/export"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.86rem',
            backgroundColor: feedback.type === 'error' ? '#FEE2E2' : '#F0FDF4',
            color: feedback.type === 'error' ? '#991B1B' : '#166534',
            border: `1px solid ${feedback.type === 'error' ? '#FCA5A5' : '#BBF7D0'}`
          }}
        >
          {feedback.message}
        </div>
      )}

      {/* Financial Executive KPI Cards Bar */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Net Revenue */}
        <div className="stat-card">
          <span className="stat-card-label">Net Merchandise Revenue</span>
          <span className="stat-card-value" style={{ color: 'var(--color-burgundy)' }}>
            {formatCurrency(rec.netMerchandiseRevenueMinor || 0, 'INR')}
          </span>
          <span className="stat-card-subtext">
            Excludes GST ({formatCurrency(rec.gstCollectedMinor || 0, 'INR')}) &amp; Refunds ({formatCurrency(rec.customerRefundsDisbursedMinor || 0, 'INR')})
          </span>
        </div>

        {/* Allocated COGS */}
        <div className="stat-card">
          <span className="stat-card-label">Allocated COGS (FIFO)</span>
          <span className="stat-card-value" style={{ color: '#9E6714' }}>
            {formatCurrency(rec.allocatedCogsMinor || 0, 'INR')}
          </span>
          <span className="stat-card-subtext">Dispatched item unit batch acquisition costs</span>
        </div>

        {/* Gross Merchandise Profit & Margin */}
        <div className="stat-card">
          <span className="stat-card-label">Gross Merchandise Margin</span>
          <span className="stat-card-value" style={{ color: 'var(--color-status-success)' }}>
            {rec.grossMarginPercent || 0}%
          </span>
          <span className="stat-card-subtext">
            Profit: {formatCurrency(rec.grossMerchandiseProfitMinor || 0, 'INR')}
          </span>
        </div>

        {/* Operating Expenses */}
        <div className="stat-card">
          <span className="stat-card-label">Approved Overhead Expenses</span>
          <span className="stat-card-value" style={{ color: '#B91C1C' }}>
            {formatCurrency(rec.operatingExpensesTotalMinor || 0, 'INR')}
          </span>
          <span className="stat-card-subtext">Leases, Packaging, Media &amp; Vault</span>
        </div>

        {/* Net Operational Trading Surplus */}
        <div className="stat-card">
          <span className="stat-card-label">Operational Trading Surplus</span>
          <span className="stat-card-value" style={{ color: rec.netOperationalSurplusMinor >= 0 ? '#15803D' : '#B91C1C' }}>
            {formatCurrency(rec.netOperationalSurplusMinor || 0, 'INR')}
          </span>
          <span className="stat-card-subtext">Gross Margin − Approved Overheads</span>
        </div>

        {/* Receivables & Payables */}
        <div className="stat-card">
          <span className="stat-card-label">Receivables / Payables</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '4px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E40AF' }}>
              REC: {formatCurrency(rec.accountsReceivableMinor || 0, 'INR')}
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#C2410C' }}>
              PAY: {formatCurrency(rec.accountsPayableMinor || 0, 'INR')}
            </span>
          </div>
          <span className="stat-card-subtext">Pending client invoices vs Supplier PO dues</span>
        </div>
      </div>

      {/* Commercial Reconciliation Breakdown Box */}
      <div
        style={{
          backgroundColor: '#FAF7F2',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '24px',
          fontSize: '0.84rem',
          lineHeight: 1.6
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <ShieldCheck size={16} color="var(--color-burgundy)" />
          <strong style={{ color: 'var(--color-burgundy)' }}>Commercial Reconciliation Audit Standard (docs/CRM-TEAM-FINANCE.md):</strong>
        </div>
        <p style={{ margin: '0 0 6px', color: 'var(--color-text-main)' }}>
          &bull; <strong>Net Merchandise Revenue:</strong> Gross Receipts ({formatCurrency(rec.grossCustomerReceiptsMinor || 0, 'INR')}) − Tax Collected ({formatCurrency(rec.gstCollectedMinor || 0, 'INR')}) − Refunds Disbursed ({formatCurrency(rec.customerRefundsDisbursedMinor || 0, 'INR')}) = <strong>{formatCurrency(rec.netMerchandiseRevenueMinor || 0, 'INR')}</strong>.
        </p>
        <p style={{ margin: '0 0 6px', color: 'var(--color-text-main)' }}>
          &bull; <strong>Gross Merchandise Margin:</strong> Net Revenue ({formatCurrency(rec.netMerchandiseRevenueMinor || 0, 'INR')}) − Allocated COGS ({formatCurrency(rec.allocatedCogsMinor || 0, 'INR')}) = <strong>{formatCurrency(rec.grossMerchandiseProfitMinor || 0, 'INR')}</strong> ({rec.grossMarginPercent || 0}%).
        </p>
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
          <em>Statutory Disclaimer:</em> Net profit requires full corporate tax, depreciation, and audit modeling, which is not claimed by initial commercial reports.
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '20px',
          overflowX: 'auto'
        }}
      >
        {[
          { id: 'receipts', label: 'Customer Receipts & Receivables', count: transactions.customerPayments.length },
          { id: 'disbursements', label: 'Supplier Dues & Disbursements', count: transactions.supplierDisbursements.length },
          { id: 'expenses', label: 'Operating Overhead Expenses', count: transactions.operatingExpenses.length },
          { id: 'refunds', label: 'Refunds Ledger', count: transactions.refunds.length },
          { id: 'overhead_breakdown', label: 'Overhead Breakdown' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'none',
              fontSize: '0.84rem',
              fontWeight: activeSubTab === tab.id ? 700 : 500,
              color: activeSubTab === tab.id ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
              borderBottom: activeSubTab === tab.id ? '2px solid var(--color-burgundy)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  backgroundColor: activeSubTab === tab.id ? 'var(--color-burgundy-light)' : '#EDE6E8',
                  color: activeSubTab === tab.id ? 'var(--color-burgundy)' : 'var(--color-text-muted)'
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: CUSTOMER RECEIPTS */}
      {activeSubTab === 'receipts' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Incoming Customer Receipts Ledger</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Non-inferred transactions &bull; Explicit Razorpay / NEFT references
            </span>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Receipt / Txn ID</th>
                <th>Order Reference</th>
                <th>Client Name</th>
                <th>Payment Method</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Received At</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.customerPayments.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                    {p.gatewayTxnId}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{p.orderNumber}</span>
                  </td>
                  <td>
                    <div>{p.customerName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{p.customerEmail}</div>
                  </td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{p.paymentMethod}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: p.paymentType === 'FULL_PAYMENT' ? '#DCFCE7' : '#FEF3C7',
                        color: p.paymentType === 'FULL_PAYMENT' ? '#166534' : '#92400E',
                        fontWeight: 600
                      }}
                    >
                      {p.paymentType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#166534' }}>
                    +{formatCurrency(p.amountMinor, p.currency)}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(p.receivedAt)}
                  </td>
                  <td style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', maxWidth: '200px' }}>
                    {p.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 2: SUPPLIER DISBURSEMENTS */}
      {activeSubTab === 'disbursements' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Supplier Disbursements &amp; Purchase Order Dues</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Bank NEFT references &bull; Accounts Payable Settled
            </span>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Bank Reference</th>
                <th>Purchase Order</th>
                <th>Supplier Guild</th>
                <th>Disbursement Mode</th>
                <th>Type</th>
                <th>Amount Disbursed</th>
                <th>Disbursed At</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.supplierDisbursements.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                    {d.bankReference}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{d.purchaseOrderNumber}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{d.supplierName}</td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{d.disbursementMethod}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#EDE9FE',
                        color: '#5B21B6',
                        fontWeight: 600
                      }}
                    >
                      {d.disbursementType}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: '#991B1B' }}>
                    -{formatCurrency(d.amountMinor, d.currency)}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(d.disbursedAt)}
                  </td>
                  <td style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', maxWidth: '200px' }}>
                    {d.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 3: OPERATING EXPENSES */}
      {activeSubTab === 'expenses' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Approved Operating Overhead Expenses</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Total Overheads: {formatCurrency(rec.operatingExpensesTotalMinor || 0, 'INR')}
            </span>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Expense #</th>
                <th>Category</th>
                <th>Description</th>
                <th>Vendor / Payee</th>
                <th>Invoice Ref</th>
                <th>Amount (Base)</th>
                <th>Tax (GST)</th>
                <th>Status</th>
                <th>Approved By</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.operatingExpenses.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>
                    {e.expenseNumber}
                  </td>
                  <td>
                    <span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>
                      {e.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', fontSize: '0.84rem' }}>{e.description}</td>
                  <td style={{ fontWeight: 600 }}>{e.vendorName}</td>
                  <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{e.invoiceReference || '—'}</td>
                  <td style={{ fontWeight: 700, color: '#991B1B' }}>
                    -{formatCurrency(e.amountMinor, e.currency)}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {formatCurrency(e.taxMinor || 0, e.currency)}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                        fontWeight: 600
                      }}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{e.approvedBy}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{formatDate(e.expenseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 4: REFUNDS */}
      {activeSubTab === 'refunds' && (
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Customer Return Refunds Ledger</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Total Reversals: {formatCurrency(rec.customerRefundsDisbursedMinor || 0, 'INR')}
            </span>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Method</th>
                <th>Gateway Reversal ID</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Processed At</th>
              </tr>
            </thead>
            <tbody>
              {transactions.refunds.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.8rem' }}>{r.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>{r.orderNumber}</td>
                  <td>{r.customerName}</td>
                  <td><span className="badge badge-gold" style={{ fontSize: '0.7rem' }}>{r.refundMethod}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{r.gatewayRefundId}</td>
                  <td style={{ fontWeight: 700, color: '#991B1B' }}>
                    -{formatCurrency(r.amountMinor, r.currency)}
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '240px' }}>{r.reason}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{formatDate(r.processedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBTAB 5: OVERHEAD BREAKDOWN */}
      {activeSubTab === 'overhead_breakdown' && (
        <div className="table-container" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', margin: '0 0 16px' }}>Operating Overhead Breakdown by Cost Centre</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {(summary?.expensesByCategory || []).map((cat) => (
              <div
                key={cat.category}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '16px',
                  backgroundColor: '#FCFCFC'
                }}
              >
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600, marginBottom: '4px' }}>
                  {cat.label}
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {formatCurrency(cat.totalMinor, 'INR')}
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {rec.operatingExpensesTotalMinor > 0
                    ? `${((cat.totalMinor / rec.operatingExpensesTotalMinor) * 100).toFixed(1)}% of total approved overheads`
                    : '0%'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD OPERATING EXPENSE */}
      {showExpenseModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Record Operating Overhead Expense</h3>
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Expense Category *
                </label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                >
                  <option value="SHOWROOM_RENT">Flagship Showroom Leases</option>
                  <option value="LOGISTICS_PACKAGING">Secure Packaging &amp; Armoured Logistics</option>
                  <option value="MARKETING_MEDIA">Editorial Campaigns &amp; Media Production</option>
                  <option value="UTILITIES_SECURITY">Vault Security, Surveillance &amp; Utilities</option>
                  <option value="STUDIO_EQUIPMENT">Atelier Tools &amp; Gemmology Equipment</option>
                  <option value="INSURANCE_VAULT">Transit &amp; Archival Vault Specie Insurance</option>
                  <option value="LEGAL_PROFESSIONAL">Hallmarking, Legal &amp; Audit Compliance</option>
                  <option value="OFFICE_ADMIN">Atelier Administration &amp; Software</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Flagship Worli Lease"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Base Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50000"
                    value={expenseForm.amountRupees}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amountRupees: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    GST Tax (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 9000"
                    value={expenseForm.taxRupees}
                    onChange={(e) => setExpenseForm({ ...expenseForm, taxRupees: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Vendor / Payee *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sea Green Properties"
                    value={expenseForm.vendorName}
                    onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Invoice Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-99"
                    value={expenseForm.invoiceReference}
                    onChange={(e) => setExpenseForm({ ...expenseForm, invoiceReference: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={expenseSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {expenseSubmitting ? 'Recording...' : 'Save & Approve Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD CUSTOMER PAYMENT */}
      {showPaymentModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Record Customer Payment Receipt</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Target Customer Order *
                </label>
                <select
                  value={paymentForm.orderId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, orderId: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                >
                  <option value="ord-init-1081">NSK-2026-1081 (Priya Sundaram &bull; ₹2,499.00)</option>
                  <option value="ord-init-1082">NSK-2026-1082 (Aditi Sharma &bull; ₹4,998.00)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Amount Received (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 2499.00"
                    value={paymentForm.amountRupees}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amountRupees: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  >
                    <option value="RAZORPAY_UPI">Razorpay UPI</option>
                    <option value="RAZORPAY_CARD">Credit / Debit Card</option>
                    <option value="BANK_TRANSFER_NEFT">Bank Wire / NEFT</option>
                    <option value="CASH_ON_DELIVERY">Cash in Showroom</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Gateway Txn ID / Bank UTR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. pay_rzp_9382104"
                  value={paymentForm.gatewayTxnId}
                  onChange={(e) => setPaymentForm({ ...paymentForm, gatewayTxnId: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Notes / Allocation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Final balance settlement before vault dispatch"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {paymentSubmitting ? 'Recording...' : 'Record Payment Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISBURSE SUPPLIER PAYMENT */}
      {showDisbursementModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Disburse Supplier Payment</h3>
              <button
                type="button"
                onClick={() => setShowDisbursementModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDisbursement} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Target Purchase Order *
                </label>
                <select
                  value={disbursementForm.purchaseOrderId}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, purchaseOrderId: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                >
                  <option value="po-2026-0041">PO-2026-0041 &bull; Jaipur Royal Filigree Guild</option>
                  <option value="po-2026-0042">PO-2026-0042 &bull; Surat Precision Zirconia Atelier</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Amount Disbursed (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15000.00"
                    value={disbursementForm.amountRupees}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, amountRupees: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    Disbursement Mode
                  </label>
                  <select
                    value={disbursementForm.disbursementMethod}
                    onChange={(e) => setDisbursementForm({ ...disbursementForm, disbursementMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                  >
                    <option value="NEFT_RTGS">Bank NEFT / RTGS</option>
                    <option value="CHEQUE">Corporate Cheque</option>
                    <option value="CORPORATE_UPI">Corporate UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Bank Reference / UTR *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CMS_HDFC_NEFT_938102"
                  value={disbursementForm.bankReference}
                  onChange={(e) => setDisbursementForm({ ...disbursementForm, bankReference: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: '4px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setShowDisbursementModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disbursementSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {disbursementSubmitting ? 'Recording...' : 'Disburse Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
