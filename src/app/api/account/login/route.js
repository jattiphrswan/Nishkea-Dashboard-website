import { NextResponse } from 'next/server';
import { authenticateCustomer, CUSTOMER_COOKIE_NAME } from '../../../../lib/server/customer-auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await authenticateCustomer(body.email, body.password);

    const response = NextResponse.json({ success: true, customer: result.customer });
    response.cookies.set({
      name: CUSTOMER_COOKIE_NAME,
      value: result.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return response;
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 401 });
  }
}
