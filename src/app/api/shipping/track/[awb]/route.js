import { NextResponse } from 'next/server';
import { getShipmentTracking } from '../../../../../lib/server/shipping.js';

export async function GET(request, { params }) {
  try {
    const { awb } = await params;
    if (!awb) {
      return NextResponse.json({ success: false, error: 'AWB parameter is required' }, { status: 400 });
    }

    const tracking = await getShipmentTracking(awb);
    return NextResponse.json(tracking, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }
}
