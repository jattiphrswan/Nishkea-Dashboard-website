'use client';

import React from 'react';
import Header from '../../components/storefront/Header';
import Footer from '../../components/storefront/Footer';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, X } from 'lucide-react';

export default function StorefrontLayout({ children }) {
  const { notification, dismissNotification } = useStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      {/* Toast Notification Container */}
      {notification && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '90px',
            right: '24px',
            zIndex: 180,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            animation: 'fadeIn 200ms ease'
          }}
        >
          <CheckCircle2 size={18} color="var(--color-status-success)" />
          <span style={{ fontSize: '0.84rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
            {notification}
          </span>
          <button
            type="button"
            onClick={dismissNotification}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '2px',
              display: 'flex'
            }}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>{children}</main>
      <Footer />
    </div>
  );
}
