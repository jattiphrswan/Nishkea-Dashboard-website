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
  ShieldCheck,
  Calendar,
  ArrowRight,
  Gem,
  Award,
  Crown,
  Video,
  Building2
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

  const consultationTypes = [
    { id: 'BESPOKE_CONSULTATION', label: 'Bespoke Jewellery', icon: Gem, desc: 'Custom one-of-a-kind commission' },
    { id: 'BRIDAL_TROUSSEAU', label: 'Bridal Trousseau', icon: Crown, desc: 'Complete wedding heirloom suites' },
    { id: 'BOUTIQUE_VISIT', label: 'Showroom Viewing', icon: Building2, desc: 'Private 1-on-1 gallery appointment' },
    { id: 'VIRTUAL_CONCIERGE', label: 'Virtual Styling', icon: Video, desc: 'High-definition video consultation' }
  ];

  const showroomLocations = [
    {
      id: 'MUMBAI_ATELIER',
      name: 'Mumbai Flagship Atelier',
      neighborhood: 'Worli Sea Face',
      address: '402, Sea Green Mansions, Worli Sea Face, Mumbai 400018',
      tag: 'Flagship & Vault'
    },
    {
      id: 'JAIPUR_GUILD',
      name: 'Jaipur Heritage Studio',
      neighborhood: 'C-Scheme Heritage Quarter',
      address: '14, Royal Filigree Enclave, C-Scheme, Jaipur 302001',
      tag: 'Master Goldsmiths'
    },
    {
      id: 'VIRTUAL_CONCIERGE',
      name: 'Global Virtual Atelier',
      neighborhood: 'Worldwide Video Suite',
      address: 'Private encrypted video link with senior jewelry specialist',
      tag: 'Online Concierge'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: 'var(--space-16)' }}>
      {/* Editorial Luxury Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at 50% -10%, rgba(212, 175, 55, 0.22) 0%, rgba(95, 20, 46, 0.98) 50%, #360815 100%)',
          color: '#FFFFFF',
          padding: 'clamp(50px, 7vw, 85px) 20px clamp(40px, 6vw, 65px)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 12px 35px rgba(54, 8, 21, 0.25)'
        }}
      >
        {/* Subtle Ambient Decorative Circles */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '580px',
            height: '580px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Atelier Monogram Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              padding: '6px 18px',
              borderRadius: '9999px',
              marginBottom: '20px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
            }}
          >
            <Sparkles size={14} color="#F2D396" />
            <span
              style={{
                fontSize: '0.74rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#F9ECD2',
                fontWeight: 600
              }}
            >
              NISHKÈA MAISON ATELIER &bull; PRIVATE CURATION
            </span>
            <Sparkles size={14} color="#F2D396" />
          </div>

          {/* Luminous High-Contrast Serif Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.4rem, 5.2vw, 3.6rem)',
              fontWeight: 500,
              lineHeight: 1.15,
              margin: '0 0 18px',
              letterSpacing: '-0.015em',
              color: '#FFFDF9',
              background: 'linear-gradient(180deg, #FFFFFF 30%, #F5E6CC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 2px 14px rgba(0, 0, 0, 0.35))'
            }}
          >
            Connect with Our Master Concierge
          </h1>

          {/* Warm Ivory Prose Subtitle */}
          <p
            style={{
              fontSize: 'clamp(0.96rem, 1.8vw, 1.1rem)',
              color: 'rgba(255, 248, 240, 0.92)',
              maxWidth: '680px',
              margin: '0 auto 28px',
              lineHeight: 1.7,
              fontWeight: 300,
              letterSpacing: '0.01em'
            }}
          >
            Whether commissioning a bespoke bridal ensemble, reserving a private viewing suite at our flagships, or seeking styling curation, our master jewelry specialists are at your command.
          </p>

          {/* Golden Filigree Ornament Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              margin: '0 auto 28px',
              maxWidth: '360px',
              opacity: 0.85
            }}
          >
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7))' }} />
            <span style={{ color: '#E8CA88', fontSize: '0.85rem' }}>◈ ✦ ◈</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212, 175, 55, 0.7), transparent)' }} />
          </div>

          {/* Luxury Trust Pillars Strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'clamp(14px, 3vw, 28px)',
              fontSize: '0.8rem',
              color: '#F4ECE4',
              letterSpacing: '0.03em'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gem size={14} color="#E8CA88" />
              <span>Certified Polki &amp; 18K Hallmarked Gold</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={14} color="#E8CA88" />
              <span>Private Viewing Suites in Mumbai &amp; Jaipur</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#E8CA88" />
              <span>Fully Insured &amp; Armoured Courier Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Form + Locations Grid */}
      <div className="container-storefront" style={{ marginTop: 'clamp(28px, 4vw, 48px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 'clamp(24px, 4vw, 44px)',
            alignItems: 'flex-start'
          }}
        >
          {/* Column 1: Consultation Booking Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(182, 151, 99, 0.35)',
              borderRadius: '12px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 20px 45px -12px rgba(85, 19, 42, 0.1), 0 4px 16px rgba(0, 0, 0, 0.03)',
              position: 'relative'
            }}
          >
            {/* Top Gold Corner Accent */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                fontWeight: 700,
                color: 'var(--color-gold)',
                marginBottom: '10px'
              }}
            >
              <Sparkles size={14} />
              <span>Private Atelier Appointment</span>
            </div>

            <h2
              style={{
                fontSize: '1.45rem',
                margin: '0 0 6px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 600,
                color: 'var(--color-burgundy)'
              }}
            >
              Request a Bespoke Consultation
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', margin: '0 0 24px', lineHeight: 1.5 }}>
              Share your vision and event timeline. Our senior atelier concierge will review your brief and respond within 4 business hours.
            </p>

            {submitted ? (
              <div
                style={{
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #86EFAC',
                  borderRadius: '8px',
                  padding: '36px 24px',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(22, 101, 52, 0.08)'
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#DCFCE7',
                    border: '2px solid #86EFAC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <CheckCircle size={36} color="#166534" />
                </div>
                <h3 style={{ fontSize: '1.3rem', margin: '0 0 8px', color: '#166534', fontFamily: 'var(--font-serif)' }}>
                  Consultation Request Confirmed
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#14532D', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Thank you, <strong>{form.fullName}</strong>. Your commission enquiry has been logged into our atelier concierge desk. A senior curator will contact you at <strong>{form.email}</strong> shortly.
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
                  style={{ fontSize: '0.84rem', padding: '10px 22px' }}
                >
                  Submit Another Consultation Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {error && (
                  <div style={{ padding: '12px 16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '6px', fontSize: '0.86rem', border: '1px solid #FCA5A5' }}>
                    {error}
                  </div>
                )}

                {/* Consultation Type Selector Grid */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    Consultation Type *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                    {consultationTypes.map((type) => {
                      const Icon = type.icon;
                      const isSelected = form.inquiryType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setForm({ ...form, inquiryType: type.id })}
                          style={{
                            textAlign: 'left',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-burgundy-light)' : '#FAFAFA',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icon size={14} color={isSelected ? 'var(--color-burgundy)' : 'var(--color-text-muted)'} />
                            <span style={{ fontSize: '0.78rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? 'var(--color-burgundy)' : 'var(--color-text-main)' }}>
                              {type.label}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
                            {type.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Client Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Merchant"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
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

                {/* Email and Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@domain.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
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
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                </div>

                {/* Showroom / Consultation Venue */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                    Preferred Atelier Showroom / Venue *
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {showroomLocations.map((loc) => {
                      const isSelected = form.preferredLocation === loc.id;
                      return (
                        <div
                          key={loc.id}
                          onClick={() => setForm({ ...form, preferredLocation: loc.id })}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: isSelected ? '1.5px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                            backgroundColor: isSelected ? 'var(--color-burgundy-light)' : '#FAFAFA',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <MapPin size={14} color={isSelected ? 'var(--color-burgundy)' : 'var(--color-gold)'} />
                              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: isSelected ? 'var(--color-burgundy)' : 'var(--color-text-main)' }}>
                                {loc.name}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', marginLeft: '22px', marginTop: '2px' }}>
                              {loc.address}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: isSelected ? 'var(--color-burgundy)' : '#EDE6E8',
                              color: isSelected ? '#FFFFFF' : 'var(--color-text-muted)',
                              fontWeight: 600,
                              letterSpacing: '0.04em'
                            }}
                          >
                            {loc.tag}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Message / Bespoke Requirements */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                    Artisanal Brief / Custom Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your desired ensemble, diamond/gemstone preferences, wedding date, or custom engraving requirements..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      backgroundColor: '#FCFCFC',
                      lineHeight: 1.5
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#FAF7F2',
                    background: 'linear-gradient(135deg, #701A36 0%, #4E1224 100%)',
                    border: '1px solid rgba(212, 175, 55, 0.65)',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 24px rgba(78, 18, 36, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    marginTop: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 28px rgba(78, 18, 36, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(78, 18, 36, 0.3)';
                  }}
                >
                  {loading ? 'Transmitting Request...' : (
                    <>
                      <span>Submit Atelier Request</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Flagships & Concierge Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {/* Quick Contact & Online Concierge Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(182, 151, 99, 0.35)',
                borderRadius: '12px',
                padding: '28px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    color: 'var(--color-burgundy)',
                    fontWeight: 600
                  }}
                >
                  Direct Concierge Desk
                </h3>
                {/* Live Concierge Status Indicator */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.72rem',
                    backgroundColor: '#ECFDF5',
                    color: '#065F46',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    border: '1px solid #A7F3D0'
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 6px #10B981'
                    }}
                  />
                  Online Now
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
                Our private concierge is available for immediate commission inquiries, courier dispatch status, or personal appointments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.88rem' }}>
                {/* Telephone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-burgundy-light)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={18} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Telephone Concierge
                    </div>
                    <a
                      href="tel:+919876543210"
                      style={{ color: 'var(--color-text-main)', fontWeight: 700, textDecoration: 'none', fontSize: '0.94rem' }}
                    >
                      +91 (0) 98765 43210
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-burgundy-light)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={18} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Official Client Services
                    </div>
                    <a
                      href="mailto:concierge@nishkea.internal"
                      style={{ color: 'var(--color-text-main)', fontWeight: 700, textDecoration: 'none', fontSize: '0.94rem' }}
                    >
                      concierge@nishkea.internal
                    </a>
                  </div>
                </div>

                {/* Hours */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-burgundy-light)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={18} color="var(--color-burgundy)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Atelier Hours (IST)
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '0.86rem' }}>
                      Monday – Saturday: 10:30 AM – 7:30 PM
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
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: 'var(--color-burgundy)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--color-burgundy)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                  Mumbai Flagship Atelier
                </h4>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>By Appointment</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                402, Sea Green Mansions, Worli Sea Face, Worli, Mumbai, Maharashtra 400018
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="var(--color-gold)" />
                <span>Private bridal consultation suite, vault inspection &amp; valet parking.</span>
              </div>
            </div>

            {/* Flagship Showroom 2: Jaipur */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: 'var(--color-gold)'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, fontSize: '1.08rem', color: 'var(--color-burgundy)', fontFamily: 'var(--font-serif)', fontWeight: 600 }}>
                  Jaipur Master Craftsmen Guild
                </h4>
                <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>Heritage Studio</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)', margin: '0 0 10px', lineHeight: 1.5 }}>
                14, Royal Filigree Enclave, C-Scheme, Jaipur, Rajasthan 302001
              </p>
              <div style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gem size={14} color="var(--color-gold)" />
                <span>Master polki kundan setters, 18k gold gilding &amp; gemstone identification.</span>
              </div>
            </div>

            {/* VIP Archival Experience Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #4A1023 0%, #300612 100%)',
                color: '#FAF7F2',
                borderRadius: '12px',
                padding: '22px 24px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                boxShadow: '0 10px 25px rgba(48, 6, 18, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Crown size={18} color="#F2D396" />
                <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#F6E6CC', fontFamily: 'var(--font-serif)', letterSpacing: '0.02em' }}>
                  The Haute Joaillerie Experience
                </h4>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(250, 247, 242, 0.85)', margin: 0, lineHeight: 1.5 }}>
                Commissions exceeding ₹2,50,000 include private salon hospitality, personalized 3D wax prototypes, and an exclusive viewing of unreleased private archival gemstone vaults.
              </p>
            </div>

            {/* Client Portal Link Card */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px dashed var(--color-border)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '0.86rem', color: 'var(--color-text-main)', margin: '0 0 10px', fontWeight: 500 }}>
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

