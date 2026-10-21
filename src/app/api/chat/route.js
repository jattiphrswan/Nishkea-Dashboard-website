import { NextResponse } from 'next/server';
import { processConciergeQuery } from '../../../lib/server/ai-assistant.js';

/**
 * Grounded Public AI Assistant Endpoint — Node 13
 *
 * Implements:
 * - Server-side rate limiting per session / IP
 * - Input sanitization & 500-char request bounding
 * - Identity-aware order lookup with session cookie validation
 * - Non-leaking error responses with non-AI escalation path
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { message, sessionId } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid query message is required' },
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message exceeds maximum allowable length (500 chars)' },
        { status: 400 }
      );
    }

    // Determine client identifier for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const effectiveSessionId = sessionId || `ip-${ip.trim()}`;

    const result = await processConciergeQuery({
      message,
      sessionId: effectiveSessionId,
      request
    });

    const status = result.rateLimited ? 429 : 200;

    return NextResponse.json(result, {
      status,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'The concierge service encountered a temporary error. Please try again or reach out directly to our atelier.',
        fallbackUrl: '/contact',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
