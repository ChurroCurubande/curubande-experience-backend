import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

@Injectable()
export class UploadsService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = this.config.get<string>('SUPABASE_BUCKET') ?? 'uploads';

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorios para subir archivos.',
      );
    }

    const apiUrl = this.normalizeSupabaseUrl(url);
    this.supabase = createClient(apiUrl, key);
  }

  private normalizeSupabaseUrl(url: string): string {
    const trimmed = url.trim();
    const match = trimmed.match(
      /supabase\.com\/dashboard\/project\/([a-zA-Z0-9]+)/,
    );
    if (match) {
      return `https://${match[1]}.supabase.co`;
    }
    return trimmed;
  }

  /**
   * Sube un archivo al bucket en {prefix}/{folder}/{nombre único}.
   */
  async uploadFile(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    prefix: string = 'documents',
    folder: string = 'general',
  ): Promise<string> {
    if (!ALLOWED_MIMES.includes(mimeType)) {
      throw new InternalServerErrorException(
        `Tipo de archivo no permitido. Permitidos: PDF, JPEG, PNG, WebP.`,
      );
    }
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new InternalServerErrorException(
        `El archivo no debe superar ${MAX_FILE_SIZE / 1024 / 1024} MB.`,
      );
    }

    const ext = this.getExtension(originalFilename, mimeType);
    const safeName = `${Date.now()}-${this.sanitizeFilename(originalFilename)}${ext}`;
    const path = `${prefix}/${folder}/${safeName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .upload(path, fileBuffer, { contentType: mimeType, upsert: false });

    if (error) {
      console.error('[UploadsService] Supabase upload error:', error);
      throw new InternalServerErrorException(
        `No se pudo subir el archivo: ${error.message}`,
      );
    }

    return data.path;
  }

  getPublicUrl(pathOrUrl: string): string {
    if (!pathOrUrl || pathOrUrl.startsWith('http')) return pathOrUrl;
    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(pathOrUrl);
    return data.publicUrl;
  }

  private getExtension(filename: string, mimeType: string): string {
    const fromMime: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    if (fromMime[mimeType]) return fromMime[mimeType];
    const match = filename.match(/\.[a-zA-Z0-9]+$/);
    return match ? match[0].toLowerCase() : '.bin';
  }

  private sanitizeFilename(name: string): string {
    return (
      name
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80) || 'file'
    );
  }
}
