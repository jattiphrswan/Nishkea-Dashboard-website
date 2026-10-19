import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { ROLE_PERMISSIONS } from '../../../../lib/server/permissions';

export async function GET() {
  const user = await getCurrentStaffSession();

  if (!user) {
    return NextResponse.json(
      { authenticated: false, message: 'No active staff session' },
      { status: 401 }
    );
  }

  const permissions = ROLE_PERMISSIONS[user.roleId] || [];

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions
    }
  });
}
