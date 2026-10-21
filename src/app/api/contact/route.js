import { NextResponse } from 'next/server';
import { submitContactInquiry } from '../../../lib/server/customer-auth.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await submitContactInquiry({
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      inquiryType: body.inquiryType,
      preferredLocation: body.preferredLocation,
      message: body.message
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
