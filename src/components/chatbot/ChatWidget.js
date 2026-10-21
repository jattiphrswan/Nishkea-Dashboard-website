'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, Sparkles, ShieldCheck, Loader2, ArrowRight, ExternalLink, Calendar } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: "Welcome to NISHKÈA Maison Concierge. I am your grounded shopping assistant. I can help you discover pieces from our 5 curated categories, check live stock by size or metal, provide ring sizing and jewellery care guides, or track your dispatched order.",
      suggestions: [
        "Gold earrings under 3000",
        "Is size 7 available?",
        "How to care for jewellery",
        "What is your return policy?"
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setError(null);
    setInputMessage('');

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server returned HTTP ${response.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          link: data.link,
          linkText: data.linkText,
          product: data.product,
          suggestions: data.suggestions
        }
      ]);
    } catch (err) {
      setError(err.message || 'Unable to reach concierge server. Please check your network or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type="button"
        className="chat-widget-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close Concierge chat window' : 'Open NISHKÈA Concierge chat window'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        <span style={{ fontSize: '0.84rem', fontWeight: 600, letterSpacing: '0.04em' }}>
          {isOpen ? 'Close' : 'Concierge'}
        </span>
      </button>

      {/* Floating Chat Panel */}
      {isOpen && (
        <aside
          className="chat-window"
          role="dialog"
          aria-modal="true"
          aria-label="NISHKÈA Concierge Assistant"
        >
          {/* Header */}
          <div className="chat-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-gold)'
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#FFFFFF', margin: 0, fontWeight: 600 }}>
                  NISHKÈA Concierge
                </h4>
                <span style={{ fontSize: '0.68rem', color: '#E7DDE0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={11} color="var(--color-gold)" />
                  Grounded Maison Assistant
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                title="Book Private Consultation"
                style={{
                  color: '#FFFFFF',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  fontSize: '0.68rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={12} />
                <span>Salons</span>
              </Link>

              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat window"
                style={{ color: '#FFFFFF' }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Assistant Info Banner */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEF7EC',
              borderBottom: '1px solid #F5DEB3',
              fontSize: '0.72rem',
              color: '#8C5311',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              <strong>Grounded Assistant:</strong> Live catalogue, inventory stock &amp; order tracking.
            </span>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              style={{ color: '#8C5311', fontWeight: 600, textDecoration: 'underline' }}
            >
              Human Concierge
            </Link>
          </div>

          {/* Messages Body */}
          <div className="chat-body" role="log" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div
                  className={`chat-bubble ${
                    msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'
                  }`}
                >
                  <p style={{ margin: 0, color: 'inherit', whiteSpace: 'pre-line' }}>{msg.text}</p>

                  {/* Optional Product Preview Card */}
                  {msg.product && (
                    <div
                      style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#FAF7F2',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                          {msg.product.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-burgundy)', fontWeight: 600 }}>
                          {msg.product.price}
                          {msg.product.available !== undefined && (
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                              ({msg.product.available} available)
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={msg.product.url}
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.7rem', padding: '4px 8px', whiteSpace: 'nowrap' }}
                      >
                        View Piece →
                      </Link>
                    </div>
                  )}

                  {/* Optional Deep Link Button */}
                  {msg.link && !msg.product && (
                    <div style={{ marginTop: '8px' }}>
                      <Link
                        href={msg.link}
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        {msg.linkText || 'View Details'} <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Prompt Suggestions */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      marginBottom: '4px'
                    }}
                  >
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(suggestion)}
                        disabled={isLoading}
                        style={{
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--color-border)',
                          borderRadius: '12px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          color: 'var(--color-burgundy)',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="chat-bubble chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={16} className="animate-spin" />
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Consulting Maison catalogue &amp; inventory...
                </span>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#FDF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  color: '#991B1B',
                  marginTop: '8px'
                }}
              >
                <div>{error}</div>
                <div style={{ marginTop: '6px' }}>
                  <Link
                    href="/contact"
                    onClick={() => setIsOpen(false)}
                    style={{ color: '#991B1B', textDecoration: 'underline', fontWeight: 600 }}
                  >
                    Need human assistance? Contact our private atelier →
                  </Link>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="chat-footer"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about pieces, sizing, care, or orders..."
              maxLength={500}
              disabled={isLoading}
              className="chat-input"
              aria-label="Ask concierge a question"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary"
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Send message to concierge"
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
