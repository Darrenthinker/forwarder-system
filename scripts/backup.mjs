import { existsSync, mkdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "prisma", "dev.db");
const backupDir = join(root, "backups");

if (!existsSync(src)) {
  console.error(`数据库文件不存在: ${src}`);
  process.exit(1);
}

if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

const ts = new Date()
  .toISOString()
  .replace(/[:T.]/g, "-")
  .slice(0, 19);
const dest = join(backupDir, `dev-${ts}.db`);

copyFileSync(src, dest);
console.log(`✓ 备份完成: ${dest}`);
