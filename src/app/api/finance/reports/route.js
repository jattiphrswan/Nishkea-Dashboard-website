import { NextResponse } from 'next/server';
import { getBusinessPerformanceReports } from '../../../../lib/server/finance.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const reports = await getBusinessPerformanceReports({ user });
    return NextResponse.json(reports);
  } catch (err) {
    const status = err.message.includes('Access Denied') ? 403 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
