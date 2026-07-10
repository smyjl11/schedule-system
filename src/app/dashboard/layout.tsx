'use client';
// ========================================
// 仪表盘布局：顶栏 + 导航 + 内容
// ========================================
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface UserInfo {
  id: number;
  name: string;
  department: string;
  role: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.data);
        } else {
          router.push('/');
        }
      })
      .catch(() => router.push('/'));
  }, [router]);

  const handleLogout = async () => {
    document.cookie = 'schedule_token=; path=/; max-age=0';
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const isAdmin = user.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶栏 */}
      <header className="sticky top-0 z-30 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-900">
              📅 员工日程管理
            </h1>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  pathname === '/dashboard'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                我的日程
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    pathname === '/admin'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  全员日程
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {user.name} · {user.department}
              {isAdmin && (
                <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                  管理员
                </span>
              )}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 内容区 */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
