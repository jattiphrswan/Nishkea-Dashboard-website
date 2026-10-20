import { NextResponse } from 'next/server';
import { inspectAndResolveReturn } from '../../../../../lib/server/orders.js';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await inspectAndResolveReturn({
      orderId: id,
      returnId: body.returnId,
      disposition: body.disposition || 'SELLABLE_RESTOCK',
      inspectorNotes: body.inspectorNotes || '',
      actorId: body.actorId || 'usr-warehouse-01'
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
