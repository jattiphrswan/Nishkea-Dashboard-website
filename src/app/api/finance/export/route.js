import { NextResponse } from 'next/server';
import { generateReconciliationCSV } from '../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const csvContent = generateReconciliationCSV({ user });

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nishkea_finance_reconciliation_${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (err) {
    const status = err.message.includes('Access Denied') ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
