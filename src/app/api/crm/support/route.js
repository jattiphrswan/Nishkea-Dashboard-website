import { NextResponse } from 'next/server';
import {
  getSupportTicketsList,
  createSupportTicket,
  resolveSupportTicket
} from '../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;

    const tickets = getSupportTicketsList({ user, status, category });
    return NextResponse.json({ success: true, tickets, count: tickets.length });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    if (body.action === 'resolve') {
      const result = await resolveSupportTicket(body.id, {
        resolution: body.resolution,
        user
      });
      return NextResponse.json(result);
    }

    const result = await createSupportTicket({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      subject: body.subject,
      priority: body.priority,
      category: body.category,
      linkedOrderNumber: body.linkedOrderNumber,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
