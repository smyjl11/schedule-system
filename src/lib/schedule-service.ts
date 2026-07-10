// ========================================
// 日程业务逻辑层（Service Layer）
// ========================================
import { query, queryOne, execute } from '@/lib/db';
import type { Schedule, ScheduleFormData } from '@/types';

/** 获取用户的日程列表（可选日期范围过滤） */
export function getSchedules(
  userId?: number,
  range?: { start: string; end: string }
): Schedule[] {
  let sql = `
    SELECT s.id, s.user_id as userId, s.title, s.description,
           s.start_time as startTime, s.end_time as endTime, s.status,
           s.created_at as createdAt, s.updated_at as updatedAt,
           u.name as userName, u.department as userDepartment
    FROM schedules s
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (userId) {
    sql += ' AND s.user_id = ?';
    params.push(userId);
  }

  if (range) {
    sql += ' AND s.start_time >= ? AND s.end_time <= ?';
    params.push(range.start, range.end);
  }

  sql += ' ORDER BY s.start_time ASC';

  return query<Schedule>(sql, params);
}

/** 获取单条日程详情 */
export function getScheduleById(id: number): Schedule | undefined {
  return queryOne<Schedule>(
    `SELECT s.id, s.user_id as userId, s.title, s.description,
            s.start_time as startTime, s.end_time as endTime, s.status,
            s.created_at as createdAt, s.updated_at as updatedAt,
            u.name as userName, u.department as userDepartment
     FROM schedules s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?`,
    [id]
  );
}

/** 创建日程 */
export function createSchedule(
  userId: number,
  data: ScheduleFormData
): Schedule | undefined {
  const result = execute(
    `INSERT INTO schedules (user_id, title, description, start_time, end_time, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, data.title, data.description, data.startTime, data.endTime, data.status]
  );

  return getScheduleById(Number(result.lastInsertRowid));
}

/** 更新日程 */
export function updateSchedule(
  id: number,
  data: Partial<ScheduleFormData>
): Schedule | undefined {
  const fields: string[] = [];
  const params: unknown[] = [];

  if (data.title !== undefined) {
    fields.push('title = ?');
    params.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    params.push(data.description);
  }
  if (data.startTime !== undefined) {
    fields.push('start_time = ?');
    params.push(data.startTime);
  }
  if (data.endTime !== undefined) {
    fields.push('end_time = ?');
    params.push(data.endTime);
  }
  if (data.status !== undefined) {
    fields.push('status = ?');
    params.push(data.status);
  }

  if (fields.length === 0) return getScheduleById(id);

  fields.push("updated_at = datetime('now', 'localtime')");
  params.push(id);

  execute(`UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`, params);

  return getScheduleById(id);
}

/** 删除日程 */
export function deleteSchedule(id: number): boolean {
  const result = execute('DELETE FROM schedules WHERE id = ?', [id]);
  return result.changes > 0;
}

/** 校验日程是否属于某个用户 */
export function isScheduleOwner(scheduleId: number, userId: number): boolean {
  const schedule = queryOne<{ user_id: number }>(
    'SELECT user_id FROM schedules WHERE id = ?',
    [scheduleId]
  );
  return schedule?.user_id === userId;
}
