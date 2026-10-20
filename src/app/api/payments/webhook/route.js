import { NextResponse } from 'next/server';
import { handlePaymentWebhook, verifyWebhookSignature, CHECKOUT_CONFIG } from '../../../../lib/server/orders.js';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-signature') || request.headers.get('x-razorpay-signature');

    // Signature verification (when signature header is supplied)
    if (signature) {
      const isValid = verifyWebhookSignature({ rawBody, signature, secret: CHECKOUT_CONFIG.webhookSecret });
      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Unauthorized: Invalid signature' }, { status: 401 });
      }
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventId = parsedPayload.event_id || parsedPayload.eventId || parsedPayload.id;
    const eventType = parsedPayload.event_type || parsedPayload.event || parsedPayload.type;
    const data = parsedPayload.data || parsedPayload.payload || parsedPayload;

    const result = await handlePaymentWebhook({
      eventId,
      eventType,
      payload: data,
      signature,
      rawBody
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    const status = err.statusCode || (err.message.includes('not found') ? 404 : 400);
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
