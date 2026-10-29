import { NextResponse } from 'next/server';
import { sendNotification, renderWhatsAppMessage, renderHtmlEmail } from '../../../../lib/server/notifications.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('template') || 'ORDER_CONFIRMED';
    const format = searchParams.get('format') || 'json';

    const sampleData = {
      customerName: 'Gayatri Devi',
      orderNumber: 'NSK-2026-9042',
      items: [
        { name: 'Aurelia Filigree Chandelier Drops', variant: 'Antique Gold', quantity: 1, lineTotalMinor: 249900 },
        { name: 'Celeste Marquise Solitaire Band', variant: 'Rhodium Silver (US 7)', quantity: 1, lineTotalMinor: 189900 }
      ],
      totalMinor: 439800,
      subtotalMinor: 439800,
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      addressLine1: '402, Sea Green Apartments, Worli',
      carrier: 'BlueDart Express',
      trackingNumber: 'BLUEDART-NSK-9948201',
      trackingUrl: 'http://localhost:3000/account?tracking=BLUEDART-NSK-9948201',
      salonLocation: 'Colaba, Mumbai Flagship',
      scheduledDate: 'Saturday, 14 November 2026',
      scheduledTime: '15:00 IST'
    };

    if (format === 'html') {
      const html = renderHtmlEmail(templateId, sampleData);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const whatsAppPreview = renderWhatsAppMessage(templateId, sampleData);
    const htmlEmailPreview = renderHtmlEmail(templateId, sampleData);

    return NextResponse.json({
      status: 'success',
      templateId,
      notice: 'Open /api/notifications/test?format=html to view full rendered luxury HTML email in your browser.',
      previews: {
        whatsapp: whatsAppPreview,
        emailHtmlLength: htmlEmailPreview.length,
        emailHtmlSnippet: htmlEmailPreview.substring(0, 300) + '...'
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentStaffSession();
    if (user && user.roleId === 'sales_support') {
      return NextResponse.json({ success: false, error: 'Unauthorized to trigger test notifications' }, { status: 403 });
    }

    const body = await request.json();
    const { templateId = 'ORDER_CONFIRMED', channel = 'preview', recipient = {} } = body;

    const sampleData = {
      customerName: recipient.name || 'Priya Sundaram',
      orderNumber: 'NSK-2026-TEST',
      items: [
        { name: 'Aurelia Filigree Chandelier Drops', variant: 'Antique Gold', quantity: 1, lineTotalMinor: 249900 },
        { name: 'Celeste Marquise Solitaire Band', variant: 'Rhodium Silver (US 7)', quantity: 1, lineTotalMinor: 189900 }
      ],
      totalMinor: 439800,
      subtotalMinor: 439800,
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      addressLine1: '402, Sea Green Apartments, Worli',
      carrier: 'BlueDart Express',
      trackingNumber: 'BLUEDART-NSK-9948201',
      trackingUrl: 'http://localhost:3000/account?tracking=BLUEDART-NSK-9948201',
      salonLocation: 'Colaba, Mumbai Flagship',
      scheduledDate: 'Saturday, 14 November 2026',
      scheduledTime: '15:00 IST'
    };

    if (channel === 'preview_whatsapp') {
      const text = renderWhatsAppMessage(templateId, sampleData);
      return NextResponse.json({ success: true, channel: 'whatsapp', preview: text });
    }

    if (channel === 'preview_email') {
      const html = renderHtmlEmail(templateId, sampleData);
      return NextResponse.json({ success: true, channel: 'email', htmlPreview: html });
    }

    const result = await sendNotification({
      recipient: {
        name: sampleData.customerName,
        phone: recipient.phone || '+91 98765 43210',
        email: recipient.email || 'client@example.com'
      },
      templateId,
      data: sampleData,
      channels: ['whatsapp', 'email'],
      idempotencyKey: `test-${Date.now()}`
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
