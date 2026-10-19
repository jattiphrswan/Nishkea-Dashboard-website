'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Store,
  Menu,
  X,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="dashboard-layout">
      {/* Desktop Sidebar */}
      <aside className="dashboard-sidebar" aria-label="Staff Navigation">
        <div className="dashboard-sidebar-header">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: '#FAF7F2', letterSpacing: '0.12em', fontWeight: 600 }}>
              NISHKÈA
            </span>
            <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-burgundy)', color: '#FFFFFF', padding: '2px 6px', borderRadius: '2px', fontWeight: 700 }}>
              STAFF
            </span>
          </Link>
          <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#B69763' }}>
            <ShieldAlert size={13} />
            <span>Node 2 Scaffold • Demo Backoffice</span>
          </div>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          <Link href="/dashboard" className="dashboard-nav-item active">
            <LayoutDashboard size={18} />
            <span>Dashboard Workspace</span>
          </Link>

          <div style={{ padding: '16px 12px 6px', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7E6E77', fontWeight: 700 }}>
            Operational Modules
          </div>

          <Link href="/dashboard?tab=products" className="dashboard-nav-item">
            <Gem size={17} />
            <span>Products &amp; Variants</span>
          </Link>

          <Link href="/dashboard?tab=reviews" className="dashboard-nav-item">
            <CalendarCheck size={17} />
            <span>30-Day Collection Reviews</span>
          </Link>

          <Link href="/dashboard?tab=inventory" className="dashboard-nav-item">
            <Package size={17} />
            <span>Inventory &amp; Ageing</span>
          </Link>

          <Link href="/dashboard?tab=orders" className="dashboard-nav-item">
            <ShoppingCart size={17} />
            <span>Orders &amp; Dispatch</span>
          </Link>

          <Link href="/dashboard?tab=suppliers" className="dashboard-nav-item">
            <Truck size={17} />
            <span>Suppliers &amp; Purchases</span>
          </Link>

          <Link href="/dashboard?tab=crm" className="dashboard-nav-item">
            <Users size={17} />
            <span>Customers &amp; CRM</span>
          </Link>

          <Link href="/dashboard?tab=tasks" className="dashboard-nav-item">
            <CheckSquare size={17} />
            <span>Team &amp; Tasks</span>
          </Link>

          <Link href="/dashboard?tab=finance" className="dashboard-nav-item">
            <CreditCard size={17} />
            <span>Finance &amp; Expenses</span>
          </Link>

          <Link href="/dashboard?tab=reports" className="dashboard-nav-item">
            <BarChart3 size={17} />
            <span>Reports &amp; Metrics</span>
          </Link>

          <Link href="/dashboard?tab=settings" className="dashboard-nav-item">
            <Settings size={17} />
            <span>Company Settings</span>
          </Link>
        </div>

        {/* User Card & Storefront link */}
        <div style={{ padding: '16px', borderTop: '1px solid #382B32', backgroundColor: '#1A1317' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-burgundy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
              <UserCheck size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FAF7F2' }}>Demo Manager</div>
              <div style={{ fontSize: '0.7rem', color: '#887B82' }}>Provisional Role: Owner</div>
            </div>
          </div>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.76rem',
              color: 'var(--color-gold)',
              fontWeight: 600
            }}
          >
            <Store size={14} /> Exit to Public Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setMobileSidebarOpen(true)}
              style={{ display: 'flex' }}
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
              NISHKÈA Operations Centre
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="badge badge-demo">
              Demo Environment (Node 2)
            </span>
            <Link
              href="/"
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Store size={14} /> Storefront
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 'var(--space-6)' }}>{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="drawer-overlay"
          onClick={() => setMobileSidebarOpen(false)}
          role="presentation"
        >
          <div
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Staff Navigation Menu"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#241B20', color: '#FAF7F2', left: 0, right: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #382B32', paddingBottom: '12px' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#FAF7F2', fontWeight: 600 }}>
                NISHKÈA DASHBOARD
              </span>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setMobileSidebarOpen(false)}
                style={{ color: '#FAF7F2' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Link href="/dashboard" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <LayoutDashboard size={16} /> Overview
              </Link>
              <Link href="/dashboard?tab=products" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <Gem size={16} /> Products &amp; Variants
              </Link>
              <Link href="/dashboard?tab=reviews" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <CalendarCheck size={16} /> 30-Day Reviews
              </Link>
              <Link href="/dashboard?tab=inventory" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <Package size={16} /> Inventory &amp; Ageing
              </Link>
              <Link href="/dashboard?tab=orders" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <ShoppingCart size={16} /> Orders
              </Link>
              <Link href="/dashboard?tab=suppliers" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <Truck size={16} /> Suppliers &amp; Purchases
              </Link>
              <Link href="/dashboard?tab=crm" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <Users size={16} /> CRM &amp; Leads
              </Link>
              <Link href="/dashboard?tab=tasks" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <CheckSquare size={16} /> Team &amp; Tasks
              </Link>
              <Link href="/dashboard?tab=finance" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <CreditCard size={16} /> Finance
              </Link>
              <Link href="/dashboard?tab=reports" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <BarChart3 size={16} /> Reports
              </Link>
              <Link href="/dashboard?tab=settings" onClick={() => setMobileSidebarOpen(false)} className="dashboard-nav-item">
                <Settings size={16} /> Settings
              </Link>

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #382B32' }}>
                <Link href="/" onClick={() => setMobileSidebarOpen(false)} className="btn btn-secondary" style={{ width: '100%', color: '#FAF7F2', borderColor: '#FAF7F2' }}>
                  Public Storefront
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
