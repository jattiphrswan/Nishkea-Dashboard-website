import { NextResponse } from 'next/server';
import { getCustomersList, createCustomer } from '../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment') || undefined;
    const search = searchParams.get('search') || undefined;

    const customers = getCustomersList({ user, segment, search });
    return NextResponse.json({ success: true, customers, count: customers.length });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await createCustomer({
      name: body.name,
      email: body.email,
      phone: body.phone,
      segment: body.segment,
      companyName: body.companyName,
      gstNumber: body.gstNumber,
      marketingConsent: body.marketingConsent,
      notes: body.notes,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
