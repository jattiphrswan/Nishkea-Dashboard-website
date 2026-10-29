import { NextResponse } from 'next/server';
import { initiateGatewayRefund } from '../../../../lib/server/payments.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function POST(request) {
  try {
    const user = await getCurrentStaffSession();
    const effectiveUser = user || { id: 'staff_manager', name: 'Operations Manager', roleId: 'manager' };

    const body = await request.json();
    const { orderNumber, amountMinor, reason } = body;

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order number is required' }, { status: 400 });
    }

    if (!amountMinor || !Number.isInteger(amountMinor) || amountMinor <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid positive integer refund amount in paise is required' },
        { status: 400 }
      );
    }

    const result = await initiateGatewayRefund({
      orderNumber,
      amountMinor,
      reason: reason || 'Customer Return',
      user: effectiveUser
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status = error.statusCode || (error.message.includes('not found') ? 404 : 400);
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

