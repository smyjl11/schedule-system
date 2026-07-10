// ========================================
// GET    /api/schedules/:id  - 获取日程详情
// PUT    /api/schedules/:id  - 更新日程
// DELETE /api/schedules/:id  - 删除日程
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as scheduleService from '@/lib/schedule-service';

interface RouteParams {
  params: { id: string };
}

/** 获取单条日程 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, message: '无效的日程ID' },
      { status: 400 }
    );
  }

  const schedule = scheduleService.getScheduleById(id);
  if (!schedule) {
    return NextResponse.json(
      { success: false, message: '日程不存在' },
      { status: 404 }
    );
  }

  // 权限校验：管理员可查看所有，员工只能看自己的
  if (user.role !== 'admin' && schedule.userId !== user.userId) {
    return NextResponse.json(
      { success: false, message: '无权限访问' },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, data: schedule });
}

/** 更新日程 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, message: '无效的日程ID' },
      { status: 400 }
    );
  }

  // 权限校验
  if (user.role !== 'admin' && !scheduleService.isScheduleOwner(id, user.userId)) {
    return NextResponse.json(
      { success: false, message: '无权限修改此日程' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const updateData: Record<string, string> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.startTime !== undefined) updateData.startTime = body.startTime;
    if (body.endTime !== undefined) updateData.endTime = body.endTime;
    if (body.status !== undefined) updateData.status = body.status;

    const schedule = scheduleService.updateSchedule(id, updateData as any);

    if (!schedule) {
      return NextResponse.json(
        { success: false, message: '日程不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch {
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/** 删除日程 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    );
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json(
      { success: false, message: '无效的日程ID' },
      { status: 400 }
    );
  }

  // 权限校验
  if (user.role !== 'admin' && !scheduleService.isScheduleOwner(id, user.userId)) {
    return NextResponse.json(
      { success: false, message: '无权限删除此日程' },
      { status: 403 }
    );
  }

  const deleted = scheduleService.deleteSchedule(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, message: '日程不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: '删除成功' });
}
