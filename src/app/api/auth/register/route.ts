// ========================================
// POST /api/auth/register - 用户注册
// ========================================
import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import type { UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { username, password, name, department } = await request.json();

    // 输入校验
    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: '用户名、密码、姓名为必填项' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 检查用户名唯一性
    const existing = queryOne<{ id: number }>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existing) {
      return NextResponse.json(
        { success: false, message: '用户名已存在' },
        { status: 409 }
      );
    }

    // 创建用户
    const hashedPassword = await hashPassword(password);
    const result = execute(
      'INSERT INTO users (username, password, name, department, role) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, name, department || '', 'employee']
    );

    const user = queryOne<{ id: number; username: string; role: string }>(
      'SELECT id, username, role FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: '注册失败' },
        { status: 500 }
      );
    }

    // 签发 Token
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role as UserRole,
    });

    const response = NextResponse.json({ success: true, data: { user, token } });
    response.cookies.set('schedule_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[register] error:', error);
    return NextResponse.json(
      { success: false, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
