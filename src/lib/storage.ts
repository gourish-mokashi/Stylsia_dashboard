import { supabase } from "./supabase";

export interface UploadResult {
  url: string;
  path: string;
}

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (optional, will generate if not provided)
 * @returns Promise<UploadResult>
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path?: string
): Promise<UploadResult> {
  try {
    // Generate path if not provided
    if (!path) {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop() || "";
      path = `${timestamp}_${randomString}.${fileExtension}`;
    }

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new StorageError(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error instanceof StorageError
      ? error
      : new StorageError("Failed to upload file");
  }
}

/**
 * Upload multiple files to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param pathPrefix - Optional prefix for all file paths
 * @returns Promise<UploadResult[]>
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  pathPrefix?: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map((file) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_"); // Sanitize filename

    const path = pathPrefix
      ? `${pathPrefix}/${timestamp}_${randomString}_${fileName}`
      : `${timestamp}_${randomString}_${fileName}`;

    return uploadFile(file, bucket, path);
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Multiple upload error:", error);
    throw new StorageError("Failed to upload one or more files");
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new StorageError(`Failed to delete file: ${error.message}`);
    }
  } catch (error) {
    console.error("Delete error:", error);
    throw error instanceof StorageError
      ? error
      : new StorageError("Failed to delete file");
  }
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  SUPPORT_ATTACHMENTS: "support-attachments",
  BRAND_LOGOS: "brand-logos",
  PRODUCT_IMAGES: "product-images",
} as const;
