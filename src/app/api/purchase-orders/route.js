import { NextResponse } from 'next/server';
import { getPurchaseOrdersList, createPurchaseOrder } from '../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const supplierId = searchParams.get('supplierId') || undefined;

    const purchaseOrders = getPurchaseOrdersList({ user, status, supplierId });
    return NextResponse.json({ success: true, purchaseOrders, count: purchaseOrders.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await createPurchaseOrder({
      supplierId: body.supplierId,
      lines: body.lines,
      expectedDeliveryDate: body.expectedDeliveryDate,
      notes: body.notes,
      actorId: user?.id || 'staff_procurement',
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
