'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, Mail, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.name,
          email: regForm.email,
          phone: regForm.phone,
          password: regForm.password,
          address: {
            addressLine1: regForm.addressLine1,
            city: regForm.city,
            state: regForm.state,
            postalCode: regForm.postalCode,
            country: 'India'
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      router.push('/account');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoClient = () => {
    setLoginEmail('aditi.sharma@example.com');
    setLoginPassword('ClientPassword2026!');
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg)',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(182, 151, 99, 0.08) 0%, transparent 60%)',
        minHeight: '85vh',
        padding: 'clamp(40px, 6vw, 80px) 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(182, 151, 99, 0.35)',
          borderRadius: '12px',
          maxWidth: '480px',
          width: '100%',
          padding: 'clamp(28px, 5vw, 44px)',
          boxShadow: '0 24px 50px -12px rgba(85, 19, 42, 0.12), 0 4px 16px rgba(0, 0, 0, 0.03)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              fontWeight: 700,
              marginBottom: '8px'
            }}
          >
            <Sparkles size={13} />
            <span>TERONA NISHKÈA MAISON</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.85rem',
              margin: '0 0 6px',
              fontWeight: 500,
              color: 'var(--color-burgundy)'
            }}
          >
            {mode === 'login' ? 'Client Atelier Portal' : 'Create Atelier Account'}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
            {mode === 'login'
              ? 'Access bespoke orders, track BlueDart shipments, and manage security.'
              : 'Join the NISHKÈA client registry for exclusive bespoke privileges.'}
          </p>
        </div>

        {/* Tab Mode Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#F5EFEB',
            border: '1px solid rgba(182, 151, 99, 0.25)',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '24px'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(85, 19, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Client Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              padding: '10px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
              color: mode === 'register' ? 'var(--color-burgundy)' : 'var(--color-text-muted)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? '0 2px 6px rgba(85, 19, 42, 0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '0.86rem', marginBottom: '18px', border: '1px solid #FCA5A5' }}>
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-main)' }}>
                Client Email Address
              </label>
              <input
                type="email"
                required
                placeholder="aditi.sharma@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FCFCFC'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-gold)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(182, 151, 99, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text-main)' }}>
                Account Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  backgroundColor: '#FCFCFC'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-gold)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(182, 151, 99, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Demo Credential Quick-Fill */}
            <div
              style={{
                backgroundColor: '#FAF5EE',
                border: '1px solid rgba(182, 151, 99, 0.35)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.78rem'
              }}
            >
              <div>
                <span style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>Demo Client:</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '4px' }}>Aditi Sharma</span>
              </div>
              <button
                type="button"
                onClick={fillDemoClient}
                style={{
                  background: 'none',
                  border: '1px solid var(--color-gold)',
                  borderRadius: '3px',
                  color: 'var(--color-burgundy)',
                  padding: '2px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                1-Click Auto Fill
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '6px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to My Dashboard →'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Priya Nambiar"
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Create Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters (PBKDF2 encrypted)"
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                Delivery Address Line
              </label>
              <input
                type="text"
                placeholder="House / Apartment, Street"
                value={regForm.addressLine1}
                onChange={(e) => setRegForm({ ...regForm, addressLine1: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  City
                </label>
                <input
                  type="text"
                  placeholder="Mumbai"
                  value={regForm.city}
                  onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                  Postal PIN Code
                </label>
                <input
                  type="text"
                  placeholder="400018"
                  value={regForm.postalCode}
                  onChange={(e) => setRegForm({ ...regForm, postalCode: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.84rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '6px' }}
            >
              {loading ? 'Creating Account...' : 'Complete Atelier Registration →'}
            </button>
          </form>
        )}

        {/* Separator & Staff Switcher */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
            Are you a company employee or operations specialist?
          </p>
          <Link
            href="/dashboard/login"
            style={{
              fontSize: '0.82rem',
              color: 'var(--color-burgundy)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Access Staff Operations Centre <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
