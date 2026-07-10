// ========================================
// GET  /api/schedules       - 获取日程列表
// POST /api/schedules       - 创建日程
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import * as scheduleService from '@/lib/schedule-service';
import type { ScheduleStatus } from '@/types';

/** 获取日程列表（支持 ?range=week|month 和 ?userId=xxx 参数） */
export async function GET(request: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const rangeType = searchParams.get('range') || 'week';
  const targetUserId = searchParams.get('userId');

  // 计算日期范围
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (rangeType === 'month') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else {
    // week: 本周一到周日
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(now.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  const range = {
    start: start.toISOString().slice(0, 19).replace('T', ' '),
    end: end.toISOString().slice(0, 19).replace('T', ' '),
  };

  // 管理员可指定查看某人日程，普通员工只看自己的
  let queryUserId: number | undefined;
  if (user.role === 'admin' && targetUserId) {
    queryUserId = parseInt(targetUserId, 10);
  } else if (user.role !== 'admin') {
    queryUserId = user.userId;
  }

  const schedules = scheduleService.getSchedules(queryUserId, range);

  return NextResponse.json({ success: true, data: schedules });
}

/** 创建日程 */
export async function POST(request: NextRequest) {
  const user = getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: '请先登录' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, startTime, endTime, status } = body;

    // 输入校验
    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: '标题、开始时间、结束时间为必填项' },
        { status: 400 }
      );
    }

    const validStatuses: ScheduleStatus[] = [
      'pending',
      'in_progress',
      'completed',
      'cancelled',
    ];
    const finalStatus: ScheduleStatus = validStatuses.includes(status)
      ? status
      : 'pending';

    const schedule = scheduleService.createSchedule(user.userId, {
      title,
      description: description || '',
      startTime,
      endTime,
      status: finalStatus,
    });

    return NextResponse.json(
      { success: true, data: schedule },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
