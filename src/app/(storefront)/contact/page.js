'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle,
  MessageSquare,
  ShieldCheck,
  Calendar,
  ArrowRight
} from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    inquiryType: 'BESPOKE_CONSULTATION',
    preferredLocation: 'MUMBAI_ATELIER',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Editorial Hero Header */}
      <section
        style={{
          backgroundColor: 'var(--color-burgundy)',
          color: '#FFFFFF',
          padding: '60px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: 'var(--color-gold)',
              fontWeight: 600,
              display: 'block',
              marginBottom: '12px'
            }}
          >
            ATELIER APPOINTMENTS &amp; BESPOKE CURATION
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 400,
              lineHeight: 1.2,
              margin: '0 0 16px',
              letterSpacing: '-0.01em'
            }}
          >
            Connect with Our Master Concierge
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.85)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            Whether commissioning a bespoke bridal ensemble, arranging an exclusive viewing at our flagships, or seeking styling advice, our atelier specialists are at your service.
          </p>
        </div>
      </section>

      {/* Main Content: Form + Locations Grid */}
      <div className="container-storefront" style={{ marginTop: 'var(--space-12)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-12)',
            alignItems: 'flex-start'
          }}
        >
          {/* Column 1: Consultation Booking Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={18} color="var(--color-gold)" />
              <h2 style={{ fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                Request Consultation
              </h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 24px' }}>
              Fill in your details below and an atelier concierge will respond within 4 business hours.
            </p>

            {submitted ? (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '4px',
                  padding: '32px 20px',
                  textAlign: 'center'
                }}
              >
                <CheckCircle size={44} color="#166534" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.2rem', margin: '0 0 8px', color: '#166534' }}>Inquiry Received</h3>
                <p style={{ fontSize: '0.88rem', color: '#14532D', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Thank you, {form.fullName}. Your request has been assigned to our concierge team. We will contact you at <strong>{form.email}</strong> shortly.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      fullName: '',
                      email: '',
                      phone: '',
                      inquiryType: 'BESPOKE_CONSULTATION',
                      preferredLocation: 'MUMBAI_ATELIER',
                      message: ''
                    });
                  }}
                  style={{ fontSize: '0.82rem' }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {error && (
                  <div style={{ padding: '10px 14px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '4px', fontSize: '0.84rem' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Merchant"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Phone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Inquiry Category
                    </label>
                    <select
                      value={form.inquiryType}
                      onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    >
                      <option value="BESPOKE_CONSULTATION">Bespoke Jewellery Design</option>
                      <option value="BRIDAL_TROUSSEAU">Bridal Trousseau Curation</option>
                      <option value="ORDER_SUPPORT">Order Status &amp; Tracking</option>
                      <option value="BOUTIQUE_VISIT">Flagship Showroom Visit</option>
                      <option value="GENERAL">General Atelier Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Preferred Showroom
                    </label>
                    <select
                      value={form.preferredLocation}
                      onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem' }}
                    >
                      <option value="MUMBAI_ATELIER">Mumbai Atelier (Worli)</option>
                      <option value="JAIPUR_GUILD">Jaipur Heritage (C-Scheme)</option>
                      <option value="VIRTUAL_CONCIERGE">Virtual Video Consultation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                    Artisanal Requirements / Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please describe your styling requirements, event date, or pieces of interest..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '8px' }}
                >
                  {loading ? 'Submitting Inquiry...' : 'Submit Atelier Request →'}
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Flagships & Concierge Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Contact Summary */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px'
              }}
            >
              <h3 style={{ fontSize: '1.15rem', margin: '0 0 16px', fontFamily: 'var(--font-serif)', color: 'var(--color-burgundy)' }}>
                Direct Concierge Desk
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Telephone Concierge</div>
                    <a href="tel:+919876543210" style={{ color: 'var(--color-charcoal)', fontWeight: 600, textDecoration: 'none' }}>
                      +91 (0) 98765 43210
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Official Client Services</div>
                    <a href="mailto:concierge@nishkea.internal" style={{ color: 'var(--color-charcoal)', fontWeight: 600, textDecoration: 'none' }}>
                      concierge@nishkea.internal
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={16} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>Atelier Working Hours</div>
                    <div style={{ fontWeight: 600, color: 'var(--color-charcoal)' }}>
                      Monday – Saturday: 10:30 AM – 7:30 PM (IST)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Flagship Showroom 1: Mumbai */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-charcoal)' }}>
                  Mumbai Flagship Atelier
                </h4>
                <span className="badge badge-gold">By Appointment</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                402, Sea Green Mansions, Worli Sea Face, Worli, Mumbai, Maharashtra 400018
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Specializes in bespoke bridal trousseaus, private viewings, and insured courier vault dispatches.
              </div>
            </div>

            {/* Flagship Showroom 2: Jaipur */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-charcoal)' }}>
                  Jaipur Master Craftsmen Guild
                </h4>
                <span className="badge badge-gold">Heritage Studio</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 12px', lineHeight: 1.5 }}>
                14, Royal Filigree Enclave, C-Scheme, Jaipur, Rajasthan 302001
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                Home to our master polki kundan setters, 18k gold micron gilders, and certified gemstone setting guild.
              </div>
            </div>

            {/* Client Portal Link Card */}
            <div
              style={{
                backgroundColor: '#FAF7F2',
                border: '1px dashed var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)', margin: '0 0 10px' }}>
                Already placed an order with NISHKÈA? Track your shipment or manage your account in real-time.
              </p>
              <Link
                href="/account"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Access Client Dashboard <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
