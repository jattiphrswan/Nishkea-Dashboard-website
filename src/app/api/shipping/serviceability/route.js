import { NextResponse } from 'next/server';
import { checkPincodeServiceability } from '../../../../lib/server/shipping.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { pincode, orderValueMinor = 0 } = body || {};

    if (!pincode) {
      return NextResponse.json({ success: false, error: 'Pincode is required' }, { status: 400 });
    }

    const result = await checkPincodeServiceability(pincode, { orderValueMinor });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode');
  const orderValue = searchParams.get('orderValue') || '0';

  if (!pincode) {
    return NextResponse.json({ success: false, error: 'Query param "pincode" is required' }, { status: 400 });
  }

  const result = await checkPincodeServiceability(pincode, { orderValueMinor: parseInt(orderValue, 10) });
  return NextResponse.json(result, { status: 200 });
}
