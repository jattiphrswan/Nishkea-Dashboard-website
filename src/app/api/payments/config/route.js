import { NextResponse } from 'next/server';
import { getPublicPaymentConfig } from '../../../../lib/server/payments.js';

export async function GET() {
  try {
    const config = getPublicPaymentConfig();
    return NextResponse.json({ success: true, config }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
