import { NextResponse } from 'next/server';
import { recordCustomerPayment } from '../../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await recordCustomerPayment({
      orderId: body.orderId,
      amountMinor: body.amountMinor,
      paymentMethod: body.paymentMethod,
      gatewayTxnId: body.gatewayTxnId,
      paymentType: body.paymentType,
      notes: body.notes,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.message.includes('Unauthorized') || err.message.includes('Access Denied') ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
