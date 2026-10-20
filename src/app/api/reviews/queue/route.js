import { NextResponse } from 'next/server';
import { getCurrentStaffSession } from '../../../../lib/server/auth';
import { getReviewQueue, getReviewTasks, evaluateReviewQueue } from '../../../../lib/server/reviews';

export async function GET() {
  const user = await getCurrentStaffSession();

  // Run evaluation to make sure due items are flagged
  evaluateReviewQueue();

  const queue = getReviewQueue();
  const tasks = getReviewTasks();

  return NextResponse.json({
    success: true,
    userRole: user?.roleId || 'anonymous',
    totalReviews: queue.length,
    underReviewCount: queue.filter((i) => i.status === 'under_review').length,
    queue,
    tasks
  });
}
