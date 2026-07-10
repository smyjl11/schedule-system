// ========================================
// JWT 认证工具
// ========================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import type { AuthPayload, User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'schedule-system-secret-key-2026';
const TOKEN_NAME = 'schedule_token';

/** 生成 JWT Token */
export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** 验证 JWT Token */
export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

/** 密码哈希 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/** 密码验证 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** 从 Cookie 中获取当前登录用户 */
export function getCurrentUser(): AuthPayload | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** 校验当前请求是否为管理员（路由守卫） */
export function requireAdmin(): { user: AuthPayload } | { error: string; status: number } {
  const user = getCurrentUser();
  if (!user) {
    return { error: '请先登录', status: 401 };
  }
  if (user.role !== 'admin') {
    return { error: '无权限访问', status: 403 };
  }
  return { user };
}

/** Token Cookie 名称（供前端读取/写入） */
export { TOKEN_NAME };
