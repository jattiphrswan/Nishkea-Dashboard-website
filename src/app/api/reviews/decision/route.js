import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { checkPermission } from '../../../../lib/server/permissions';
import { recordReviewDecision } from '../../../../lib/server/reviews';

export async function POST(request) {
  const user = await getCurrentStaffSession();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff authentication required' },
      { status: 401 }
    );
  }

  const perm = checkPermission(user, 'review:decision');
  if (!perm.allowed) {
    return NextResponse.json(
      { error: 'Forbidden', reason: perm.reason },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { designCode, decision, reason, nextReviewDate } = body || {};

    const result = await recordReviewDecision({
      designCode,
      decision,
      reason,
      nextReviewDate,
      actor: user
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
