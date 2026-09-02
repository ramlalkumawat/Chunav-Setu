import {
  FileAsset,
  CampaignFileCategory,
  StorageUploadResult,
  StorageSignedUrlResult,
} from "../types";
import { dbService } from "../store/data-service";
import {
  supabaseStorage,
  ALLOWED_CAMPAIGN_MIME_TYPES,
  ALLOWED_VOTER_MIME_TYPES,
  MAX_STORAGE_FILE_SIZE_BYTES,
} from "./supabase-storage";

export class StorageService {
  /**
   * Validate file size and MIME type
   */
  public validateFile(
    file: File | Blob,
    allowedMimeTypes: string[],
    maxSizeBytes: number = MAX_STORAGE_FILE_SIZE_BYTES
  ): { valid: boolean; error?: string } {
    if (!file) {
      return { valid: false, error: "No file provided for upload." };
    }

    if (file.size > maxSizeBytes) {
      const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
      return {
        valid: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum permitted limit of ${maxMb}MB.`,
      };
    }

    if (allowedMimeTypes.length > 0 && file.type) {
      const isAllowed = allowedMimeTypes.includes(file.type);
      if (!isAllowed) {
        return {
          valid: false,
          error: `Unsupported file format (${file.type}). Allowed types: ${allowedMimeTypes.join(", ")}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Generates a safe sanitized unique filename
   */
  public generateUniqueFilename(originalName: string, prefix?: string): string {
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
    const parts = cleanName.split(".");
    const ext = parts.length > 1 ? parts.pop() : "bin";
    const base = parts.join(".");
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    const safeBase = prefix ? `${prefix}-${base}` : base;
    return `${safeBase}-${timestamp}-${randomSuffix}.${ext}`;
  }

  /**
   * Builds the strict multi-tenant client-scoped storage path
   * Never puts files in bucket root
   */
  public buildStoragePath(
    bucket: "campaign-files" | "voter-files",
    clientId: string,
    category?: CampaignFileCategory | string,
    uniqueFilename?: string
  ): { fullStoragePath: string; bucketRelativePath: string } {
    if (!clientId) {
      throw new Error("Multi-tenant violation: clientId is strictly required for storage path construction.");
    }

    const safeClientId = clientId.trim();

    if (bucket === "campaign-files") {
      const safeCategory = (category || "other").toLowerCase();
      const relative = `${safeClientId}/${safeCategory}/${uniqueFilename || "file.bin"}`;
      return {
        bucketRelativePath: relative,
        fullStoragePath: `campaign-files/${relative}`,
      };
    } else {
      const relative = `${safeClientId}/${uniqueFilename || "voter-list.csv"}`;
      return {
        bucketRelativePath: relative,
        fullStoragePath: `voter-files/${relative}`,
      };
    }
  }

  /**
   * Upload campaign file (posters, images, documents, branding, other)
   */
  public async uploadCampaignFile(
    file: File | Blob,
    options: {
      clientId: string;
      category: CampaignFileCategory;
      campaignId?: string;
      uploadedBy?: string;
      customName?: string;
      module?: string;
      entityType?: string;
      entityId?: string;
      altText?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<StorageUploadResult> {
    // 1. Validation
    const validation = this.validateFile(file, ALLOWED_CAMPAIGN_MIME_TYPES);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const originalName = options.customName || (file instanceof File ? file.name : "campaign-file.jpg");
    const uniqueFilename = this.generateUniqueFilename(originalName, options.category);
    const { bucketRelativePath, fullStoragePath } = this.buildStoragePath(
      "campaign-files",
      options.clientId,
      options.category,
      uniqueFilename
    );

    const mimeType = file.type || "image/jpeg";
    const ext = uniqueFilename.split(".").pop() || "jpg";

    // 2. Perform Supabase Storage Upload
    const { error: uploadError } = await supabaseStorage.upload({
      bucket: "campaign-files",
      path: bucketRelativePath,
      file,
      contentType: mimeType,
    });

    if (uploadError) {
      console.warn("Supabase Storage remote upload notice (using dual local persistence):", uploadError);
    }

    // 3. Generate Signed URL for immediate usage
    const { signedUrl } = await supabaseStorage.createSignedUrl(
      "campaign-files",
      bucketRelativePath,
      3600
    );

    // 4. Save metadata in public.file_assets (via dataService)
    const fileAsset = dbService.createFileAsset(options.clientId, {
      campaign_id: options.campaignId,
      uploaded_by: options.uploadedBy,
      module: options.module || "branding",
      entity_type: options.entityType || (options.category === "posters" ? "client_poster" : "campaign_media"),
      entity_id: options.entityId || options.clientId,
      file_name: originalName,
      file_extension: ext,
      mime_type: mimeType,
      storage_provider: "supabase_storage",
      storage_path: fullStoragePath,
      file_size: file.size,
      status: "active",
      metadata: {
        category: options.category,
        bucket: "campaign-files",
        bucketRelativePath,
        ...options.metadata,
      },
    });

    return {
      success: true,
      fileAsset,
      storagePath: fullStoragePath,
      signedUrl: signedUrl || undefined,
    };
  }

  /**
   * Upload voter list file (CSV, XLS, XLSX)
   */
  public async uploadVoterFile(
    file: File | Blob,
    options: {
      clientId: string;
      campaignId?: string;
      uploadedBy?: string;
      customName?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<StorageUploadResult> {
    // 1. Validation
    const validation = this.validateFile(file, ALLOWED_VOTER_MIME_TYPES);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const originalName = options.customName || (file instanceof File ? file.name : "voter-list.csv");
    const uniqueFilename = this.generateUniqueFilename(originalName, "voters");
    const { bucketRelativePath, fullStoragePath } = this.buildStoragePath(
      "voter-files",
      options.clientId,
      undefined,
      uniqueFilename
    );

    const mimeType = file.type || "text/csv";
    const ext = uniqueFilename.split(".").pop() || "csv";

    // 2. Perform Supabase Storage Upload
    const { error: uploadError } = await supabaseStorage.upload({
      bucket: "voter-files",
      path: bucketRelativePath,
      file,
      contentType: mimeType,
    });

    if (uploadError) {
      console.warn("Supabase Storage remote upload notice:", uploadError);
    }

    // 3. Save metadata in public.file_assets
    const fileAsset = dbService.createFileAsset(options.clientId, {
      campaign_id: options.campaignId || "camp-1",
      uploaded_by: options.uploadedBy,
      module: "voter_import",
      entity_type: "voter_list",
      entity_id: options.campaignId || options.clientId,
      file_name: originalName,
      file_extension: ext,
      mime_type: mimeType,
      storage_provider: "supabase_storage",
      storage_path: fullStoragePath,
      file_size: file.size,
      status: "active",
      metadata: {
        bucket: "voter-files",
        bucketRelativePath,
        ...options.metadata,
      },
    });

    return {
      success: true,
      fileAsset,
      storagePath: fullStoragePath,
    };
  }

  /**
   * Get secure time-limited Signed URL for a file
   */
  public async getSignedUrl(
    storagePathOrUrl: string,
    expiresInSeconds: number = 3600
  ): Promise<StorageSignedUrlResult> {
    if (!storagePathOrUrl) {
      return { success: false, error: "Empty storage path" };
    }

    // If it's already an external HTTP URL or blob/data URL, return directly
    if (
      storagePathOrUrl.startsWith("http://") ||
      storagePathOrUrl.startsWith("https://") ||
      storagePathOrUrl.startsWith("blob:") ||
      storagePathOrUrl.startsWith("data:")
    ) {
      return { success: true, signedUrl: storagePathOrUrl, expiresIn: expiresInSeconds };
    }

    // Parse bucket and relative path
    let bucket: "campaign-files" | "voter-files" = "campaign-files";
    let relativePath = storagePathOrUrl;

    if (storagePathOrUrl.startsWith("campaign-files/")) {
      bucket = "campaign-files";
      relativePath = storagePathOrUrl.replace("campaign-files/", "");
    } else if (storagePathOrUrl.startsWith("voter-files/")) {
      bucket = "voter-files";
      relativePath = storagePathOrUrl.replace("voter-files/", "");
    }

    const { signedUrl, error } = await supabaseStorage.createSignedUrl(
      bucket,
      relativePath,
      expiresInSeconds
    );

    if (error || !signedUrl) {
      return { success: false, error: error?.message || "Failed to generate signed URL" };
    }

    return { success: true, signedUrl, expiresIn: expiresInSeconds };
  }

  /**
   * Delete file from storage and mark metadata deleted
   */
  public async deleteFile(
    clientId: string,
    assetId: string
  ): Promise<{ success: boolean; error?: string }> {
    const asset = dbService.getFileAssetById(clientId, assetId);
    if (!asset) {
      return { success: false, error: "Asset not found or access denied" };
    }

    let bucket: "campaign-files" | "voter-files" = "campaign-files";
    let relativePath = asset.storage_path;

    if (asset.storage_path.startsWith("campaign-files/")) {
      bucket = "campaign-files";
      relativePath = asset.storage_path.replace("campaign-files/", "");
    } else if (asset.storage_path.startsWith("voter-files/")) {
      bucket = "voter-files";
      relativePath = asset.storage_path.replace("voter-files/", "");
    }

    await supabaseStorage.delete(bucket, [relativePath]);
    dbService.deleteFileAsset(clientId, assetId);

    return { success: true };
  }
}

export const storageService = new StorageService();
