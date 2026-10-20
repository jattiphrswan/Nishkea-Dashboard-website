import { NextResponse } from 'next/server';
import { returnPurchaseOrderItems } from '../../../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function POST(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const body = await request.json();

    const result = await returnPurchaseOrderItems({
      poId: id,
      items: body.items,
      reason: body.reason,
      notes: body.notes,
      actorId: user?.id || 'staff_inventory',
      user
    });

    return NextResponse.json(result);
  } catch (err) {
    const statusCode = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status: statusCode });
  }
}
