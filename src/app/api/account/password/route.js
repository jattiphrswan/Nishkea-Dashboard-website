import { NextResponse } from 'next/server';
import { getCurrentCustomer, updateCustomerPassword } from '../../../../lib/server/customer-auth.js';

export async function PUT(request) {
  try {
    const customer = await getCurrentCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const result = await updateCustomerPassword(customer.id, {
      currentPassword: body.currentPassword,
      newPassword: body.newPassword
    });

    return NextResponse.json(result);
  } catch (err) {
    const status = err.message.includes('Current password does not match') ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
