import { NextResponse } from 'next/server';
import { approvePurchaseOrder } from '../../../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function POST(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const result = await approvePurchaseOrder({
      poId: id,
      user,
      approvalNotes: body.approvalNotes || 'Approved for procurement',
      actorId: user?.id || 'staff_approver'
    });

    return NextResponse.json(result);
  } catch (err) {
    const statusCode = err.statusCode || (err.message.includes('not found') ? 404 : 400);
    return NextResponse.json({ success: false, error: err.message }, { status: statusCode });
  }
}
