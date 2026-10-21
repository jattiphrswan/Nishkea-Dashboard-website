import { NextResponse } from 'next/server';
import { getCustomerById } from '../../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';

export async function GET(request, { params }) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { id } = await params;
    const customer = getCustomerById(id, { user });
    return NextResponse.json({ success: true, customer });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.code === 'FORBIDDEN' ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
