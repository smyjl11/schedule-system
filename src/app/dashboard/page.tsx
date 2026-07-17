'use client';
// ========================================
// 员工仪表盘 - 日程视图
// ========================================
import { useState, useEffect, useCallback } from 'react';
import WeekCalendar from '@/components/Calendar/WeekCalendar';
import MonthCalendar from '@/components/Calendar/MonthCalendar';
import ScheduleModal from '@/components/Schedule/ScheduleModal';
import type { Schedule, ScheduleFormData } from '@/types';

type ViewMode = 'week' | 'month';

export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  // 周视图当前周偏移
  const [weekOffset, setWeekOffset] = useState(0);
  // 月视图年月
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  /** 把 Date 格式化为本地 YYYY-MM-DD（避免 toISOString 的 UTC 偏移） */
  const toLocalDateStr = (d: Date): string =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  /** 加载日程数据 */
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      // 计算当前视图锚定日期：周视图取所显示周的周一，月视图取当月 1 号
      let anchorStr: string;
      if (viewMode === 'week') {
        const d = new Date();
        d.setDate(d.getDate() + weekOffset * 7);
        const day = d.getDay();
        const monday = new Date(d);
        monday.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
        anchorStr = toLocalDateStr(monday);
      } else {
        anchorStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-01`;
      }
      const res = await fetch(`/api/schedules?range=${viewMode}&date=${anchorStr}`);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data);
      }
    } catch (err) {
      console.error('加载日程失败', err);
    } finally {
      setLoading(false);
    }
  }, [viewMode, weekOffset, viewYear, viewMonth]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  /** 计算当前视图显示的日期 */
  const getCurrentViewDate = (): Date => {
    const d = new Date();
    if (viewMode === 'week') {
      d.setDate(d.getDate() + weekOffset * 7);
    } else {
      d.setFullYear(viewYear, viewMonth);
    }
    return d;
  };

  /** 点击日历空白格 → 新建 */
  const handleDateClick = (dateStr: string) => {
    setEditingSchedule(null);
    setDefaultDate(dateStr);
    setModalOpen(true);
  };

  /** 点击日程 → 编辑 */
  const handleScheduleClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setDefaultDate('');
    setModalOpen(true);
  };

  /** 新建日程按钮 */
  const handleCreate = () => {
    setEditingSchedule(null);
    setDefaultDate(new Date().toISOString().slice(0, 10));
    setModalOpen(true);
  };

  /** 保存日程 */
  const handleSave = async (data: ScheduleFormData) => {
    const url = editingSchedule
      ? `/api/schedules/${editingSchedule.id}`
      : '/api/schedules';
    const method = editingSchedule ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || '保存失败');
    }

    await fetchSchedules();
  };

  /** 删除日程 */
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.message || '删除失败');
    }
    await fetchSchedules();
  };

  /** 导航：上周/下周 */
  const navigate = (direction: -1 | 1 | 0) => {
    if (viewMode === 'week') {
      setWeekOffset((prev) => (direction === 0 ? 0 : prev + direction));
    } else if (direction === 0) {
      const now = new Date();
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    } else {
      let newMonth = viewMonth + direction;
      let newYear = viewYear;
      if (newMonth < 0) { newMonth = 11; newYear--; }
      if (newMonth > 11) { newMonth = 0; newYear++; }
      setViewYear(newYear);
      setViewMonth(newMonth);
    }
  };

  /** 格式化当前视图标题 */
  const getViewTitle = (): string => {
    const d = getCurrentViewDate();
    if (viewMode === 'week') {
      const day = d.getDay();
      const mondayOff = day === 0 ? -6 : 1 - day;
      const monday = new Date(d);
      monday.setDate(d.getDate() + mondayOff);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return `${monday.getMonth() + 1}月${monday.getDate()}日 - ${sunday.getMonth() + 1}月${sunday.getDate()}日`;
    }
    return `${d.getFullYear()}年${d.getMonth() + 1}月`;
  };

  return (
    <div>
      {/* 工具栏 */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* 视图切换 */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('week')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                viewMode === 'week'
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              周视图
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                viewMode === 'month'
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              月视图
            </button>
          </div>

          {/* 导航 */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-gray-700 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <span
              className="min-w-[140px] text-center text-sm font-semibold text-gray-800 cursor-pointer hover:text-primary-600"
              onClick={() => navigate(0)}
            >
              {getViewTitle()}
            </span>
            <button
              onClick={() => navigate(1)}
              className="rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-gray-700 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {schedules.length} 个日程
          </span>
          <button
            onClick={handleCreate}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700 transition flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
            新建日程
          </button>
        </div>
      </div>

      {/* 日历区域 */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : viewMode === 'week' ? (
          <WeekCalendar
            currentDate={getCurrentViewDate()}
            schedules={schedules}
            onDateClick={handleDateClick}
            onScheduleClick={handleScheduleClick}
          />
        ) : (
          <MonthCalendar
            year={viewYear}
            month={viewMonth}
            schedules={schedules}
            onDateClick={handleDateClick}
            onScheduleClick={handleScheduleClick}
          />
        )}
      </div>

      {/* 日程弹窗 */}
      <ScheduleModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSchedule(null); }}
        onSave={handleSave}
        onDelete={editingSchedule ? handleDelete : undefined}
        schedule={editingSchedule}
        defaultDate={defaultDate}
      />
    </div>
  );
}
