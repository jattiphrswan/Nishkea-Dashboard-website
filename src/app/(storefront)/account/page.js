'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  User,
  Lock,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  LogOut,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Phone,
  Mail
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/formatters';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'profile' | 'security' | 'support'
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Load customer data
  const loadCustomerData = useCallback(async () => {
    setLoading(true);
    try {
      const [meRes, ordersRes] = await Promise.all([
        fetch('/api/account/me'),
        fetch('/api/account/orders')
      ]);

      if (!meRes.ok) {
        router.push('/account/login');
        return;
      }

      const meData = await meRes.json();
      const ordersData = await ordersRes.json();

      if (meData.success) {
        setCustomer(meData.customer);
        setProfileForm({
          name: meData.customer.name || '',
          phone: meData.customer.phone || '',
          addressLine1: meData.customer.address?.addressLine1 || '',
          addressLine2: meData.customer.address?.addressLine2 || '',
          city: meData.customer.address?.city || '',
          state: meData.customer.address?.state || '',
          postalCode: meData.customer.address?.postalCode || ''
        });
      }

      if (ordersData.success) {
        setOrders(ordersData.orders || []);
      }
    } catch {
      router.push('/account/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadCustomerData();
  }, [loadCustomerData]);

  const handleLogout = async () => {
    await fetch('/api/account/logout', { method: 'POST' });
    router.push('/account/login');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/account/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone,
          address: {
            addressLine1: profileForm.addressLine1,
            addressLine2: profileForm.addressLine2,
            city: profileForm.city,
            state: profileForm.state,
            postalCode: profileForm.postalCode
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setCustomer(data.customer);
      setFeedback({ type: 'success', message: '✓ Personal details and delivery address updated successfully.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation password do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setFeedback({ type: 'success', message: '✓ Password updated successfully with PBKDF2 encryption.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-burgundy)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '0.9rem' }}>Loading your atelier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '90vh', padding: '40px 20px 80px' }}>
      <div className="container-storefront" style={{ maxWidth: '1060px' }}>
        {/* Customer Header Banner */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '24px 30px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.72rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--color-gold)',
                  fontWeight: 600
                }}
              >
                NISHKÈA ATELIER CLIENT PORTAL
              </span>
              <span className="badge badge-gold" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                {customer?.segment || 'RETAIL'} VIP
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', margin: '4px 0 2px', color: 'var(--color-burgundy)' }}>
              Welcome, {customer?.name}
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
              {customer?.email} &bull; {customer?.phone || 'No phone registered'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link href="/shop" className="btn btn-secondary btn-sm" style={{ fontSize: '0.8rem' }}>
              Explore Atelier Shop
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '4px',
              backgroundColor: feedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
              color: feedback.type === 'error' ? '#991B1B' : '#166534',
              fontSize: '0.86rem',
              marginBottom: '20px'
            }}
          >
            {feedback.message}
          </div>
        )}

        {/* Dashboard Layout: Sidebar Tabs + Content Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', alignItems: 'flex-start' }}>
          {/* Navigation Sidebar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
            }}
          >
            {[
              { id: 'orders', label: 'My Orders & Tracking', icon: Package, badge: orders.length },
              { id: 'profile', label: 'Profile & Addresses', icon: User },
              { id: 'security', label: 'Password & Security', icon: Lock },
              { id: 'support', label: 'Concierge & Inquiries', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { setActiveTab(tab.id); setFeedback(null); }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: isActive ? '#FAF7F2' : 'transparent',
                    color: isActive ? 'var(--color-burgundy)' : 'var(--color-charcoal)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={16} color={isActive ? 'var(--color-burgundy)' : 'var(--color-text-muted)'} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'var(--color-burgundy)' : '#F3F4F6',
                        color: isActive ? '#FFFFFF' : 'var(--color-charcoal)'
                      }}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content Panel */}
          <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
            {/* TAB 1: ORDERS & TRACKING */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--color-charcoal)' }}>
                    My Orders &amp; Shipment Tracking
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                    {orders.length} order(s) placed
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px',
                      padding: '40px',
                      textAlign: 'center'
                    }}
                  >
                    <Package size={40} color="var(--color-gold)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 6px' }}>No orders found</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '360px', margin: '0 auto 16px' }}>
                      You haven&apos;t placed any atelier jewellery orders yet. Discover our handcrafted collection today.
                    </p>
                    <Link href="/shop" className="btn btn-primary btn-sm">
                      Browse Shop
                    </Link>
                  </div>
                ) : (
                  orders.map((ord) => {
                    const isDispatched = ord.fulfillmentStatus === 'DISPATCHED';

                    return (
                      <div
                        key={ord.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '24px',
                          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', marginBottom: '16px' }}>
                          <div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                              Order Reference
                            </div>
                            <strong style={{ fontSize: '1.05rem', color: 'var(--color-burgundy)' }}>
                              {ord.orderNumber}
                            </strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                              Placed on {formatDate(ord.createdAt)}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                              Total Paid
                            </div>
                            <strong style={{ fontSize: '1.1rem', color: 'var(--color-charcoal)' }}>
                              {formatCurrency(ord.orderTotalMinor, ord.currency)}
                            </strong>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <span className="badge badge-success">{ord.paymentStatus}</span>
                              <span className={`badge ${isDispatched ? 'badge-success' : 'badge-gold'}`}>
                                {ord.fulfillmentStatus}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Live Courier Tracking Tracker Card */}
                        <div
                          style={{
                            backgroundColor: '#FAF7F2',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            padding: '16px',
                            marginBottom: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Truck size={17} color="var(--color-burgundy)" />
                              <strong style={{ fontSize: '0.86rem' }}>
                                Courier: {ord.tracking?.carrier || 'BlueDart Express'}
                              </strong>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal)' }}>
                              AWB / Waybill: <code>{ord.tracking?.trackingNumber}</code>
                            </div>
                          </div>

                          {/* 4-Step Fulfillment Stepper */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.74rem' }}>
                            <div style={{ color: '#166534', fontWeight: 600 }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#166534', margin: '0 auto 4px' }} />
                              Payment Verified
                            </div>
                            <div style={{ color: '#166534', fontWeight: 600 }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#166534', margin: '0 auto 4px' }} />
                              Vault Allocated
                            </div>
                            <div style={{ color: isDispatched ? '#166534' : 'var(--color-gold)', fontWeight: 600 }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isDispatched ? '#166534' : 'var(--color-gold)', margin: '0 auto 4px' }} />
                              {isDispatched ? 'Dispatched' : 'Packing in Vault'}
                            </div>
                            <div style={{ color: isDispatched ? 'var(--color-charcoal)' : 'var(--color-text-muted)' }}>
                              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: isDispatched ? 'var(--color-gold)' : '#D1D5DB', margin: '0 auto 4px' }} />
                              Out for Delivery
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                            Jewellery Pieces
                          </span>
                          {ord.lines?.map((line, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.84rem',
                                borderTop: idx > 0 ? '1px dashed var(--color-border)' : 'none',
                                paddingTop: idx > 0 ? '8px' : 0
                              }}
                            >
                              <div>
                                <strong>{line.designName || line.sku}</strong>
                                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                                  Variant: {line.colour || 'Standard'} &bull; Qty: {line.quantity}
                                </div>
                              </div>
                              <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                                {formatCurrency(line.lineTotalMinor || line.unitPriceMinor * line.quantity, ord.currency)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: PROFILE & ADDRESSES */}
            {activeTab === 'profile' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '28px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
                }}
              >
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px', fontFamily: 'var(--font-serif)', color: 'var(--color-charcoal)' }}>
                  Personal Profile &amp; Delivery Address
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
                  Update your contact details and default insured delivery destination.
                </p>

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Phone / WhatsApp
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Delivery Address Line 1
                    </label>
                    <input
                      type="text"
                      placeholder="Apartment, Street name"
                      value={profileForm.addressLine1}
                      onChange={(e) => setProfileForm({ ...profileForm, addressLine1: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Landmark, Area"
                      value={profileForm.addressLine2}
                      onChange={(e) => setProfileForm({ ...profileForm, addressLine2: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        State
                      </label>
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm({ ...profileForm, state: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        PIN Code
                      </label>
                      <input
                        type="text"
                        value={profileForm.postalCode}
                        onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" disabled={profileSaving} style={{ minWidth: '150px' }}>
                      {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: PASSWORD & SECURITY */}
            {activeTab === 'security' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '28px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <ShieldCheck size={20} color="var(--color-burgundy)" />
                  <h2 style={{ fontSize: '1.25rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--color-charcoal)' }}>
                    Password &amp; Account Security
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
                  All client passwords are encrypted using salted PBKDF2 hashing with SHA-512 authentication.
                </p>

                <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Re-enter new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={passwordSaving} style={{ minWidth: '150px', alignSelf: 'flex-start' }}>
                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: CONCIERGE & SUPPORT */}
            {activeTab === 'support' && (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '28px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.02)'
                }}
              >
                <h2 style={{ fontSize: '1.25rem', margin: '0 0 6px', fontFamily: 'var(--font-serif)', color: 'var(--color-charcoal)' }}>
                  Atelier Concierge &amp; Exchange Support
                </h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
                  Every NISHKÈA piece includes our signature complimentary resizing, clasp inspection, and insured courier exchange service.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '16px', backgroundColor: '#FAF7F2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Phone size={16} color="var(--color-burgundy)" />
                      <strong>Bespoke Assistance Desk</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      Available Mon–Sat 10:30 AM – 7:30 PM (IST)
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-burgundy)', marginTop: '4px' }}>
                      +91 (0) 98765 43210
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--color-border)', borderRadius: '4px', padding: '16px', backgroundColor: '#FAF7F2' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Mail size={16} color="var(--color-burgundy)" />
                      <strong>Client Services Email</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      Guaranteed response within 4 hours
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-burgundy)', marginTop: '4px' }}>
                      concierge@nishkea.internal
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Need to schedule an appointment at our Mumbai or Jaipur showrooms?
                  </span>
                  <Link href="/contact" className="btn btn-primary btn-sm">
                    Book Showroom Appointment →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
