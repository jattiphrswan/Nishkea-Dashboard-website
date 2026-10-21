import { NextResponse } from 'next/server';
import { getLeadsList, createLead } from '../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const segment = searchParams.get('segment') || undefined;
    const ownerId = searchParams.get('ownerId') || undefined;

    const { leads, metrics } = getLeadsList({ user, stage, segment, ownerId });
    return NextResponse.json({ success: true, leads, metrics, count: leads.length });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await createLead({
      title: body.title,
      customerId: body.customerId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      segment: body.segment,
      leadSource: body.leadSource,
      estimatedValueMinor: body.estimatedValueMinor,
      ownerId: body.ownerId,
      ownerName: body.ownerName,
      nextFollowUpDate: body.nextFollowUpDate,
      notes: body.notes,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
