'use client';
// ========================================
// 日程弹窗：创建 / 编辑 / 查看
// ========================================
import { useState, useEffect } from 'react';
import type { Schedule, ScheduleFormData, ScheduleStatus } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ScheduleFormData) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  schedule?: Schedule | null;
  /** 新建时默认的日期字符串 yyyy-MM-dd */
  defaultDate?: string;
}

const STATUS_OPTIONS: { value: ScheduleStatus; label: string; color: string }[] = [
  { value: 'pending', label: '待开始', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-100 text-blue-700' },
  { value: 'completed', label: '已完成', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-700' },
];

export default function ScheduleModal({
  open,
  onClose,
  onSave,
  onDelete,
  schedule,
  defaultDate,
}: Props) {
  const isEdit = !!schedule;
  const [form, setForm] = useState<ScheduleFormData>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (schedule) {
      setForm({
        title: schedule.title,
        description: schedule.description,
        startTime: schedule.startTime.replace(' ', 'T').slice(0, 16),
        endTime: schedule.endTime.replace(' ', 'T').slice(0, 16),
        status: schedule.status,
      });
    } else if (defaultDate) {
      setForm({
        title: '',
        description: '',
        startTime: `${defaultDate}T09:00`,
        endTime: `${defaultDate}T10:00`,
        status: 'pending',
      });
    }
  }, [schedule, defaultDate, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('请输入日程标题');
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError('请选择开始和结束时间');
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    setLoading(true);
    try {
      // 将 datetime-local 格式转为服务器期望格式
      const payload = {
        ...form,
        startTime: form.startTime.replace('T', ' ') + ':00',
        endTime: form.endTime.replace('T', ' ') + ':00',
      };
      await onSave(payload);
      onClose();
    } catch {
      setError('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!schedule || !onDelete) return;
    if (!confirm('确定要删除这个日程吗？')) return;
    setLoading(true);
    try {
      await onDelete(schedule.id);
      onClose();
    } catch {
      setError('删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗卡片 */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <h2 className="mb-5 text-lg font-semibold text-gray-900">
          {isEdit ? '编辑日程' : '新建日程'}
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="如：项目评审会议"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              placeholder="日程详细描述（可选）"
            />
          </div>

          {/* 时间 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始 *</label>
              <input
                type="datetime-local"
                required
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束 *</label>
              <input
                type="datetime-local"
                required
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* 状态 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: opt.value })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    form.status === opt.value
                      ? `${opt.color} ring-2 ring-offset-1 ring-current`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  删除
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
