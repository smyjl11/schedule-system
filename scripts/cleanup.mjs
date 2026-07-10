// ========================================
// 清理运行残余文件
// 用途：删除 .next/ 构建缓存 和 SQLite 残留文件
// ========================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const targets = [
  // Next.js 构建缓存
  { type: 'dir',  name: '.next',          path: path.join(root, '.next') },
  // SQLite WAL 模式残留文件
  { type: 'file', name: 'schedule.db-shm', path: path.join(root, 'db', 'schedule.db-shm') },
  { type: 'file', name: 'schedule.db-wal', path: path.join(root, 'db', 'schedule.db-wal') },
];

let cleaned = 0;

for (const target of targets) {
  try {
    if (target.type === 'dir') {
      if (fs.existsSync(target.path)) {
        fs.rmSync(target.path, { recursive: true, force: true });
        cleaned++;
        console.log(`  [删除] ${target.name}/`);
      }
    } else {
      if (fs.existsSync(target.path)) {
        fs.unlinkSync(target.path);
        cleaned++;
        console.log(`  [删除] ${target.name}`);
      }
    }
  } catch (err) {
    console.error(`  [失败] ${target.name}: ${err.message}`);
  }
}

if (cleaned === 0) {
  console.log('  (无残留文件)');
} else {
  console.log(`\n共清理 ${cleaned} 项残留`);
}
