import { NextResponse } from 'next/server';
import { getOrdersList } from '../../../lib/server/orders.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const fulfillmentStatus = searchParams.get('fulfillmentStatus') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const orders = getOrdersList({ limit, paymentStatus, fulfillmentStatus });
    return NextResponse.json({ success: true, orders, count: orders.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
