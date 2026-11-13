import { NextResponse } from 'next/server';
import { scheduleReversePickup } from '../../../../lib/server/shipping.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function POST(request) {
  try {
    const user = await getCurrentStaffSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, returnId, pickupAddress = {}, preferredDate = null } = body || {};

    if (!orderId || !returnId) {
      return NextResponse.json({ success: false, error: 'orderId and returnId are required' }, { status: 400 });
    }

    const result = await scheduleReversePickup({
      orderId,
      returnId,
      pickupAddress,
      preferredDate,
      actor: { roleId: user.roleId, id: user.id }
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status = error.message.includes('Access Denied') ? 403 : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}
