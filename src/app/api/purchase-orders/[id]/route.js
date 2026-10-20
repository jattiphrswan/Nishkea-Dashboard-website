import { NextResponse } from 'next/server';
import { getPurchaseOrderById } from '../../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const po = getPurchaseOrderById(id, { user });

    if (!po) {
      return NextResponse.json({ success: false, error: `Purchase order '${id}' not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true, purchaseOrder: po });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
