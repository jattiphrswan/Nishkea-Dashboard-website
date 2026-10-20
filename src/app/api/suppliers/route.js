import { NextResponse } from 'next/server';
import { getSuppliersList } from '../../../lib/server/suppliers.js';
import { getAuthenticatedStaff } from '../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const suppliers = getSuppliersList({ user });
    return NextResponse.json({ success: true, suppliers, count: suppliers.length });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
