'use client';

import { useState, useCallback, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  productId: string;
  onUploadSuccess: (result: any) => void;
  onUploadError: (error: Error) => void;
  className?: string;
  multiple?: boolean;
}

export function ImageUploader({
  productId,
  onUploadSuccess,
  onUploadError,
  className,
  multiple = false,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files.length) return;

      setIsUploading(true);
      
      try {
        // Convert FileList to Array
        const filesArray = Array.from(files);
        
        // Only process the first file if multiple is false
        const filesToUpload = multiple ? filesArray : [filesArray[0]];
        
        for (const file of filesToUpload) {
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await fetch(`/api/products/${productId}/images`, {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const result = await response.json();
          onUploadSuccess(result);
        }
      } catch (error) {
        console.error('Upload error:', error);
        onUploadError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setIsUploading(false);
      }
    },
    [productId, multiple, onUploadSuccess, onUploadError]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        // Reset the input value to allow selecting the same file again
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        isUploading && "opacity-70 pointer-events-none",
        className
      )}
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={onFileInputChange}
        multiple={multiple}
        accept="image/*"
      />
      
      <div className="flex flex-col items-center justify-center space-y-2">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? 'Drop the files here'
                  : 'Drag & drop images here, or click to select'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {multiple ? 'Multiple files allowed' : 'One file allowed'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPG, PNG, WEBP, GIF (Max: 5MB)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
  isRemoving?: boolean;
  className?: string;
}

export function ImagePreview({
  src,
  alt,
  onRemove,
  isRemoving = false,
  className,
}: ImagePreviewProps) {
  return (
    <div className={cn('relative group', className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover rounded-md"
      />
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        disabled={isRemoving}
      >
        {isRemoving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
