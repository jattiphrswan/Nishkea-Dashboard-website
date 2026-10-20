import { NextResponse } from 'next/server';
import { requestOrderReturn } from '../../../../../lib/server/orders.js';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await requestOrderReturn({
      orderId: id,
      items: body.items,
      reason: body.reason,
      customerNotes: body.customerNotes,
      actorId: body.actorId || 'customer'
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
