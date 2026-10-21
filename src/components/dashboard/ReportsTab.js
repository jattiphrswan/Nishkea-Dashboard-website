'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Package,
  Layers,
  Clock,
  Download,
  AlertTriangle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { formatCurrency } from '../../lib/formatters';

export default function ReportsTab() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/reports')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setReports(data);
      })
      .catch((err) => console.error('Failed to load performance reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const st = reports?.sellThroughRate || {};
  const categories = reports?.categoryPerformance || [];
  const ageing = reports?.ageingValuation || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', margin: '0 0 4px', color: 'var(--color-charcoal)' }}>
            Inventory Velocity &amp; Business Performance Reports
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Standardized operational formulas per docs/DASHBOARD.md and docs/CRM-TEAM-FINANCE.md.
          </p>
        </div>

        <a
          href="/api/finance/export"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          <Download size={14} /> Download Ledger CSV
        </a>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '24px' }}>
        {/* Sell Through */}
        <div className="stat-card">
          <span className="stat-card-label">Period Sell-Through Rate</span>
          <span className="stat-card-value" style={{ color: 'var(--color-burgundy)' }}>
            {st.ratePercent || 0}%
          </span>
          <span className="stat-card-subtext">
            {st.unitsSold || 0} units sold of {st.unitsReceived || 0} received units
          </span>
        </div>

        {/* Sell-Through Formula Notice */}
        <div className="stat-card" style={{ gridColumn: 'span 2' }}>
          <span className="stat-card-label">Sell-Through Rate Formula Definition</span>
          <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-charcoal)', margin: '4px 0 2px' }}>
            Net Units Sold &divide; (Opening Sellable Stock + Eligible Batch Receipts in Period)
          </div>
          <span className="stat-card-subtext">
            Isolates returns and damaged transfers to maintain statistical accuracy across quarterly collection cycles.
          </span>
        </div>
      </div>

      {/* Two Column Section: Category Contribution & Stock Ageing Valuation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '24px' }}>
        {/* Category Contribution Table */}
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Category Sales &amp; Revenue Contribution</h3>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Designs</th>
                <th>Units Sold</th>
                <th>Revenue (INR)</th>
                <th>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.category}>
                  <td style={{ fontWeight: 600 }}>{c.category}</td>
                  <td>{c.designsCount}</td>
                  <td>{c.unitsSold}</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>
                    {formatCurrency(c.revenueMinor, 'INR')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          flex: 1,
                          height: '6px',
                          backgroundColor: '#EDE6E8',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${c.sharePercent}%`,
                            height: '100%',
                            backgroundColor: 'var(--color-burgundy)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, minWidth: '32px' }}>
                        {c.sharePercent}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stock Ageing Valuation Buckets */}
        <div className="table-container">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Stock Ageing Valuation &amp; Clearance Risk</h3>
          </div>

          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Ageing Bracket</th>
                <th>Physical Units</th>
                <th>FIFO Valuation</th>
                <th>Risk Profile</th>
              </tr>
            </thead>
            <tbody>
              {ageing.map((a) => (
                <tr key={a.bucket}>
                  <td style={{ fontWeight: 600 }}>{a.bucket}</td>
                  <td>{a.units} units</td>
                  <td style={{ fontWeight: 600, color: 'var(--color-burgundy)' }}>
                    {formatCurrency(a.valuationMinor, 'INR')}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        backgroundColor:
                          a.riskLevel === 'OPTIMAL' ? '#DCFCE7' :
                          a.riskLevel === 'HEALTHY' ? '#E0F2FE' :
                          a.riskLevel === 'WATCHLIST' ? '#FEF3C7' : '#FEE2E2',
                        color:
                          a.riskLevel === 'OPTIMAL' ? '#166534' :
                          a.riskLevel === 'HEALTHY' ? '#0369A1' :
                          a.riskLevel === 'WATCHLIST' ? '#92400E' : '#991B1B'
                      }}
                    >
                      {a.riskLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
