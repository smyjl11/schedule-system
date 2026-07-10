'use client';
// ========================================
// 月视图日历组件
// ========================================
import type { Schedule } from '@/types';

interface Props {
  year: number;
  month: number; // 0-based
  schedules: Schedule[];
  onDateClick: (dateStr: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-200 text-yellow-800',
  in_progress: 'bg-blue-100 border-blue-200 text-blue-800',
  completed: 'bg-green-100 border-green-200 text-green-800',
  cancelled: 'bg-red-100 border-red-200 text-red-800 line-through',
};

export default function MonthCalendar({
  year,
  month,
  schedules,
  onDateClick,
  onScheduleClick,
}: Props) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  // 当月第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 第一天是周几（周一=0）
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  // 生成所有需要显示的日期（含前后月份填充）
  const days: (Date | null)[] = [];

  // 上月填充
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }

  // 当月日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // 补齐最后一行
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  /** 获取某日的日程 */
  const getSchedulesForDate = (date: Date): Schedule[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return schedules.filter((s) => s.startTime.slice(0, 10) === dateStr);
  };

  return (
    <div>
      {/* 表头 */}
      <div className="calendar-grid mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2 text-center text-xs font-medium text-gray-500">
            {label}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div className="calendar-grid border-t border-l border-gray-200 rounded-lg overflow-hidden">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="min-h-[100px] border-r border-b border-gray-100 bg-gray-50" />;
          }

          const dateStr = date.toISOString().slice(0, 10);
          const isToday = dateStr === todayStr;
          const isCurrentMonth = date.getMonth() === month;
          const daySchedules = getSchedulesForDate(date);

          return (
            <div
              key={dateStr}
              className={`min-h-[100px] border-r border-b border-gray-200 p-1.5 transition hover:bg-blue-50/30 cursor-pointer ${
                isToday ? 'bg-primary-50/40' : ''
              } ${!isCurrentMonth ? 'bg-gray-50 opacity-50' : ''}`}
              onClick={() => onDateClick(dateStr)}
            >
              <div
                className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {daySchedules.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleClick(s);
                    }}
                    className={`truncate rounded border px-1.5 py-0.5 text-xs cursor-pointer hover:shadow ${
                      STATUS_COLORS[s.status] || 'bg-gray-100'
                    }`}
                    title={`${s.title} (${s.startTime.slice(11, 16)})`}
                  >
                    {s.title}
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-400 pl-1">
                    +{daySchedules.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
