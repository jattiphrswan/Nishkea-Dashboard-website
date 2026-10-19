'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  PRODUCTS,
  DASHBOARD_METRICS,
  STOCK_AGEING_SUMMARY,
  MONTHLY_REVIEW_QUEUE,
  DEMO_ORDERS,
  DEMO_TASKS
} from '../../data/fixtures';
import { formatCurrency, formatDate, computeAvailableStock } from '../../lib/formatters';
import {
  LayoutDashboard,
  Gem,
  CalendarCheck,
  Package,
  ShoppingCart,
  Truck,
  Users,
  CheckSquare,
  CreditCard,
  BarChart3,
  Settings,
  AlertCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Lock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [actionNotice, setActionNotice] = useState(null);

  const showPlannedNotice = (actionName, nodeNumber) => {
    setActionNotice({
      title: `${actionName} (Planned)`,
      message: `This mutation will be wired to backend persistence in Node ${nodeNumber}. It is safely disabled in this Node 2 foundation.`
    });
  };

  return (
    <div>
      {/* Top Title & Environment Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 600, margin: 0 }}>Company Operations Workspace</h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
            NISHKÈA internal inventory, 30-day collection lifecycle, orders, and daily task management.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-demo">Demo Dataset Active</span>
          <span className="badge badge-burgundy">Provisional Currency: INR (₹)</span>
        </div>
      </div>

      {/* Prominent Architectural Disclaimer Banner */}
      <div
        role="alert"
        style={{
          backgroundColor: '#FEF7EC',
          border: '1px solid #F5DEB3',
          borderRadius: 'var(--radius-xs)',
          padding: '12px 18px',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.82rem',
          color: '#8C5311'
        }}
      >
        <ShieldAlert size={20} style={{ flexShrink: 0 }} />
        <div>
          <strong>Node 2 Foundation Mode:</strong> All metrics, inventory records, and financial balances displayed below are fictional fixtures for UI preview and data-flow validation. No live database or banking rails are connected.
        </div>
      </div>

      {/* Action Notification Modal / Banner */}
      {actionNotice && (
        <div
          role="status"
          style={{
            backgroundColor: '#EDF3F8',
            border: '1px solid #C4D7E8',
            borderRadius: 'var(--radius-xs)',
            padding: '12px 16px',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            color: '#1C4468'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            <div>
              <strong>{actionNotice.title}:</strong> {actionNotice.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="btn btn-sm btn-outline"
            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Workspace Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-6)',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'products', label: 'Products & Variants', icon: Gem },
          { id: 'reviews', label: '30-Day Reviews', icon: CalendarCheck },
          { id: 'inventory', label: 'Inventory & Ageing', icon: Package },
          { id: 'orders', label: 'Orders', icon: ShoppingCart },
          { id: 'suppliers', label: 'Suppliers & POs', icon: Truck },
          { id: 'crm', label: 'Customers & CRM', icon: Users },
          { id: 'tasks', label: 'Team Tasks', icon: CheckSquare },
          { id: 'finance', label: 'Finance', icon: CreditCard },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                fontSize: '0.84rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
                borderBottom: isActive ? '2px solid var(--color-burgundy)' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div>
          {/* Key Metric Cards */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <span className="stat-card-label">Net Sales (Last 30 Days)</span>
              <span className="stat-card-value">
                {formatCurrency(DASHBOARD_METRICS.netSalesMinor, 'INR')}
              </span>
              <span className="stat-card-subtext">{DASHBOARD_METRICS.totalOrders} total completed orders</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Available Physical Stock</span>
              <span className="stat-card-value">{DASHBOARD_METRICS.availableUnitsTotal} units</span>
              <span className="stat-card-subtext">Across 8 fixture designs</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Unsold Stock Cost (FIFO)</span>
              <span className="stat-card-value" style={{ color: 'var(--color-burgundy)' }}>
                {formatCurrency(DASHBOARD_METRICS.unsoldStockCostMinor, 'INR')}
              </span>
              <span className="stat-card-subtext">Evaluated at batch receipt unit cost</span>
            </div>

            <div className="stat-card">
              <span className="stat-card-label">Action Items Required</span>
              <span className="stat-card-value" style={{ color: 'var(--color-status-warning)' }}>
                {DASHBOARD_METRICS.monthlyReviewsDue + DASHBOARD_METRICS.pendingDispatches}
              </span>
              <span className="stat-card-subtext">
                {DASHBOARD_METRICS.monthlyReviewsDue} reviews due • {DASHBOARD_METRICS.pendingDispatches} dispatches pending
              </span>
            </div>
          </div>

          {/* Two-Column Overview Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Ageing Summary Table */}
            <div className="table-container" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Stock Ageing Breakdown</h3>
                <span className="badge badge-gold">FIFO Method</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Formula: Batch Age = Report Date − Received Date. Oldest units allocated first.
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Age Bracket</th>
                    <th>Remaining Units</th>
                    <th>Unsold Cost</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {STOCK_AGEING_SUMMARY.map((row) => (
                    <tr key={row.bucket}>
                      <td><strong>{row.bucket}</strong></td>
                      <td>{row.units} units</td>
                      <td>{formatCurrency(row.costMinor, 'INR')}</td>
                      <td>
                        <span style={{ fontSize: '0.78rem', color: row.percentage > 30 ? 'var(--color-status-warning)' : 'inherit' }}>
                          {row.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Daily Operational Tasks */}
            <div className="table-container" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Priority Team Tasks</h3>
                <button
                  type="button"
                  onClick={() => showPlannedNotice('Task Creation', 10)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.74rem' }}
                >
                  + New Task (Planned)
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {DEMO_TASKS.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-xs)',
                      padding: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#FAF8F6'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Assigned to: <strong>{task.assignedTo}</strong> • Due: {task.dueDate} • Ref: {task.linkedRecord}
                      </div>
                    </div>
                    <span className={`badge ${task.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS & VARIANTS */}
      {activeTab === 'products' && (
        <div className="table-container">
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Design &amp; Variant Catalogue</h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Normalized options, SKUs, sales units and lifecycle status.
              </span>
            </div>
            <button
              type="button"
              onClick={() => showPlannedNotice('Create Design Draft', 4)}
              className="btn btn-primary btn-sm"
            >
              + Create Design (Planned)
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Design / Code</th>
                <th>Category</th>
                <th>Collection Type</th>
                <th>Variant SKUs</th>
                <th>Sales Unit</th>
                <th>Price</th>
                <th>30-Day Review Date</th>
                <th>Lifecycle</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{p.code}</div>
                  </td>
                  <td>{p.categoryName}</td>
                  <td>
                    <span className="badge badge-gold">{p.collectionType}</span>
                  </td>
                  <td>
                    {p.variants.map((v) => (
                      <div key={v.sku} style={{ fontSize: '0.74rem' }}>
                        <code>{v.sku}</code> ({v.colour})
                      </div>
                    ))}
                  </td>
                  <td>{p.salesUnit}</td>
                  <td>{formatCurrency(p.priceMinor, p.currency)}</td>
                  <td>{p.reviewDate || '—'}</td>
                  <td>
                    <span className={`badge ${p.lifecycle === 'active' ? 'badge-success' : p.lifecycle === 'clearance' ? 'badge-danger' : 'badge-warning'}`}>
                      {p.lifecycle}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: 30-DAY REVIEWS */}
      {activeTab === 'reviews' && (
        <div className="table-container">
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>30-Day Collection Decision Queue</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
              Trend designs are reviewed at 30 days from launch. An under-review item never auto-discounts or deletes stock; a permitted reviewer records the decision.
            </p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Design</th>
                <th>Launch Date</th>
                <th>Review Due</th>
                <th>Age</th>
                <th>Initial Received</th>
                <th>Units Sold</th>
                <th>Sell-Through</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_REVIEW_QUEUE.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{item.designCode}</div>
                  </td>
                  <td>{item.launchDate}</td>
                  <td>{item.reviewDueDate}</td>
                  <td>{item.daysSinceLaunch} days</td>
                  <td>{item.initialReceiptUnits} units</td>
                  <td>{item.netUnitsSold} units</td>
                  <td>
                    <strong>{item.sellThroughRate}</strong>
                  </td>
                  <td>
                    <span className={`badge ${item.status === 'under_review' ? 'badge-warning' : item.status === 'clearance' ? 'badge-danger' : 'badge-gold'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => showPlannedNotice(`Record Decision for ${item.designCode}`, 6)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    >
                      Record Decision (Planned)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="table-container">
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Transactional Inventory Ledger Simulation</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                Formula: Available = Sellable On-Hand − Active Reservations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showPlannedNotice('Receive Stock Batch', 5)}
              className="btn btn-outline btn-sm"
            >
              + Receive Stock (Planned)
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>SKU / Variant</th>
                <th>Design Name</th>
                <th>Physical On-Hand</th>
                <th>Active Reservations</th>
                <th>Available for Sale</th>
                <th>Oldest Batch Age</th>
                <th>Unit Cost (Restricted)</th>
                <th>Reorder Policy</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.flatMap((p) =>
                p.variants.map((v) => {
                  const avail = computeAvailableStock(v.sellable, v.reserved);
                  const oldestBatch = p.stockBatches && p.stockBatches[0];
                  return (
                    <tr key={v.sku}>
                      <td>
                        <code>{v.sku}</code>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{v.colour} {v.size ? `• ${v.size}` : ''}</div>
                      </td>
                      <td>{p.name}</td>
                      <td>{v.sellable}</td>
                      <td>{v.reserved}</td>
                      <td>
                        <strong style={{ color: avail > 0 ? 'var(--color-status-success)' : 'var(--color-status-danger)' }}>
                          {avail}
                        </strong>
                      </td>
                      <td>{oldestBatch ? `${oldestBatch.ageDays} days (${oldestBatch.ageBucket})` : '—'}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                          {formatCurrency(v.unitCostMinor, 'INR')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.reorderPolicy === 'blocked_clearance' ? 'badge-danger' : 'badge-gold'}`}>
                          {p.reorderPolicy}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 5: ORDERS */}
      {activeTab === 'orders' && (
        <div className="table-container">
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Orders &amp; Dispatch Queue</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
              Order line price snapshots, fulfillment states, and return history.
            </p>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items Summary</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Fulfillment State</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_ORDERS.map((ord) => (
                <tr key={ord.id}>
                  <td>
                    <strong>{ord.orderNumber}</strong>
                  </td>
                  <td>
                    {ord.customerName}
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{ord.customerEmail}</div>
                  </td>
                  <td>{ord.itemsSummary}</td>
                  <td>{formatCurrency(ord.totalMinor, ord.currency)}</td>
                  <td>
                    <span className={`badge ${ord.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                      {ord.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-gold">{ord.fulfillmentStatus}</span>
                  </td>
                  <td>{formatDate(ord.date)}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => showPlannedNotice(`Dispatch ${ord.orderNumber}`, 8)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    >
                      Inspect / Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="table-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <Truck size={36} color="var(--color-burgundy)" style={{ margin: '0 auto 12px' }} />
          <h3>Suppliers &amp; Purchase Orders</h3>
          <p style={{ maxWidth: '540px', margin: '8px auto 20px', fontSize: '0.88rem' }}>
            Supplier directory, minimum order quantities, lead times, purchase order approvals, and partial receipt ledgers are planned for <strong>Node 9</strong>.
          </p>
          <span className="badge badge-demo">Planned — Node 9</span>
        </div>
      )}

      {/* TAB 7: CRM */}
      {activeTab === 'crm' && (
        <div className="table-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <Users size={36} color="var(--color-burgundy)" style={{ margin: '0 auto 12px' }} />
          <h3>Customers &amp; Client Relationship Management</h3>
          <p style={{ maxWidth: '540px', margin: '8px auto 20px', fontSize: '0.88rem' }}>
            Customer profiles, wholesale/retail segments, lead pipelines (Enquiry → Qualified → Quotation → Won/Lost), and interaction notes are planned for <strong>Node 10</strong>.
          </p>
          <span className="badge badge-demo">Planned — Node 10</span>
        </div>
      )}

      {/* TAB 8: TASKS */}
      {activeTab === 'tasks' && (
        <div className="table-container" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Team Task Board</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {DEMO_TASKS.map((t) => (
              <div key={t.id} style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px', backgroundColor: '#FAF7F2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{t.title}</strong>
                  <span className={`badge ${t.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>{t.priority}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                  Assignee: {t.assignedTo} | Due: {t.dueDate} | Linked Record: {t.linkedRecord}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: FINANCE */}
      {activeTab === 'finance' && (
        <div className="table-container" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Commercial &amp; Financial Reconciliations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
            Per AGENTS.md: Integer minor currency units (`price_minor`), explicit currency (INR), and single source of truth.
          </p>
          <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px', fontSize: '0.82rem' }}>
            <strong>Gross Margin Formula Definition:</strong> Net Merchandise Revenue (excluding collected taxes) − Allocated Cost of Goods Sold. Shipping, payment fees, and overheads reported separately.
          </div>
        </div>
      )}

      {/* TAB 10: REPORTS */}
      {activeTab === 'reports' && (
        <div className="table-container" style={{ padding: 'var(--space-8)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '12px' }}>Inventory &amp; Sales Performance Metrics</h3>
          <div style={{ backgroundColor: '#FAF7F2', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '16px' }}>
            <strong>Period Sell-Through Rate Formula:</strong> Net Units Sold / (Opening Sellable Stock + Eligible Receipts in Period). Returns and damaged transfers isolated.
          </div>
        </div>
      )}

      {/* TAB 11: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="table-container" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '16px' }}>Company Configuration Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Provisional Timezone:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>Asia/Kolkata (IST)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Base Currency:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>INR (₹) — Minor units (paise)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Checkout Reservation TTL:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>15 minutes (Atomic lock duration)</div>
            </div>
            <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '4px' }}>
              <strong>Trend Design Review Cycle:</strong>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>30 calendar days from launch</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading dashboard workspace...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
