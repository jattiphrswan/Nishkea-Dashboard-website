import { NextResponse } from 'next/server';
import { processStaffAssistantQuery } from '../../../../lib/server/staff-assistant.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

/**
 * Permission-Scoped Staff Assistant API Route — Node 14
 *
 * Implements:
 * - Server-side authentication check via getAuthenticatedStaff(request)
 * - Returns HTTP 401 if unauthenticated
 * - Role-scoped queries with cost and financial isolation
 * - Mutation rejection
 */
export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);

    if (!user || !user.roleId) {
      return NextResponse.json(
        {
          error: 'Authentication required. No active staff session identified.',
          loginUrl: '/dashboard/login'
        },
        { status: 401 }
      );
    }

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

    const result = await processStaffAssistantQuery({
      message,
      user,
      sessionId: sessionId || `staff-${user.id}`
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
        error: 'The staff assistant encountered an unexpected error.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}
