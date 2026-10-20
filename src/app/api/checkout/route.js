import { NextResponse } from 'next/server';
import { createOrder } from '../../../lib/server/orders.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const idempotencyKey = request.headers.get('x-idempotency-key') || body.idempotencyKey;

    const result = await createOrder({
      customer: body.customer,
      shippingAddress: body.shippingAddress,
      items: body.items,
      paymentMethod: body.paymentMethod || 'RAZORPAY_UPI',
      idempotencyKey,
      actorId: 'guest_storefront'
    });

    return NextResponse.json(
      {
        success: true,
        order: result.order,
        idempotentReplay: !!result.idempotentReplay,
        message: 'Order created with atomic stock reservation hold'
      },
      { status: result.idempotentReplay ? 200 : 201 }
    );
  } catch (err) {
    const status = err.statusCode || (err.message.includes('Insufficient available') ? 409 : 400);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        availableUnits: err.availableUnits !== undefined ? err.availableUnits : undefined
      },
      { status }
    );
  }
}
