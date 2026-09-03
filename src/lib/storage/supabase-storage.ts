import { createClient } from "../supabase/client";

export const ALLOWED_CAMPAIGN_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const ALLOWED_VOTER_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const MAX_STORAGE_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export interface UploadOptions {
  bucket: "campaign-files" | "voter-files";
  path: string; // e.g. "{client_id}/{category}/{unique_filename}" or "{client_id}/{unique_filename}"
  file: File | Blob;
  contentType: string;
}

/**
 * Direct Supabase Storage operations with multi-tenant isolation
 */
export class SupabaseStorageProvider {
  /**
   * Upload file to private Supabase bucket
   */
  public async upload(options: UploadOptions): Promise<{ data: any; error: any }> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(options.path, options.file, {
          contentType: options.contentType,
          upsert: true,
        });

      return { data, error };
    } catch (err: any) {
      console.error(`Supabase Storage upload error [${options.bucket}/${options.path}]:`, err);
      return { data: null, error: err };
    }
  }

  /**
   * Create secure time-limited Signed URL for a private storage object
   * Default expiration: 3600 seconds (1 hour)
   */
  public async createSignedUrl(
    bucket: "campaign-files" | "voter-files",
    path: string,
    expiresInSeconds: number = 3600
  ): Promise<{ signedUrl: string | null; error: any }> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresInSeconds);

      if (error || !data?.signedUrl) {
        return { signedUrl: null, error };
      }
      return { signedUrl: data.signedUrl, error: null };
    } catch (err: any) {
      console.error(`Supabase Storage signed URL error [${bucket}/${path}]:`, err);
      return { signedUrl: null, error: err };
    }
  }

  /**
   * Delete object from private Supabase bucket
   */
  public async delete(
    bucket: "campaign-files" | "voter-files",
    paths: string[]
  ): Promise<{ data: any; error: any }> {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage.from(bucket).remove(paths);
      return { data, error };
    } catch (err: any) {
      console.error(`Supabase Storage delete error [${bucket}]:`, err);
      return { data: null, error: err };
    }
  }
}

export const supabaseStorage = new SupabaseStorageProvider();

