'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, UserCheck, ShieldAlert, Store, ArrowRight, Loader2 } from 'lucide-react';

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('owner@nishkea.internal');
  const [password, setPassword] = useState('NishkeaDemoPassword2026!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const demoAccounts = [
    { label: 'Company Owner', email: 'owner@nishkea.internal', role: 'Full operational & finance grants' },
    { label: 'Operations Manager', email: 'manager@nishkea.internal', role: 'Reviews, dispatches, adjustments' },
    { label: 'Inventory Staff', email: 'inventory@nishkea.internal', role: 'Stock counts only (Cost Denied)' },
    { label: 'Sales & Support', email: 'sales@nishkea.internal', role: 'Orders only (Cost & Adjustments Denied)' }
  ];

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoAccount = (accEmail) => {
    setEmail(accEmail);
    setPassword('NishkeaDemoPassword2026!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#241B20',
        color: '#FAF7F2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          color: '#241B20',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          border: '1px solid var(--color-border)'
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'var(--color-burgundy)',
            color: '#FFFFFF',
            padding: '24px',
            textAlign: 'center'
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', letterSpacing: '0.1em', margin: 0 }}>
            NISHKÈA
          </h2>
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>
            Operations &amp; Staff Access
          </span>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Node 3 Security Banner */}
          <div
            style={{
              backgroundColor: '#FEF7EC',
              border: '1px solid #F5DEB3',
              borderRadius: '2px',
              padding: '10px 14px',
              fontSize: '0.76rem',
              color: '#8C5311',
              marginBottom: '20px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Node 3 RBAC Verification:</strong> Server-side authorization enforced. Sessions set via HTTP-only cookies.
            </span>
          </div>

          {errorMessage && (
            <div
              style={{
                backgroundColor: 'var(--color-status-danger-bg)',
                border: '1px solid var(--color-status-danger)',
                color: 'var(--color-status-danger)',
                borderRadius: '2px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                marginBottom: '16px'
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Dashboard'}
            </button>
          </form>

          {/* Quick RBAC Role Switcher (For Acceptance Testing) */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '10px' }}>
              Quick Select Role for Testing:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => selectDemoAccount(acc.email)}
                  style={{
                    padding: '8px',
                    textAlign: 'left',
                    backgroundColor: email === acc.email ? 'var(--color-burgundy-light)' : '#FAF7F2',
                    border: email === acc.email ? '1px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{acc.label}</div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--color-text-muted)' }}>{acc.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '0.78rem', color: 'var(--color-burgundy)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Store size={14} /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
