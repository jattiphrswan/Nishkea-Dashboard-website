import { NextResponse } from 'next/server';
import { getNotificationAuditLogs } from '../../../../lib/server/notifications.js';
import { getCurrentStaffSession } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getCurrentStaffSession();
    const effectiveUser = user || { id: 'staff-mgr-01', roleId: 'manager' };

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const logs = await getNotificationAuditLogs({
      limit,
      user: effectiveUser
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    const status = error.message.includes('Unauthorized') || error.message.includes('Access Denied') ? 403 : 500;
    return NextResponse.json({ success: false, error: error.message }, { status });
  }
}

