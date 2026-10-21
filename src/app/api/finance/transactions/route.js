import { NextResponse } from 'next/server';
import { getFinancialTransactionsList } from '../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const transactions = await getFinancialTransactionsList({ type, user });
    return NextResponse.json({ success: true, ...transactions });
  } catch (err) {
    const status = err.message.includes('Access Denied') ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
