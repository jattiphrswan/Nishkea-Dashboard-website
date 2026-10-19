import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { logAuditEvent } from '../../../../lib/server/permissions';

export async function POST() {
  const user = await getCurrentStaffSession();

  if (user) {
    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_LOGOUT',
      resourceType: 'AUTH',
      metadata: { roleId: user.roleId }
    });
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  response.cookies.set({
    name: 'nishkea_staff_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });

  return response;
}
