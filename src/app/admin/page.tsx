'use client';
// ========================================
// 管理员面板 - 查看全员日程
// ========================================
import { useState, useEffect, useCallback } from 'react';
import ScheduleModal from '@/components/Schedule/ScheduleModal';
import type { Schedule, ScheduleFormData } from '@/types';

export default function AdminPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [rangeType, setRangeType] = useState<'week' | 'month'>('week');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [users, setUsers] = useState<{ id: number; name: string; department: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  /** 加载日程数据 */
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ range: rangeType });
      if (selectedUserId) params.set('userId', selectedUserId);
      const res = await fetch(`/api/schedules?${params}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error('加载日程失败', err);
    } finally {
      setLoading(false);
    }
  }, [rangeType, selectedUserId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  /** 加载用户列表 */
  useEffect(() => {
    fetch('/api/schedules?range=month')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const userMap = new Map<number, { id: number; name: string; department: string }>();
          (data.data as Schedule[]).forEach((s) => {
            if (!userMap.has(s.userId)) {
              userMap.set(s.userId, {
                id: s.userId,
                name: s.userName || `用户${s.userId}`,
                department: s.userDepartment || '',
              });
            }
          });
          setUsers(Array.from(userMap.values()));
        }
      })
      .catch(console.error);
  }, []);

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const handleSave = async (data: ScheduleFormData) => {
    if (!editingSchedule) return;
    const res = await fetch(`/api/schedules/${editingSchedule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || '保存失败');
    await fetchSchedules();
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || '删除失败');
    await fetchSchedules();
  };

  const STATUS_LABELS: Record<string, { label: string; className: string }> = {
    pending: { label: '待开始', className: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
    completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
    cancelled: { label: '已取消', className: 'bg-red-100 text-red-700' },
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">全员日程总览</h2>
        <p className="mt-1 text-sm text-gray-500">管理所有员工的日程安排</p>
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-white p-3 shadow-sm border">
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          <button
            onClick={() => setRangeType('week')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              rangeType === 'week' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setRangeType('month')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              rangeType === 'month' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            本月
          </button>
        </div>

        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">全部员工</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.department})
            </option>
          ))}
        </select>

        <span className="text-sm text-gray-400 ml-auto">
          共 {schedules.length} 条日程
        </span>
      </div>

      {/* 日程列表 */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : schedules.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center shadow-sm border">
          <p className="text-gray-400">暂无日程数据</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((schedule) => {
            const statusInfo = STATUS_LABELS[schedule.status] || STATUS_LABELS.pending;
            return (
              <div
                key={schedule.id}
                className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 transition hover:shadow-md cursor-pointer"
                onClick={() => handleEdit(schedule)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {schedule.title}
                    </h3>
                    {schedule.description && (
                      <p className="mt-0.5 text-sm text-gray-500 truncate">
                        {schedule.description}
                      </p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span>
                        📅 {schedule.startTime.slice(0, 16)} ~ {schedule.endTime.slice(0, 16)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.className}`}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {schedule.userName || `用户${schedule.userId}`}
                      {schedule.userDepartment && ` · ${schedule.userDepartment}`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 编辑弹窗 */}
      <ScheduleModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSchedule(null); }}
        onSave={handleSave}
        onDelete={editingSchedule ? handleDelete : undefined}
        schedule={editingSchedule}
      />
    </div>
  );
}
