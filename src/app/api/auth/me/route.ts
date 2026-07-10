// ========================================
// GET /api/auth/me - 获取当前用户信息
// ========================================
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { queryOne } from '@/lib/db';

export async function GET() {
  const payload = getCurrentUser();
  if (!payload) {
    return NextResponse.json(
      { success: false, message: '未登录' },
      { status: 401 }
    );
  }

  const user = queryOne<{
    id: number;
    username: string;
    name: string;
    department: string;
    role: string;
  }>('SELECT id, username, name, department, role FROM users WHERE id = ?', [
    payload.userId,
  ]);

  if (!user) {
    return NextResponse.json(
      { success: false, message: '用户不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: user });
}
