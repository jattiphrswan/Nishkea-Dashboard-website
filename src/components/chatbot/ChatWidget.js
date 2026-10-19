'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { MessageSquare, X, Send, Sparkles, ShieldCheck, Loader2 } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: "Welcome to NISHKÈA Concierge! I can assist you with jewellery care, ring sizing guidelines, return policies, or help you discover pieces from our 5 curated categories.",
      suggestions: [
        "How do I care for gold-plated jewellery?",
        "What ring sizes do you offer?",
        "Are earrings sold as pairs?",
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

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          link: data.link,
          linkText: data.linkText,
          suggestions: data.suggestions
        }
      ]);
    } catch {
      setError('Unable to reach concierge server. Please check your network or try again.');
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
          aria-label="NISHKÈA Concierge Demo Assistant"
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
                  Grounded Demo Assistant
                </span>
              </div>
            </div>

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

          {/* Assistant Info Banner */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#FEF7EC',
              borderBottom: '1px solid #F5DEB3',
              fontSize: '0.72rem',
              color: '#8C5311'
            }}
          >
            <strong>Node 2 Demo:</strong> Real AI models and live inventory will connect in later nodes.
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
                  <p style={{ margin: 0, color: 'inherit' }}>{msg.text}</p>

                  {/* Optional Deep Link */}
                  {msg.link && (
                    <div style={{ marginTop: '8px' }}>
                      <Link
                        href={msg.link}
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '6px 10px' }}
                      >
                        {msg.linkText || 'View Product'} →
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
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Consulting brand catalogue...</span>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--color-status-danger-bg)',
                  border: '1px solid var(--color-status-danger)',
                  color: 'var(--color-status-danger)',
                  borderRadius: '4px',
                  fontSize: '0.76rem'
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about care, ring size, or designs..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              aria-label="Ask concierge a question"
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={isLoading || !inputMessage.trim()}
              aria-label="Send message"
              style={{ padding: '0 12px' }}
            >
              <Send size={16} />
            </button>
          </form>
        </aside>
      )}
    </>
  );
}
