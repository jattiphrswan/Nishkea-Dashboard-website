import { NextResponse } from 'next/server';
import { getFinancialSummary } from '../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const summary = await getFinancialSummary({ user });
    return NextResponse.json(summary);
  } catch (err) {
    const status = err.message.includes('Access Denied') ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
