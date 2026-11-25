import path from 'path';
import os from 'os';
import fs from 'fs';

export function getUploadDir(subfolder?: string): string {
  const baseDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'sipp-storage', 'uploads')
    : path.join(process.cwd(), 'storage', 'uploads');

  const targetDir = subfolder ? path.join(baseDir, subfolder) : baseDir;
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

export function findStoredFile(applicationId: string, filename: string): string | null {
  const safeFilename = path.basename(filename);
  const candidatePaths = [
    path.join(process.cwd(), 'storage', 'uploads', applicationId, safeFilename),
    path.join(os.tmpdir(), 'sipp-storage', 'uploads', applicationId, safeFilename),
    path.join(process.cwd(), 'storage', 'uploads', safeFilename),
    path.join(os.tmpdir(), 'sipp-storage', 'uploads', safeFilename),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      return p;
    }
  }
  return null;
}
