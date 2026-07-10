import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '员工日程管理系统',
  description: '企业内部日程管理与协作平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
