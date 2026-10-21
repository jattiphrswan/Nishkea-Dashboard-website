import { NextResponse } from 'next/server';
import { processCustomerRefund } from '../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await processCustomerRefund({
      orderId: body.orderId,
      amountMinor: body.amountMinor,
      reason: body.reason,
      refundMethod: body.refundMethod,
      gatewayRefundId: body.gatewayRefundId,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.message.includes('Unauthorized') || err.message.includes('Access Denied') ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
