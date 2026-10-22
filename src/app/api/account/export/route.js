import { NextResponse } from 'next/server';
import { getCurrentCustomer, exportCustomerData } from '../../../../lib/server/customer-auth.js';

/**
 * Customer Data Privacy & GDPR Export Endpoint — Node 15
 *
 * Implements:
 * - Client authentication check via session cookie
 * - Returns redacted, comprehensive client record for data portability
 */
export async function GET(request) {
  try {
    const customer = await getCurrentCustomer(request);

    if (!customer) {
      return NextResponse.json(
        { error: 'Authentication required. No active customer session identified.' },
        { status: 401 }
      );
    }

    const data = await exportCustomerData(customer.id);

    return NextResponse.json(
      { success: true, ...data },
      {
        status: 200,
        headers: {
          'Content-Disposition': `attachment; filename="nishkea-client-data-${customer.id}.json"`,
          'Cache-Control': 'no-store'
        }
      }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
