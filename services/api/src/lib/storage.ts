import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface UploadOptions {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
  userId?: string;
}

export interface StoredMediaInfo {
  id: string;
  storageKey: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export class MediaStorageService {
  private localUploadDir: string;
  private publicBaseUrl: string;

  constructor() {
    this.localUploadDir = path.resolve(process.cwd(), 'uploads');
    this.publicBaseUrl = process.env.S3_PUBLIC_URL || 'http://localhost:4000/uploads';

    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }
  }

  public validateFile(mimeType: string, sizeBytes: number): { valid: boolean; reason?: string } {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/webm',
      'audio/ogg',
      'audio/mp3',
    ];

    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    if (!allowedMimeTypes.includes(mimeType)) {
      return { valid: false, reason: `Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WEBP, GIF, WEBM, OGG, MP3.` };
    }

    if (sizeBytes > MAX_SIZE) {
      return { valid: false, reason: `File size (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 10MB.` };
    }

    return { valid: true };
  }

  public async saveMedia(options: UploadOptions): Promise<StoredMediaInfo> {
    const validation = this.validateFile(options.mimeType, options.buffer.length);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    const fileExt = path.extname(options.fileName) || '.bin';
    const storageKey = `${crypto.randomUUID()}${fileExt}`;
    const destinationPath = path.join(this.localUploadDir, storageKey);

    await fs.promises.writeFile(destinationPath, options.buffer);

    return {
      id: crypto.randomUUID(),
      storageKey,
      url: `${this.publicBaseUrl}/${storageKey}`,
      fileName: options.fileName,
      mimeType: options.mimeType,
      sizeBytes: options.buffer.length,
    };
  }
}

export const mediaStorage = new MediaStorageService();
