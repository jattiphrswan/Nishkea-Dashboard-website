import { NextResponse } from 'next/server';
import { getOrderByRef } from '../../../../lib/server/orders.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = getOrderByRef(id);

    if (!order) {
      return NextResponse.json({ success: false, error: `Order '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
