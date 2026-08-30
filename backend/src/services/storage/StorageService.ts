export interface StorageService {
  save(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
    path?: string;
  }): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}
