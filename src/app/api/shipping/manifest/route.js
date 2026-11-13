import { NextResponse } from 'next/server';
import { manifestShipment, renderShippingLabelHtml } from '../../../../lib/server/shipping.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function POST(request) {
  try {
    const user = await getCurrentStaffSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, carrierId = 'BLUEDART', packageDetails = {} } = body || {};

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'orderId is required' }, { status: 400 });
    }

    const result = await manifestShipment({
      orderId,
      carrierId,
      packageDetails,
      actor: { roleId: user.roleId, id: user.id }
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const status = error.message.includes('Access Denied') ? 403 : 400;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

export async function GET(request) {
  try {
    const user = await getCurrentStaffSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const awb = searchParams.get('awb');
    const format = searchParams.get('format');

    if (!awb) {
      return NextResponse.json({ success: false, error: 'Query parameter "awb" is required' }, { status: 400 });
    }

    const { memoryConsignments } = await import('../../../../lib/server/shipping.js');
    const consignment = memoryConsignments.find((c) => c.awbNumber === awb);
    if (!consignment) {
      return NextResponse.json({ success: false, error: `Consignment with AWB '${awb}' not found` }, { status: 404 });
    }

    if (format === 'html') {
      const html = renderShippingLabelHtml(consignment);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return NextResponse.json({ success: true, consignment }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
