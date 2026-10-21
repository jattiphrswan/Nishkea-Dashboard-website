import { NextResponse } from 'next/server';
import { getLeadById, updateLeadStage } from '../../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const lead = getLeadById(id, { user });
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.code === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const body = await request.json();

    const result = await updateLeadStage(id, {
      stage: body.stage,
      lostReason: body.lostReason,
      note: body.note,
      nextFollowUpDate: body.nextFollowUpDate,
      user
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
