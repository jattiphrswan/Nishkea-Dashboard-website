import { NextResponse } from 'next/server';
import { getTasksList, createTask, updateTask } from '../../../../lib/server/crm.js';
import { getAuthenticatedStaff } from '../../../../lib/server/auth.js';

export async function GET(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const priority = searchParams.get('priority') || undefined;
    const assigneeId = searchParams.get('assigneeId') || undefined;

    const tasks = getTasksList({ user, status, priority, assigneeId });
    return NextResponse.json({ success: true, tasks, count: tasks.length });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();

    const result = await createTask({
      title: body.title,
      priority: body.priority,
      status: body.status,
      assignedTo: body.assignedTo,
      assignedToUserId: body.assignedToUserId,
      dueDate: body.dueDate,
      linkedRecord: body.linkedRecord,
      recurrence: body.recurrence,
      user
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const status = err.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedStaff(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required for updates.' }, { status: 400 });
    }

    const result = await updateTask(id, updates, { user });
    return NextResponse.json(result);
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : err.code === 'FORBIDDEN' ? 403 : 400;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}
