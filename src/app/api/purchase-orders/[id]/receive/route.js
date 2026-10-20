import { NextResponse } from 'next/server';
import { receivePurchaseOrderShipment } from '../../../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function POST(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const body = await request.json();

    const result = await receivePurchaseOrderShipment({
      poId: id,
      items: body.items,
      batchReference: body.batchReference,
      receivedDate: body.receivedDate,
      actorId: user?.id || 'staff_inventory',
      user
    });

    return NextResponse.json(result);
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status: statusCode });
  }
}
