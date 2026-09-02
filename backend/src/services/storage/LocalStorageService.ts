import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { StorageService } from './StorageService';
import { uploadsDir, config } from '../../config';

export class LocalStorageService implements StorageService {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = uploadsDir;
    this.baseUrl = `${config.storageBaseUrl}/${config.storageLocalDir}`;
    if (!fs.existsSync(this.baseDir)) {
      try {
        fs.mkdirSync(this.baseDir, { recursive: true });
      } catch {
        // In read-only environments (e.g. Vercel Lambda) the directory cannot
        // be created.  The app still starts; file-upload endpoints will fail
        // at runtime with a write error, which is expected.
      }
    }
  }

  async save(file: { originalname: string; mimetype: string; size: number; buffer: Buffer; path?: string }): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.originalname) || '.bin';
    const id = crypto.randomBytes(16).toString('hex');
    const key = `${id}${ext}`;
    const dest = path.join(this.baseDir, key);

    if (file.buffer && file.buffer.length > 0) {
      await fs.promises.writeFile(dest, file.buffer);
    } else if (file.path) {
      await fs.promises.rename(file.path, dest);
    } else {
      throw new Error('No file content to save');
    }

    return { url: this.getUrl(key), key };
  }

  async delete(key: string): Promise<void> {
    const dest = path.join(this.baseDir, path.basename(key));
    if (fs.existsSync(dest)) {
      await fs.promises.unlink(dest);
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${path.basename(key)}`;
  }
}
