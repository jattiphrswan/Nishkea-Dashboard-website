import { NextResponse } from 'next/server';
import { registerCustomerAccount, CUSTOMER_COOKIE_NAME } from '../../../../lib/server/customer-auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await registerCustomerAccount({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      address: body.address
    });

    const response = NextResponse.json({ success: true, customer: result.customer }, { status: 201 });
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
    const status = err.message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
