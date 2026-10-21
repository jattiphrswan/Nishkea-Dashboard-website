import { NextResponse } from 'next/server';
import { getCurrentCustomer, updateCustomerProfile } from '../../../../lib/server/customer-auth.js';

export async function GET(request) {
  try {
    const customer = await getCurrentCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    return NextResponse.json({ success: true, customer });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const customer = await getCurrentCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateCustomerProfile(customer.id, body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
