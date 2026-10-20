import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { checkPermission } from '../../../../lib/server/permissions';
import { createGoodsReceipt } from '../../../../lib/server/inventory';

export async function POST(request) {
  const user = await getCurrentStaffSession();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff authentication required' },
      { status: 401 }
    );
  }

  const perm = checkPermission(user, 'inventory:receive');
  if (!perm.allowed) {
    return NextResponse.json(
      { error: 'Forbidden', reason: perm.reason },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const result = await createGoodsReceipt({
      ...body,
      actorId: user.id
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
