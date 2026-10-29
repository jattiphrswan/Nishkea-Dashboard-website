import { NextResponse } from 'next/server';
import { createPaymentOrder } from '../../../../lib/server/payments.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { orderNumber, amountMinor, currency, customer, notes, provider } = body;

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number is required' }, { status: 400 });
    }

    if (!amountMinor || !Number.isInteger(amountMinor) || amountMinor <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive integer amountMinor in paise is required' },
        { status: 400 }
      );
    }

    const orderData = await createPaymentOrder({
      orderNumber,
      amountMinor,
      currency,
      customer,
      notes,
      provider
    });

    return NextResponse.json(orderData, { status: 200 });
  } catch (error) {
    const status = error.statusCode || (error.message.includes('not found') ? 404 : 400);
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

