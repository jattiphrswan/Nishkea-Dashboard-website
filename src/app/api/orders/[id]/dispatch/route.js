import { NextResponse } from 'next/server';
import { dispatchOrder } from '../../../../../lib/server/orders.js';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const result = await dispatchOrder({
      orderId: id,
      carrier: body.carrier || 'BlueDart Express',
      trackingNumber: body.trackingNumber,
      actorId: body.actorId || 'staff_dispatch'
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
