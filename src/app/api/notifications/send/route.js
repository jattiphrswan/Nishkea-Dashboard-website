import { NextResponse } from 'next/server';
import { sendNotification } from '../../../../lib/server/notifications.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { recipient, templateId, data, channels, idempotencyKey } = body;

    if (!templateId) {
      return NextResponse.json({ success: false, error: 'templateId is required' }, { status: 400 });
    }

    if (!recipient || (!recipient.phone && !recipient.email)) {
      return NextResponse.json(
        { success: false, error: 'Recipient must contain at least a valid phone number or email address' },
        { status: 400 }
      );
    }

    const result = await sendNotification({
      recipient,
      templateId,
      data: data || {},
      channels: channels || ['whatsapp', 'email'],
      idempotencyKey,
      actorId: 'api_client'
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
