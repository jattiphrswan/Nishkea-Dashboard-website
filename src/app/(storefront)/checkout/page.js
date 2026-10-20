'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency } from '../../../lib/formatters';
import PlaceholderImage from '../../../components/ui/PlaceholderImage';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
  CreditCard,
  ShoppingBag,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartSubtotalMinor, clearCart } = useStore();

  const [formData, setFormData] = useState({
    name: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@example.com',
    phone: '+91 98765 43210',
    addressLine1: '402, Sea Green Apartments, Worli Sea Face',
    addressLine2: 'Near Flora Fountain',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400018',
    paymentMethod: 'RAZORPAY_UPI'
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Complimentary shipping calculation
  const isFreeShipping = cartSubtotalMinor >= 300000;
  const shippingFeeMinor = cart.length > 0 && !isFreeShipping ? 25000 : 0;
  const orderTotalMinor = cartSubtotalMinor + shippingFeeMinor;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setErrorMessage('Your bag is empty. Please add pieces before checking out.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.addressLine1 || !formData.city || !formData.postalCode) {
      setErrorMessage('Please fill in all required shipping and contact details.');
      return;
    }

    try {
      setLoading(true);

      // 1. Submit Order to POST /api/checkout
      const payload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: 'India'
        },
        items: cart.map((item) => ({
          sku: item.sku || item.variant?.sku,
          quantity: item.quantity
        })),
        paymentMethod: formData.paymentMethod,
        idempotencyKey: `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      const createdOrder = data.order;

      // 2. Simulate Payment Gateway Callback via Webhook
      const webhookPayload = {
        event_id: `evt_auto_${Date.now()}`,
        event_type: 'payment.succeeded',
        data: {
          orderNumber: createdOrder.orderNumber,
          paymentId: `PAY_RZP_${Math.floor(1000000 + Math.random() * 9000000)}`
        }
      };

      await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      });

      // Update confirmed order object with payment success
      createdOrder.paymentStatus = 'PAID';
      createdOrder.fulfillmentStatus = 'PENDING_PICKING';

      // 3. Clear Bag
      clearCart();
      setConfirmedOrder(createdOrder);
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedOrder) {
    return (
      <div style={{ padding: 'var(--space-12) 0 var(--space-20)', backgroundColor: '#FAF8F6' }}>
        <div className="container-storefront" style={{ maxWidth: '820px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-8) var(--space-10)',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(30, 107, 74, 0.1)',
                color: 'var(--color-status-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold)', fontWeight: 600 }}>
              Order Confirmed & Vault Reserved
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '6px', marginBottom: '8px' }}>
              Thank You for Your Patronage
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto 24px' }}>
              We have received your order and reserved your handcrafted jewellery directly from our secure vault. A confirmation invoice has been sent to <strong>{confirmedOrder.customer.email}</strong>.
            </p>

            {/* Order Meta Bar */}
            <div
              style={{
                backgroundColor: '#FDFBF8',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                textAlign: 'left',
                marginBottom: '28px'
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Order Number
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700, color: 'var(--color-burgundy)', marginTop: '2px' }}>
                  {confirmedOrder.orderNumber}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Payment Status
                </span>
                <div style={{ marginTop: '2px' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    ● {confirmedOrder.paymentStatus} (Verified)
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Fulfillment Status
                </span>
                <div style={{ marginTop: '2px' }}>
                  <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                    ● {confirmedOrder.fulfillmentStatus}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Order Total
                </span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                  {formatCurrency(confirmedOrder.orderTotalMinor, confirmedOrder.currency)}
                </div>
              </div>
            </div>

            {/* Confirmed Items List */}
            <div style={{ textAlign: 'left', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
                Allocated Jewellery Pieces
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {confirmedOrder.lines.map((line) => (
                  <div
                    key={line.sku}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: '#FAF8F6',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{line.designName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        SKU: {line.sku} | Option: {line.colour || line.size} | Qty: {line.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--color-burgundy)', fontSize: '0.95rem' }}>
                      {formatCurrency(line.lineTotalMinor, 'INR')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination */}
            <div
              style={{
                textAlign: 'left',
                backgroundColor: '#FAF8F6',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px 20px',
                marginBottom: '28px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start'
              }}
            >
              <Truck size={22} color="var(--color-burgundy)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  Insured Courier Delivery Destination
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {confirmedOrder.shippingAddress.addressLine1}, {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state} — {confirmedOrder.shippingAddress.postalCode}
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Contact: {confirmedOrder.customer.name} ({confirmedOrder.customer.phone})
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                Continue Exploring Atelier <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard?tab=orders" className="btn btn-outline" style={{ padding: '12px 24px' }}>
                View in Backoffice Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM VIEW
  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className="container-storefront">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
          <Link href="/cart">Shopping Bag</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-text-main)', fontWeight: 600 }}>Insured Checkout</span>
        </div>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-gold)', fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <Lock size={13} /> 256-Bit Encrypted Atelier Checkout
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', marginTop: '4px', marginBottom: '8px' }}>
            Order Confirmation & Delivery
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', maxWidth: '640px' }}>
            Complete your shipping details to atomically hold and dispatch your chosen jewellery pieces from our secure warehouse.
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#FFF0F3',
              border: '1px solid #F5C6CB',
              borderRadius: 'var(--radius-xs)',
              color: '#842029',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)'
          }}
          className="checkout-grid"
        >
          <style jsx>{`
            @media (min-width: 960px) {
              .checkout-grid {
                grid-template-columns: 1.25fr 0.75fr !important;
                gap: 40px !important;
              }
            }
          `}</style>

          {/* Left: Shipping & Payment Form */}
          <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Step 1: Contact Information */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="var(--color-burgundy)" /> 1. Contact Information
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="checkout-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Full Legal Name *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Email (for invoice & dispatch alerts) *
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Mobile Phone (for courier OTP) *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Destination */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--color-burgundy)" /> 2. Delivery Destination
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="checkout-address1" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Street Address & Apartment *
                  </label>
                  <input
                    id="checkout-address1"
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 402, Sea Green Apartments, Worli"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="checkout-address2" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Landmark / Floor (Optional)
                  </label>
                  <input
                    id="checkout-address2"
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Near Flora Fountain"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-city" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    City *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-state" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    State / Province *
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-postal" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    PIN / Postal Code *
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#FAF8F6'
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="checkout-country" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }}>
                    Country
                  </label>
                  <input
                    id="checkout-country"
                    type="text"
                    disabled
                    value="India"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--color-border)',
                      fontSize: '0.88rem',
                      backgroundColor: '#F3EFEA',
                      color: '#666'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="var(--color-burgundy)" /> 3. Payment Method
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: formData.paymentMethod === 'RAZORPAY_UPI' ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: formData.paymentMethod === 'RAZORPAY_UPI' ? 'rgba(74, 21, 37, 0.04)' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY_UPI"
                    checked={formData.paymentMethod === 'RAZORPAY_UPI'}
                    onChange={handleChange}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Instant UPI &amp; Cards (Razorpay)</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      Google Pay, PhonePe, Paytm, and Visa/Mastercard/RuPay credit cards
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    border: formData.paymentMethod === 'NETBANKING' ? '2px solid var(--color-burgundy)' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: formData.paymentMethod === 'NETBANKING' ? 'rgba(74, 21, 37, 0.04)' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="NETBANKING"
                    checked={formData.paymentMethod === 'NETBANKING'}
                    onChange={handleChange}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Net Banking</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                      HDFC Bank, ICICI Bank, State Bank of India, Axis Bank
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading || cart.length === 0}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1rem',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <span>Securing Inventory &amp; Processing...</span>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Authorize &amp; Place Order • {formatCurrency(orderTotalMinor, 'INR')}</span>
                </>
              )}
            </button>
          </form>

          {/* Right: Order Summary Sidebar */}
          <div>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '24px',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: '24px'
              }}
            >
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                Bag Summary ({cart.length} {cart.length === 1 ? 'Design' : 'Designs'})
              </h3>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', maxHeight: '340px', overflowY: 'auto' }}>
                {cart.map((item, idx) => (
                  <div key={item.sku || idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: 'var(--radius-xs)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: '#FAF8F6' }}>
                      <PlaceholderImage
                        src={item.image || (item.product?.images && item.product.images[0]?.url) || '/images/categories/earrings.svg'}
                        alt={item.name || item.product?.name || 'Jewellery piece'}
                        aspectRatio="1 / 1"
                        category={item.categoryName}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name || item.product?.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                        Qty: {item.quantity} • {item.colour || item.size || 'Standard'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-burgundy)', whiteSpace: 'nowrap' }}>
                      {formatCurrency((item.priceMinor || item.product?.priceMinor || 0) * item.quantity, 'INR')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Breakdown */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartSubtotalMinor, 'INR')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                  <span>Insured Domestic Shipping</span>
                  <span>{isFreeShipping ? <strong style={{ color: 'var(--color-status-success)' }}>FREE</strong> : formatCurrency(shippingFeeMinor, 'INR')}</span>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-burgundy)' }}>
                  <span>Grand Total</span>
                  <span>{formatCurrency(orderTotalMinor, 'INR')}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                  (Includes all GST and insurance)
                </div>
              </div>

              {/* Assurance Trust Badges */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="var(--color-gold)" /> Zero-Overselling Transactional Vault Gate
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={14} color="var(--color-gold)" /> Tamper-Evident Courier Transit Protection
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--color-gold)" /> Authenticity Certified &amp; 7-Day Inspection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
