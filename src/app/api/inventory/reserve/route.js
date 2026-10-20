import { NextResponse } from 'next/server';
import { createReservation } from '../../../../lib/server/inventory';

export async function POST(request) {
  try {
    const body = await request.json();
    const { variantId, quantity, orderRef } = body || {};

    if (!variantId || !quantity) {
      return NextResponse.json(
        { error: 'variantId and quantity are required' },
        { status: 400 }
      );
    }

    const result = await createReservation({
      variantId,
      quantity,
      orderRef
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 409 });
  }
}
