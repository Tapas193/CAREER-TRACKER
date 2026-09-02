// Removes macOS (darwin) Prisma engine artifacts from local node_modules so the
// Vercel production bundle never ships `.dylib.node` engines. Runs inside the
// vercel.json buildCommand, AFTER `prisma generate`, so only the Linux engines
// (rhel-openssl-3.0.x / linux-arm64-openssl-3.0.x) get traced into the output.
//
// Safe to run repeatedly: deletes nothing but darwin-named / .dylib files, and
// restoring them later is just `npx prisma generate`.

import { rmSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const searchDirs = [
  'node_modules/.prisma/client',
  'node_modules/@prisma/engines',
  'node_modules/@prisma/client',
];

let removed = 0;

for (const dir of searchDirs) {
  const absolute = join(process.cwd(), dir);
  let entries;
  try {
    entries = readdirSync(absolute);
  } catch {
    continue;
  }

  for (const name of entries) {
    if (/darwin|\.dylib\.node$|\.dylib$/.test(name)) {
      const full = join(absolute, name);
      rmSync(full, { recursive: true, force: true });
      removed += 1;
      console.log(`[prisma-vercel-strip] removed ${dir}/${name}`);
    }
  }
}

console.log(`[prisma-vercel-strip] done (${removed} artifact(s) removed)`);