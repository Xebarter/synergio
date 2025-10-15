import { createClient } from '@/lib/supabase/client';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';

/**
 * Uploads a file to Supabase Storage
 * @param file - The file to upload
 * @param path - The path where the file should be stored (e.g., 'products/123/filename.jpg')
 * @param options - Additional upload options
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  path: string,
  options: {
    cacheControl?: string;
    upsert?: boolean;
  } = {}
): Promise<{ path: string; url: string }> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: options.cacheControl || '3600',
        upsert: options.upsert || false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: publicUrl,
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param path - The path of the file to delete
 * @returns True if the file was deleted successfully
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}

/**
 * Generates a unique file name with the original extension
 * @param file - The file to generate a name for
 * @param prefix - Optional prefix for the file name
 * @returns A unique file name with the original extension
 */
export function generateUniqueFileName(file: File, prefix: string = ''): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop();
  
  return `${prefix}${timestamp}-${randomString}.${extension}`.toLowerCase();
}

/**
 * Validates a file before upload
 * @param file - The file to validate
 * @param options - Validation options
 * @returns An error message if validation fails, or null if valid
 */
export function validateFile(
  file: File,
  options: {
    allowedTypes?: string[];
    maxSizeMB?: number;
  } = {}
): string | null {
  const { allowedTypes = ['image/jpeg', 'image/png', 'image/webp'], maxSizeMB = 5 } = options;
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  // Check file size (default 5MB)
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File is too large. Maximum size is ${maxSizeMB}MB`;
  }
  
  return null;
}

/**
 * Handles file selection and validation
 * @param event - The file input change event
 * @param options - Validation options
 * @returns The selected file if valid, or throws an error
 */
export function handleFileSelect(
  event: React.ChangeEvent<HTMLInputElement>,
  options: {
    allowedTypes?: string[];
    maxSizeMB?: number;
  } = {}
): File {
  const file = event.target.files?.[0];
  
  if (!file) {
    throw new Error('No file selected');
  }
  
  const validationError = validateFile(file, options);
  if (validationError) {
    throw new Error(validationError);
  }
  
  return file;
}

/**
 * Converts a file to a data URL
 * @param file - The file to convert
 * @returns A promise that resolves to the data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  uploadFile,
  deleteFile,
  generateUniqueFileName,
  validateFile,
  handleFileSelect,
  fileToDataURL,
};
