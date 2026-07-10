// ========================================
// 数据库初始化脚本
// 用法: node scripts/init-db.mjs
// ========================================
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbDir = join(__dirname, '..', 'db');
const dbPath = join(dbDir, 'schedule.db');

// 确保 db 目录存在
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

console.log(`[init-db] 创建数据库: ${dbPath}`);

const db = new DatabaseSync(dbPath);

// 开启 WAL 模式提升并发性能
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// 执行建表 SQL
const schemaSQL = readFileSync(join(dbDir, 'schema.sql'), 'utf-8');
db.exec(schemaSQL);

console.log('[init-db] ✅ 数据库初始化完成');
db.close();
