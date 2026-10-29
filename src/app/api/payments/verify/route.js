import { NextResponse } from 'next/server';
import { confirmOrderPayment } from '../../../../lib/server/payments.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      gatewayOrderId,
      gatewayPaymentId,
      signature,
      paymentMethod,
      provider
    } = body;

    if (!orderNumber || !gatewayOrderId || !gatewayPaymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required signature verification fields (orderNumber, gatewayOrderId, gatewayPaymentId, signature)'
        },
        { status: 400 }
      );
    }

    const result = await confirmOrderPayment({
      orderNumber,
      gatewayOrderId,
      gatewayPaymentId,
      signature,
      paymentMethod,
      provider
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status = error.statusCode || 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
