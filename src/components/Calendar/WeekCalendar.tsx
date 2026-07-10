'use client';
// ========================================
// 周视图日历组件
// ========================================
import type { Schedule } from '@/types';

interface Props {
  currentDate: Date;
  schedules: Schedule[];
  onDateClick: (dateStr: string) => void;
  onScheduleClick: (schedule: Schedule) => void;
}

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 ~ 19:00

/** 状态颜色映射 */
const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  in_progress: 'bg-blue-100 border-blue-300 text-blue-800',
  completed: 'bg-green-100 border-green-300 text-green-800',
  cancelled: 'bg-red-100 border-red-300 text-red-800 line-through',
};

export default function WeekCalendar({
  currentDate,
  schedules,
  onDateClick,
  onScheduleClick,
}: Props) {
  // 计算本周一的日期
  const day = currentDate.getDay();
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() + (day === 0 ? -6 : 1 - day));

  // 生成本周7天的日期对象
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  /** 获取某天某个小时的日程 */
  const getSchedulesForHour = (date: Date, hour: number): Schedule[] => {
    const dateStr = date.toISOString().slice(0, 10);
    return schedules.filter((s) => {
      const sDate = s.startTime.slice(0, 10);
      const sHour = parseInt(s.startTime.slice(11, 13), 10);
      return sDate === dateStr && sHour === hour;
    });
  };

  return (
    <div className="overflow-x-auto">
      {/* 周标题行 */}
      <div className="calendar-grid mb-1">
        <div className="w-16 flex-shrink-0" />
        {weekDays.map((d) => (
          <div
            key={d.toISOString()}
            className={`cursor-pointer rounded-lg px-2 py-2 text-center transition hover:bg-gray-100 ${
              d.toISOString().slice(0, 10) === todayStr ? 'bg-primary-50' : ''
            }`}
            onClick={() => onDateClick(d.toISOString().slice(0, 10))}
          >
            <div className="text-xs text-gray-500">{WEEKDAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>
            <div className={`text-lg font-semibold ${
              d.toISOString().slice(0, 10) === todayStr ? 'text-primary-600' : 'text-gray-800'
            }`}>
              {d.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* 时间网格 */}
      <div className="space-y-px">
        {HOURS.map((hour) => (
          <div key={hour} className="calendar-grid min-h-[60px] rounded-lg hover:bg-gray-50/50">
            {/* 时间标签 */}
            <div className="w-16 flex-shrink-0 py-1 pr-2 text-right text-xs text-gray-400">
              {String(hour).padStart(2, '0')}:00
            </div>
            {/* 7天列 */}
            {weekDays.map((d) => {
              const hourSchedules = getSchedulesForHour(d, hour);
              return (
                <div
                  key={`${d.toISOString()}-${hour}`}
                  className={`relative border-l border-gray-100 px-1 py-0.5 ${
                    d.toISOString().slice(0, 10) === todayStr ? 'bg-primary-50/30' : ''
                  }`}
                >
                  {hourSchedules.map((s) => (
                    <div
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScheduleClick(s);
                      }}
                      className={`mb-0.5 cursor-pointer rounded border px-1.5 py-0.5 text-xs transition hover:shadow ${
                        STATUS_COLORS[s.status] || 'bg-gray-100'
                      }`}
                      title={`${s.title}\n${s.startTime.slice(11, 16)} - ${s.endTime.slice(11, 16)}`}
                    >
                      <div className="truncate font-medium">{s.title}</div>
                      <div className="text-[10px] opacity-60">
                        {s.startTime.slice(11, 16)}-{s.endTime.slice(11, 16)}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
