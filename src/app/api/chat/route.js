import { NextResponse } from 'next/server';
import { processConciergeQuery } from '../../../lib/server/ai-adapter';

/**
 * Chatbot API Endpoint — Node 2
 *
 * Implements server-side rate-limiting and adapter boundary.
 * Never exposes server keys to the client.
 */
export async function POST(request) {
  try {
    const body = await request.json();
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

    const result = await processConciergeQuery({ message, sessionId });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'The concierge service encountered an error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
