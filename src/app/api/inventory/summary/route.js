import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { calculateStockAgeing, getAllBatches, getRecentMovements } from '../../../../lib/server/inventory';

export async function GET() {
  const user = await getCurrentStaffSession();
  const ageing = calculateStockAgeing();
  const batches = getAllBatches(user);
  const movements = getRecentMovements(15);

  return NextResponse.json({
    success: true,
    userRole: user?.roleId || 'anonymous',
    ageing,
    batches,
    movements
  });
}
