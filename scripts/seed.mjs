// ========================================
// 种子数据脚本
// 用法: node scripts/seed.mjs
// ========================================
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, '..', 'db', 'schedule.db');

if (!existsSync(dbPath)) {
  console.error('[seed] ❌ 数据库不存在，请先运行 npm run db:init');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

// 先清除旧的种子日程数据，避免多次执行 seed 导致重复
console.log('[seed] 清除旧日程数据...');
db.exec('DELETE FROM schedules');
// 重置自增 ID（SQLite 中 DELETE 后重新整理 sqlite_sequence）
db.exec("DELETE FROM sqlite_sequence WHERE name = 'schedules'");
console.log('[seed] 旧数据已清除');

const seedSQL = readFileSync(join(__dirname, '..', 'db', 'seed.sql'), 'utf-8');
db.exec(seedSQL);

console.log('[seed] ✅ 种子数据写入完成');
console.log('[seed]   管理员: admin / 123456');
console.log('[seed]   员工:   zhangsan, lisi, wangwu / 123456');

db.close();
