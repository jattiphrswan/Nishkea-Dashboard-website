import { NextResponse } from 'next/server';
import { authenticateStaffCredentials, createStaffSession } from '../../../../lib/server/auth';
import { logAuditEvent } from '../../../../lib/server/permissions';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateStaffCredentials(email, password);

    if (!user) {
      await logAuditEvent({
        actorId: email,
        action: 'STAFF_LOGIN_FAILED',
        resourceType: 'AUTH',
        metadata: { reason: 'Invalid credentials or inactive account' }
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createStaffSession(user);

    await logAuditEvent({
      actorId: user.id,
      action: 'STAFF_LOGIN_SUCCESS',
      resourceType: 'AUTH',
      metadata: { roleId: user.roleId }
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'nishkea_staff_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: 'Login service encountered an unexpected error' },
      { status: 500 }
    );
  }
}
