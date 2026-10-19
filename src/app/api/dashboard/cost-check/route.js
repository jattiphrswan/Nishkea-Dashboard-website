import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { checkPermission, logAuditEvent } from '../../../../lib/server/permissions';

/**
 * Restricted Supplier Cost Inspection API
 * Completion gate test for Node 3: Demonstrates enforced server-side authorization
 * and denied-access tests for roles that lack 'cost:view'.
 */
export async function GET() {
  const user = await getCurrentStaffSession();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff authentication required' },
      { status: 401 }
    );
  }

  const permResult = checkPermission(user, 'cost:view');

  if (!permResult.allowed) {
    // Record security audit event
    await logAuditEvent({
      actorId: user.id,
      action: 'SECURITY_ACCESS_DENIED',
      resourceType: 'FINANCIAL_COST_RECORDS',
      metadata: {
        attemptedPermission: 'cost:view',
        userRole: user.roleId,
        reason: permResult.reason
      }
    });

    return NextResponse.json(
      {
        error: 'Forbidden',
        reason: permResult.reason,
        role: user.roleId
      },
      { status: 403 }
    );
  }

  // Permitted staff receive cost data
  return NextResponse.json({
    status: 'authorized',
    role: user.roleId,
    sampleCostLedger: [
      { sku: 'NSK-EAR-001-GLD', unitCostMinor: 85000, currency: 'INR', batch: 'BAT-202610-01' },
      { sku: 'NSK-RNG-002-SZ7', unitCostMinor: 62000, currency: 'INR', batch: 'BAT-202606-12' },
      { sku: 'NSK-NCK-003-BUR', unitCostMinor: 110000, currency: 'INR', batch: 'BAT-202609-08' }
    ]
  });
}
