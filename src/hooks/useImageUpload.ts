import { useState, useCallback } from "react";

/**
 * Result from useImageUpload hook
 */
export interface UseImageUploadResult {
  /** Selected File object */
  imageFile: File | null;

  /** Data URL for preview */
  imagePreviewUrl: string;

  /** Original URL (from server) */
  imageUrl: string;

  /** Set image from file */
  handleImageChange: (file: File | null) => void;

  /** Set image URL (e.g., from server response) */
  setImageUrl: (url: string) => void;

  /** Clear all image data */
  clearImage: () => void;

  /** Set initial URL (for edit mode) */
  setInitialUrl: (url: string) => void;

  /** Check if image has changed since initial */
  hasChanged: () => boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Generic hook for managing image upload state
 * Handles file selection, preview generation, and validation
 *
 * @example
 * const image = useImageUpload();
 *
 * return (
 *   <div>
 *     <input
 *       type="file"
 *       accept="image/*"
 *       onChange={(e) => image.handleImageChange(e.target.files?.[0] ?? null)}
 *     />
 *     {image.imagePreviewUrl && (
 *       <img src={image.imagePreviewUrl} alt="Preview" />
 *     )}
 *   </div>
 * );
 */
export function useImageUpload(initialUrl?: string): UseImageUploadResult {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(initialUrl ?? "");
  const [imageUrl, setImageUrl] = useState<string>(initialUrl ?? "");
  const [initialImageUrl] = useState<string>(initialUrl ?? "");

  const handleImageChange = useCallback((file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("File too large. Maximum size is 5MB.");
      return;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("Invalid file type. Allowed types: JPEG, PNG, WebP, GIF.");
      return;
    }

    setImageFile(file);

    // Generate preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreviewUrl(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const setInitialUrl = useCallback((url: string) => {
    setImageUrl(url);
    setImagePreviewUrl(url);
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl("");
    setImageUrl("");
  }, []);

  const hasChanged = useCallback(() => {
    return imageFile !== null || imageUrl !== initialImageUrl;
  }, [imageFile, imageUrl, initialImageUrl]);

  return {
    imageFile,
    imagePreviewUrl: imagePreviewUrl || imageUrl,
    imageUrl,
    handleImageChange,
    setImageUrl,
    clearImage,
    setInitialUrl,
    hasChanged,
  };
}
