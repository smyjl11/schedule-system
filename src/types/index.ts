// ========================================
// 全局类型定义
// ========================================

export type UserRole = 'employee' | 'admin';
export type ScheduleStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface User {
  id: number;
  username: string;
  name: string;
  department: string;
  role: UserRole;
}

export interface Schedule {
  id: number;
  userId: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
  // 关联查询字段
  userName?: string;
  userDepartment?: string;
}

export interface ScheduleFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
}

export interface AuthPayload {
  userId: number;
  username: string;
  role: UserRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
