'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShieldAlert,
  Lock,
  ArrowUpRight,
  RefreshCw,
  UserCheck,
  Bot,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function StaffAssistantDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the **Atelier Operations Copilot** (Node 14). I operate with strict Role-Based Access Controls to assist with 30-day reviews, physical vault stock, financial margins, team tasks, and orders.',
      suggestions: [
        'Which designs need review?',
        'Check low vault stock',
        'Show commercial financial summary',
        'Show my tasks'
      ],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('manager'); // 'owner' | 'manager' | 'sales_support' | 'inventory_staff' | 'accounts_staff'
  const messagesEndRef = useRef(null);

  const roles = [
    { id: 'manager', label: 'Operations Manager (Kabir Mehta)' },
    { id: 'sales_support', label: 'Sales Support (Ananya Roy)' },
    { id: 'inventory_staff', label: 'Inventory Specialist (Rohit Verma)' },
    { id: 'accounts_staff', label: 'Financial Accounts (Vikram Seth)' },
    { id: 'owner', label: 'Company Owner (Aadhya Sharma)' }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageToSend) => {
    const queryText = (messageToSend || input).trim();
    if (!queryText || loading) return;

    setInput('');
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      staffRole: selectedRole,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Simulate demo session cookie header for testing different personas
      const response = await fetch('/api/dashboard/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `nishkea_staff_session=demo-session:${selectedRole}:${Date.now()}`
        },
        body: JSON.stringify({
          message: queryText,
          sessionId: `staff-${selectedRole}`
        })
      });

      const data = await response.json();

      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: data.reply || (data.error ? `Error: ${data.error}` : 'No response generated.'),
        link: data.link,
        linkText: data.linkText,
        suggestions: data.suggestions || [],
        guarded: data.guarded,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          text: `Connection error: ${err.message}. Please verify the operations server status.`,
          guarded: true,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#14080D',
        color: '#FBF9F5',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.45)',
        borderLeft: '1px solid rgba(212, 175, 55, 0.25)',
        animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#1E0D14',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid #D4AF37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D4AF37'
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.04em', color: '#FFFFFF' }}>
              Atelier Operations Copilot
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(251, 249, 245, 0.65)' }}>
              Node 14 • Permission-Scoped Staff Assistant
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          aria-label="Close Staff Copilot"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(251, 249, 245, 0.7)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Role Switcher Toolbar for Verification */}
      <div
        style={{
          padding: '10px 16px',
          backgroundColor: 'rgba(26, 10, 14, 0.85)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem'
        }}
      >
        <UserCheck size={14} color="#D4AF37" />
        <span style={{ color: 'rgba(251, 249, 245, 0.75)', whiteSpace: 'nowrap' }}>Active Staff Role:</span>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            flex: 1,
            backgroundColor: '#1E0D14',
            color: '#D4AF37',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '0.75rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* Conversation Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '92%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(251, 249, 245, 0.5)',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  display: 'flex',
                  gap: '6px'
                }}
              >
                {isUser ? `Role: ${m.staffRole}` : 'Operations Assistant'} • {m.createdAt}
              </div>

              <div
                style={{
                  backgroundColor: isUser
                    ? 'rgba(212, 175, 55, 0.18)'
                    : m.guarded
                    ? 'rgba(155, 44, 44, 0.25)'
                    : '#1F1117',
                  border: isUser
                    ? '1px solid rgba(212, 175, 55, 0.45)'
                    : m.guarded
                    ? '1px solid rgba(220, 38, 38, 0.45)'
                    : '1px solid rgba(212, 175, 55, 0.18)',
                  color: '#FBF9F5',
                  padding: '12px 14px',
                  borderRadius: isUser ? '8px 8px 2px 8px' : '8px 8px 8px 2px',
                  fontSize: '0.84rem',
                  lineHeight: '1.55',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {m.guarded && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#FCA5A5',
                      fontWeight: 600,
                      marginBottom: '6px',
                      fontSize: '0.76rem'
                    }}
                  >
                    <ShieldAlert size={14} /> Security Guardrail Triggered
                  </div>
                )}

                {m.text}

                {m.link && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={m.link}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#D4AF37',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.78rem',
                        borderBottom: '1px solid #D4AF37',
                        paddingBottom: '1px'
                      }}
                    >
                      {m.linkText || 'Open Workspace'} <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {m.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(sug)}
                      disabled={loading}
                      style={{
                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.25)',
                        color: '#D4AF37',
                        padding: '4px 9px',
                        borderRadius: '12px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.08)')}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: '14px 16px',
          backgroundColor: '#1E0D14',
          borderTop: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about reviews, vault stock, margins, tasks..."
            disabled={loading}
            maxLength={500}
            style={{
              flex: 1,
              backgroundColor: '#14080D',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={{
              backgroundColor: input.trim() ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)',
              color: input.trim() ? '#1A0A0E' : 'rgba(251, 249, 245, 0.4)',
              border: 'none',
              borderRadius: '4px',
              padding: '0 14px',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </form>
        <div style={{ fontSize: '0.66rem', color: 'rgba(251, 249, 245, 0.45)', marginTop: '6px', textAlign: 'center' }}>
          Strict RBAC Scoping • Mutations Prohibited in Natural Language • Max 500 characters
        </div>
      </div>
    </div>
  );
}
