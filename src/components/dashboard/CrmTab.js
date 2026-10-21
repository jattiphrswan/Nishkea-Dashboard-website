'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  X,
  Building,
  Mail,
  Phone,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/formatters';

const STAGES = ['ALL', 'ENQUIRY', 'QUALIFIED', 'QUOTATION', 'WON', 'LOST'];
const SOURCES = ['WEBSITE', 'CONCIERGE_AI', 'INSTAGRAM', 'WALK_IN', 'WHATSAPP_ENQUIRY'];

export default function CrmTab() {
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' | 'customers'
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [customerModal, setCustomerModal] = useState(false);
  const [leadModal, setLeadModal] = useState(false);
  const [stageModalLead, setStageModalLead] = useState(null);

  // Forms
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    segment: 'RETAIL',
    companyName: '',
    gstNumber: '',
    marketingConsent: false,
    notes: ''
  });

  const [leadForm, setLeadForm] = useState({
    title: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    segment: 'RETAIL',
    leadSource: 'WEBSITE',
    estimatedValue: 50000,
    nextFollowUpDate: '',
    notes: ''
  });

  const [stageForm, setStageForm] = useState({
    stage: 'QUALIFIED',
    lostReason: '',
    note: '',
    nextFollowUpDate: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchCrmData = async () => {
    setLoading(true);
    try {
      const [custRes, leadRes] = await Promise.all([
        fetch('/api/crm/customers'),
        fetch('/api/crm/leads')
      ]);
      const custData = await custRes.json();
      const leadData = await leadRes.json();

      if (custData.success) setCustomers(custData.customers);
      if (leadData.success) {
        setLeads(leadData.leads);
        setMetrics(leadData.metrics);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, []);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer');

      setFeedback({ type: 'success', message: `Customer '${data.customer.name}' registered successfully.` });
      setCustomerModal(false);
      setCustomerForm({
        name: '', email: '', phone: '', segment: 'RETAIL',
        companyName: '', gstNumber: '', marketingConsent: false, notes: ''
      });
      fetchCrmData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/crm/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...leadForm,
          estimatedValueMinor: Math.round(Number(leadForm.estimatedValue) * 100)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lead');

      setFeedback({ type: 'success', message: `Lead '${data.lead.title}' added to pipeline.` });
      setLeadModal(false);
      setLeadForm({
        title: '', customerName: '', customerEmail: '', customerPhone: '',
        segment: 'RETAIL', leadSource: 'WEBSITE', estimatedValue: 50000,
        nextFollowUpDate: '', notes: ''
      });
      fetchCrmData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStage = async (e) => {
    e.preventDefault();
    if (!stageModalLead) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/crm/leads/${stageModalLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update stage');

      setFeedback({ type: 'success', message: `Lead updated to '${data.lead.stage}'.` });
      setStageModalLead(null);
      fetchCrmData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (segmentFilter !== 'ALL' && l.segment !== segmentFilter) return false;
    if (stageFilter !== 'ALL' && l.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.customerName.toLowerCase().includes(q) ||
        l.customerEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    if (segmentFilter !== 'ALL' && c.segment !== segmentFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.companyName && c.companyName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Feedback Alert */}
      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '4px',
            backgroundColor: feedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
            color: feedback.type === 'error' ? '#991B1B' : '#166534',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.88rem'
          }}
        >
          <span>{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Active Pipeline Value
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-burgundy)', marginTop: '4px' }}>
            {metrics ? formatCurrency(metrics.pipelineValueMinor) : '₹0'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Across {leads.filter((l) => !['WON', 'LOST'].includes(l.stage)).length} active enquiries &amp; quotes
          </div>
        </div>

        <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Client Accounts
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--color-charcoal)', marginTop: '4px' }}>
            {customers.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {customers.filter((c) => c.segment === 'RETAIL').length} Retail &bull; {customers.filter((c) => c.segment === 'WHOLESALE').length} Wholesale
          </div>
        </div>

        <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Scheduled Follow-ups
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: metrics?.overdueFollowUps ? '#DC2626' : '#166534', marginTop: '4px' }}>
            {metrics ? metrics.upcomingFollowUps : 0} Upcoming
          </div>
          <div style={{ fontSize: '0.75rem', color: metrics?.overdueFollowUps ? '#DC2626' : 'var(--color-text-muted)', marginTop: '4px' }}>
            {metrics?.overdueFollowUps || 0} overdue actions require attention
          </div>
        </div>

        <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Won Conversions
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 600, color: '#166534', marginTop: '4px' }}>
            {leads.filter((l) => l.stage === 'WON').length} Won
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            {leads.filter((l) => l.stage === 'LOST').length} lost (with documented reasons)
          </div>
        </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${viewMode === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('pipeline')}
            style={{ fontSize: '0.84rem', padding: '8px 14px' }}
          >
            <TrendingUp size={15} style={{ marginRight: '6px' }} />
            Sales Pipeline ({leads.length})
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('customers')}
            style={{ fontSize: '0.84rem', padding: '8px 14px' }}
          >
            <Users size={15} style={{ marginRight: '6px' }} />
            Client Directory ({customers.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '6px 10px 6px 30px',
                fontSize: '0.82rem',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                width: '220px'
              }}
            />
          </div>

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.82rem', border: '1px solid var(--color-border)', borderRadius: '4px' }}
          >
            <option value="ALL">All Segments</option>
            <option value="RETAIL">Retail Clients</option>
            <option value="WHOLESALE">Wholesale Accounts</option>
          </select>

          {viewMode === 'pipeline' ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setLeadModal(true)}
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              <Plus size={15} style={{ marginRight: '4px' }} /> New Lead
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCustomerModal(true)}
              style={{ fontSize: '0.82rem', padding: '6px 12px' }}
            >
              <Plus size={15} style={{ marginRight: '4px' }} /> Register Customer
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: SALES PIPELINE */}
      {viewMode === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stage filter pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {STAGES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStageFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: stageFilter === st ? 'var(--color-burgundy)' : 'var(--color-border)',
                  backgroundColor: stageFilter === st ? 'var(--color-burgundy)' : '#FAF7F2',
                  color: stageFilter === st ? '#FFFFFF' : 'var(--color-charcoal)',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                {st} {st !== 'ALL' && metrics?.byStage ? `(${metrics.byStage[st] || 0})` : ''}
              </button>
            ))}
          </div>

          {/* Leads Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              Loading CRM sales pipeline...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', border: '1px dashed var(--color-border)', borderRadius: '4px' }}>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No leads match the selected filter criteria.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredLeads.map((lead) => {
                const isOverdue = lead.nextFollowUpDate && lead.nextFollowUpDate < todayStr && !['WON', 'LOST'].includes(lead.stage);
                return (
                  <div
                    key={lead.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      padding: '16px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <span
                          className={`badge ${
                            lead.stage === 'WON'
                              ? 'badge-success'
                              : lead.stage === 'LOST'
                              ? 'badge-danger'
                              : lead.stage === 'QUOTATION'
                              ? 'badge-warning'
                              : 'badge-demo'
                          }`}
                        >
                          {lead.stage}
                        </span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '3px',
                            backgroundColor: lead.segment === 'WHOLESALE' ? '#E0E7FF' : '#FEF3C7',
                            color: lead.segment === 'WHOLESALE' ? '#3730A3' : '#92400E'
                          }}
                        >
                          {lead.segment}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '0.96rem', margin: '8px 0 4px', fontWeight: 600, color: 'var(--color-burgundy)' }}>
                        {lead.title}
                      </h4>

                      <div style={{ fontSize: '0.82rem', color: 'var(--color-charcoal)', fontWeight: 500 }}>
                        {lead.customerName}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                        {lead.customerEmail} {lead.customerPhone ? `• ${lead.customerPhone}` : ''}
                      </div>

                      <div style={{ marginTop: '10px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Value:</span>
                        <strong style={{ color: 'var(--color-burgundy)' }}>
                          {formatCurrency(lead.estimatedValueMinor)}
                        </strong>
                      </div>

                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        Owner: <strong>{lead.ownerName || 'Unassigned'}</strong> &bull; Source: {lead.leadSource}
                      </div>

                      {lead.nextFollowUpDate && !['WON', 'LOST'].includes(lead.stage) && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 8px',
                            borderRadius: '3px',
                            backgroundColor: isOverdue ? '#FEE2E2' : '#F3F4F6',
                            color: isOverdue ? '#991B1B' : 'var(--color-text-muted)',
                            fontSize: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isOverdue && <AlertTriangle size={13} />}
                          <Clock size={13} />
                          <span>Follow-up: <strong>{lead.nextFollowUpDate}</strong> {isOverdue ? '(OVERDUE)' : ''}</span>
                        </div>
                      )}

                      {lead.lostReason && (
                        <div style={{ marginTop: '8px', fontSize: '0.76rem', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '6px', borderRadius: '3px' }}>
                          <strong>Lost Reason:</strong> {lead.lostReason}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setStageModalLead(lead);
                        setStageForm({
                          stage: lead.stage,
                          lostReason: lead.lostReason || '',
                          note: '',
                          nextFollowUpDate: lead.nextFollowUpDate || ''
                        });
                      }}
                      style={{ fontSize: '0.78rem', padding: '6px 10px', width: '100%', marginTop: '6px' }}
                    >
                      Update Pipeline Stage <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CLIENT DIRECTORY */}
      {viewMode === 'customers' && (
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#FAF7F2', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '12px 16px' }}>Client &amp; Organization</th>
                <th style={{ padding: '12px 16px' }}>Segment</th>
                <th style={{ padding: '12px 16px' }}>Contact Info</th>
                <th style={{ padding: '12px 16px' }}>Marketing Consent</th>
                <th style={{ padding: '12px 16px' }}>Orders &amp; Spend</th>
                <th style={{ padding: '12px 16px' }}>Artisanal Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No customer accounts found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <strong>{cust.name}</strong>
                      {cust.companyName && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Building size={12} /> {cust.companyName}
                        </div>
                      )}
                      {cust.gstNumber && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                          GST: <code>{cust.gstNumber}</code>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          backgroundColor: cust.segment === 'WHOLESALE' ? '#E0E7FF' : '#FEF3C7',
                          color: cust.segment === 'WHOLESALE' ? '#3730A3' : '#92400E'
                        }}
                      >
                        {cust.segment}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>{cust.email}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{cust.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {cust.marketingConsent ? (
                        <span style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem' }}>
                          <ShieldCheck size={14} /> Consented
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                          Not Granted
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div><strong>{cust.totalOrders}</strong> orders</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--color-burgundy)' }}>
                        {formatCurrency(cust.totalSpendMinor)}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', maxWidth: '280px', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
                      {cust.notes || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: REGISTER CUSTOMER */}
      {customerModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(26, 10, 14, 0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>Register Client Account</h3>
              <button onClick={() => setCustomerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Client Segment *</label>
                <select
                  value={customerForm.segment}
                  onChange={(e) => setCustomerForm({ ...customerForm, segment: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                >
                  <option value="RETAIL">Retail Atelier Client</option>
                  <option value="WHOLESALE">Wholesale Boutique Partner</option>
                </select>
              </div>

              {customerForm.segment === 'WHOLESALE' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#FAF7F2', padding: '12px', borderRadius: '4px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Company Name *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.companyName}
                      onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>GST Number</label>
                    <input
                      type="text"
                      value={customerForm.gstNumber}
                      onChange={(e) => setCustomerForm({ ...customerForm, gstNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Client Preferences &amp; Notes</label>
                <textarea
                  rows={2}
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="mkt-consent"
                  checked={customerForm.marketingConsent}
                  onChange={(e) => setCustomerForm({ ...customerForm, marketingConsent: e.target.checked })}
                />
                <label htmlFor="mkt-consent" style={{ fontSize: '0.8rem', color: 'var(--color-charcoal)' }}>
                  Customer has provided explicit marketing communication consent (stored separately)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setCustomerModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LEAD */}
      {leadModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(26, 10, 14, 0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>Create Pipeline Lead</h3>
              <button onClick={() => setLeadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Lead Title / Requirement *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridal Chandelier Trousseau Set"
                  value={leadForm.title}
                  onChange={(e) => setLeadForm({ ...leadForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Client Name *</label>
                  <input
                    type="text"
                    required
                    value={leadForm.customerName}
                    onChange={(e) => setLeadForm({ ...leadForm, customerName: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Email *</label>
                  <input
                    type="email"
                    required
                    value={leadForm.customerEmail}
                    onChange={(e) => setLeadForm({ ...leadForm, customerEmail: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Segment</label>
                  <select
                    value={leadForm.segment}
                    onChange={(e) => setLeadForm({ ...leadForm, segment: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Lead Source</label>
                  <select
                    value={leadForm.leadSource}
                    onChange={(e) => setLeadForm({ ...leadForm, leadSource: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Estimated Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={leadForm.estimatedValue}
                    onChange={(e) => setLeadForm({ ...leadForm, estimatedValue: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Next Follow-up Date</label>
                  <input
                    type="date"
                    value={leadForm.nextFollowUpDate}
                    onChange={(e) => setLeadForm({ ...leadForm, nextFollowUpDate: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setLeadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Lead to Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: UPDATE STAGE & LOST REASON INVARIANT */}
      {stageModalLead && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(26, 10, 14, 0.65)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px'
          }}
        >
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '4px', maxWidth: '480px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--color-burgundy)' }}>Update Pipeline Stage</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  {stageModalLead.title} ({stageModalLead.customerName})
                </p>
              </div>
              <button onClick={() => setStageModalLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStage} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Target Stage *</label>
                <select
                  value={stageForm.stage}
                  onChange={(e) => setStageForm({ ...stageForm, stage: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                >
                  <option value="ENQUIRY">ENQUIRY — Initial intake</option>
                  <option value="QUALIFIED">QUALIFIED — Budget &amp; style aligned</option>
                  <option value="QUOTATION">QUOTATION — Commercial proposal sent</option>
                  <option value="WON">WON — Converted to confirmed order</option>
                  <option value="LOST">LOST — Client declined or cancelled</option>
                </select>
              </div>

              {stageForm.stage === 'LOST' && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px', borderRadius: '4px' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#991B1B', marginBottom: '4px' }}>
                    Lost Reason (Mandatory) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific reason (e.g. competitor price, delivery lead time, budget limitation)..."
                    value={stageForm.lostReason}
                    onChange={(e) => setStageForm({ ...stageForm, lostReason: e.target.value })}
                    style={{ width: '100%', padding: '8px', border: '1px solid #F87171', borderRadius: '4px', fontSize: '0.82rem' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Next Follow-up Date</label>
                <input
                  type="date"
                  value={stageForm.nextFollowUpDate}
                  onChange={(e) => setStageForm({ ...stageForm, nextFollowUpDate: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '4px' }}>Stage Transition Note</label>
                <input
                  type="text"
                  placeholder="e.g. Bride confirmed showroom trial slot"
                  value={stageForm.note}
                  onChange={(e) => setStageForm({ ...stageForm, note: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setStageModalLead(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Confirm Stage Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
