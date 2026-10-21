import { NextResponse } from 'next/server';
import { generateRecurringTasks } from '../../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../../lib/server/auth.js';
import { assertPermission } from '../../../../../lib/server/permissions.js';

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    assertPermission(user, 'task:create');

    const body = await request.json().catch(() => ({}));
    const asOfDate = body.asOfDate || undefined;

    const result = generateRecurringTasks({ asOfDate });
    return NextResponse.json(result);
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
