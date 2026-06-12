import { useState, useCallback, useRef, useEffect } from "react";

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

  /** File size validation error (if any) */
  validationError: string | null;

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
 * Closes AUDIT #2 — FileReader memory leak + unmount-safe state updates
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
 *     {image.validationError && (
 *       <p className="text-destructive text-sm">{image.validationError}</p>
 *     )}
 *     {image.imagePreviewUrl && (
 *       <img src={image.imagePreviewUrl} alt="Preview" />
 *     )}
 *   </div>
 * );
 */
export function useImageUpload(initialUrl?: string): UseImageUploadResult {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>(
    initialUrl ?? "",
  );
  const [imageUrl, setImageUrl] = useState<string>(initialUrl ?? "");
  const [initialImageUrl] = useState<string>(initialUrl ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);

  // ✅ Guard: Track component mount state to prevent setState after unmount
  const mountedRef = useRef(true);

  // ✅ Guard: Track active FileReader to abort on unmount
  const readerRef = useRef<FileReader | null>(null);

  // ✅ Cleanup: Abort FileReader and mark unmounted on component unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // If a FileReader is in progress, abort it
      if (
        readerRef.current &&
        readerRef.current.readyState === FileReader.LOADING
      ) {
        readerRef.current.abort();
      }
    };
  }, []);

  const handleImageChange = useCallback((file: File | null) => {
    if (!file) {
      setImageFile(null);
      setImagePreviewUrl("");
      setValidationError(null);
      return;
    }

    // ✅ Validate file size and return error message (not silent console.error)
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const limitMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      setValidationError(
        `Image too large (${sizeMB}MB). Maximum is ${limitMB}MB.`,
      );
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    // ✅ Validate file type and return error message (not silent console.error)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Invalid file type. Allowed: JPEG, PNG, WebP, GIF.");
      setImageFile(null);
      setImagePreviewUrl("");
      return;
    }

    // Clear previous validation errors
    setValidationError(null);
    setImageFile(file);

    // Generate immediate, synchronous memory preview URL
    const objectUrl = URL.createObjectURL(file);
    
    // ✅ Guard: Only setState if component is still mounted
    if (mountedRef.current) {
        setImagePreviewUrl(objectUrl);
    } else {
        URL.revokeObjectURL(objectUrl);
    }
  }, []);

  const setInitialUrl = useCallback((url: string) => {
    setImageUrl(url);
    setImagePreviewUrl(url);
    setValidationError(null);
  }, []);

  const clearImage = useCallback(() => {
    setImageFile(null);
    setImagePreviewUrl("");
    setImageUrl("");
    setValidationError(null);
  }, []);

  const hasChanged = useCallback(() => {
    return imageFile !== null || imageUrl !== initialImageUrl;
  }, [imageFile, imageUrl, initialImageUrl]);

  return {
    imageFile,
    imagePreviewUrl: imagePreviewUrl || imageUrl,
    imageUrl,
    validationError,
    handleImageChange,
    setImageUrl,
    clearImage,
    setInitialUrl,
    hasChanged,
  };
}
