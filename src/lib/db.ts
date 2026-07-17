// ========================================
// SQLite 数据库连接封装（单例，缓存编译语句）
// ========================================
import { DatabaseSync } from 'node:sqlite';
import type { SQLInputValue } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

type BindParams = unknown[] | Record<string, unknown>;

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'db', 'schedule.db');
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    // 启动时将 WAL 已提交数据合并回主库，确保主库为最新状态，降低丢失风险
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  }
  return db;
}

/** 关闭数据库连接，触发 WAL checkpoint 并清理 .db-shm / .db-wal 残留 */
export function closeDb(): void {
  if (db) {
    try {
      // PRAGMA wal_checkpoint(TRUNCATE) 将 WAL 数据写回主库并删除 WAL 文件
      db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    } catch { /* 忽略 checkpoint 错误 */ }
    try {
      db.close();
    } catch { /* 忽略关闭错误 */ }
    db = null;
  }
}

/**
 * 启动时清理残留的 SQLite 临时文件。
 * ⚠️ 仅在主库文件尚不存在（全新初始化）时才删除 WAL/SHM。
 * 若主库已存在，WAL 中可能仍保存着已提交但尚未 checkpoint 的数据，
 * 此时删除 WAL 会导致新建记录丢失（这也是重启后台后任务消失的根因）。
 */
function cleanupOrphanedDbFiles(): void {
  const dbDir = path.join(process.cwd(), 'db');
  const mainDbPath = path.join(dbDir, 'schedule.db');
  if (fs.existsSync(mainDbPath)) return; // 主库存在 → 保留 WAL，避免丢数据
  const residuals = ['schedule.db-shm', 'schedule.db-wal'];
  for (const file of residuals) {
    const filePath = path.join(dbDir, file);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch { /* 文件被占用则跳过 */ }
  }
}

// ========================================
// 优雅关闭：确保 Ctrl+C 时正确关闭数据库
// ========================================
let shuttingDown = false;

function gracefulShutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  closeDb();
  process.exit(0);
}

// 启动时清理上次的残留文件（安全网）
cleanupOrphanedDbFiles();

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
// Windows 下 Ctrl+C 有时触发 SIGBREAK
process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));

// node:sqlite 接受位置参数(展开数组)或单个命名参数对象
function bindParams(params: BindParams): SQLInputValue[] {
  return (Array.isArray(params) ? params : [params]) as SQLInputValue[];
}

/** 执行带参数的查询，返回数组 */
export function query<T = Record<string, unknown>>(
  sql: string,
  params: BindParams = []
): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...bindParams(params)) as T[];
}

/** 执行带参数查询，返回单条 */
export function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: BindParams = []
): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...bindParams(params)) as T | undefined;
}

/** 执行写操作（INSERT/UPDATE/DELETE），返回变更行数 */
export function execute(
  sql: string,
  params: BindParams = []
): { changes: number; lastInsertRowid: number | bigint } {
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...bindParams(params)) as unknown as {
    changes: number;
    lastInsertRowid: number | bigint;
  };
  return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
}
