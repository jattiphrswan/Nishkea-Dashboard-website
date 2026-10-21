import { NextResponse } from 'next/server';
import { getCurrentCustomer, getCustomerOrders } from '../../../../lib/server/customer-auth.js';

export async function GET(request) {
  try {
    const customer = await getCurrentCustomer(request);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const orders = getCustomerOrders(customer.email);
    return NextResponse.json({ success: true, orders, count: orders.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
