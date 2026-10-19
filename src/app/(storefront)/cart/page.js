'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../../context/StoreContext';
import { formatCurrency } from '../../../lib/formatters';
import PlaceholderImage from '../../../components/ui/PlaceholderImage';
import { ShoppingBag, Trash2, ShieldAlert, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartSubtotalMinor } = useStore();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // Complimentary shipping threshold: ₹3,000 (300,000 minor units)
  const shippingThresholdMinor = 300000;
  const isFreeShipping = cartSubtotalMinor >= shippingThresholdMinor;
  const shippingFeeMinor = cart.length > 0 && !isFreeShipping ? 25000 : 0; // ₹250.00
  const orderTotalMinor = cartSubtotalMinor + shippingFeeMinor;

  return (
    <div style={{ padding: 'var(--space-8) 0 var(--space-16)' }}>
      <div className="container-storefront">
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span style={{ fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 600 }}>
            BAG PREVIEW
          </span>
          <h1 style={{ marginTop: '4px', marginBottom: '8px' }}>Your Shopping Bag</h1>
          <p style={{ maxWidth: '640px' }}>
            Review your selected designs. In Node 2, bag contents are stored locally.
          </p>
        </div>

        {/* Prominent Architectural Disclaimer */}
        <div
          role="note"
          style={{
            backgroundColor: '#FEF7EC',
            border: '1px solid #F5DEB3',
            borderRadius: 'var(--radius-xs)',
            padding: '12px 18px',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.82rem',
            color: '#8C5311'
          }}
        >
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Transactional Stock Rule:</strong> Adding items to this preview shopping bag does <em>not</em> reserve physical warehouse stock. Reservations are created atomically at server checkout (scheduled for Node 8). Live payment processing is intentionally inactive in this scaffold node.
          </div>
        </div>

        {cart.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 'var(--space-8)'
            }}
            className="cart-layout-grid"
          >
            <style jsx>{`
              @media (min-width: 900px) {
                .cart-layout-grid {
                  grid-template-columns: 2fr 1fr !important;
                }
              }
            `}</style>

            {/* Left Column: Cart Items List */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '14px 20px',
                    backgroundColor: '#FAF7F2',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em'
                  }}
                >
                  <span>Selected Pieces ({cart.length})</span>
                  <button
                    type="button"
                    onClick={clearCart}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-status-danger)',
                      cursor: 'pointer',
                      fontSize: '0.74rem'
                    }}
                  >
                    Clear All
                  </button>
                </div>

                <div style={{ divideY: '1px solid var(--color-border)' }}>
                  {cart.map((item) => (
                    <div
                      key={item.sku}
                      style={{
                        padding: '20px',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'flex-start',
                        borderBottom: '1px solid var(--color-border-subtle)'
                      }}
                    >
                      {/* Thumbnail */}
                      <div style={{ width: '88px', height: '88px', flexShrink: 0, borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
                        <PlaceholderImage src={item.image} alt={item.name} />
                      </div>

                      {/* Details */}
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          {item.categoryName} • {item.salesUnit === 'pair' ? 'Pair' : 'Piece'}
                        </span>
                        <h3 style={{ fontSize: '1.05rem', margin: '2px 0 6px' }}>
                          <Link href={`/products/${item.slug}`}>{item.name}</Link>
                        </h3>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                          Variant: <strong>{item.colour} {item.size ? `(${item.size})` : ''}</strong> • SKU: {item.sku}
                        </div>

                        {/* Quantity and Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '2px' }}>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.sku, item.quantity - 1)}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span style={{ width: '32px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600 }}>
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.sku, item.quantity + 1)}
                              style={{ width: '28px', height: '28px', border: 'none', background: 'none', cursor: 'pointer' }}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-burgundy)', fontSize: '1.05rem' }}>
                              {formatCurrency(item.priceMinor * item.quantity, item.currency)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.sku)}
                              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
                              aria-label={`Remove ${item.name} from bag`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                  <ArrowLeft size={16} /> Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div>
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xs)',
                  padding: 'var(--space-6)',
                  position: 'sticky',
                  top: '100px'
                }}
              >
                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
                  Summary Breakdown
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Merchandise Subtotal:</span>
                    <span style={{ fontWeight: 600 }}>{formatCurrency(cartSubtotalMinor, 'INR')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>Insured Domestic Courier:</span>
                    <span style={{ fontWeight: 600, color: isFreeShipping ? 'var(--color-status-success)' : 'inherit' }}>
                      {isFreeShipping ? 'COMPLIMENTARY' : formatCurrency(shippingFeeMinor, 'INR')}
                    </span>
                  </div>

                  {!isFreeShipping && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-gold)', backgroundColor: 'var(--color-gold-light)', padding: '6px 10px', borderRadius: '2px' }}>
                      Add {formatCurrency(shippingThresholdMinor - cartSubtotalMinor, 'INR')} more to unlock complimentary courier delivery.
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Demo Estimated Total:</span>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-burgundy)' }}>
                      {formatCurrency(orderTotalMinor, 'INR')}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  * All taxes and GST calculations are provisional and will be formalized upon backend checkout connection.
                </div>

                {/* Checkout Trigger */}
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCheckoutModalOpen(true)}
                  style={{ width: '100%', padding: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Lock size={16} /> Proceed to Checkout
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  🔒 Secure SSL Checkout Placeholder (Node 8)
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Bag State */
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-16) var(--space-6)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(112, 26, 54, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-burgundy)'
              }}
            >
              <ShoppingBag size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Your Bag is Empty</h2>
            <p style={{ maxWidth: '440px', fontSize: '0.9rem' }}>
              You have not added any jewellery or accessories to your preview bag yet.
            </p>
            <Link href="/shop" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Browse Designs <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {/* Informative Checkout Boundary Dialog */}
        {checkoutModalOpen && (
          <div
            className="drawer-overlay"
            onClick={() => setCheckoutModalOpen(false)}
            role="presentation"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="checkout-modal-title"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                maxWidth: '520px',
                width: '100%',
                padding: 'var(--space-8)',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-burgundy)', marginBottom: '16px' }}>
                <Lock size={24} />
                <h3 id="checkout-modal-title" style={{ fontSize: '1.4rem', margin: 0 }}>
                  Checkout Offline in Node 2
                </h3>
              </div>

              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text-main)', marginBottom: '16px' }}>
                Per project working rules in <strong>AGENTS.md</strong> and <strong>docs/ROADMAP.md</strong>:
              </p>

              <div
                style={{
                  backgroundColor: '#FAF7F2',
                  border: '1px solid var(--color-border)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  marginBottom: '20px'
                }}
              >
                <ul style={{ paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>No customer charges or live payment gateways have been created in this foundation node.</li>
                  <li>Atomic stock reservations, order line pricing snapshots, and webhook verification will be built in <strong>Node 8</strong>.</li>
                  <li>Your current cart contains {cart.length} item(s) totalling {formatCurrency(orderTotalMinor, 'INR')}.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCheckoutModalOpen(false)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
