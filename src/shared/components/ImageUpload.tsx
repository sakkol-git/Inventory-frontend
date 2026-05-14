import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { AlertCircle, ImagePlus, Link, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
 * ImageUpload — Supports both file upload AND external URL input.
 *
 * Props:
 *  • imageFile    — selected File object (for multipart upload)
 *  • imageUrl     — external URL string
 *  • previewUrl   — resolved preview (blob URL from file, or the imageUrl)
 *  • onFileChange — called when a file is selected / removed
 *  • onUrlChange  — called when the URL input changes
 *
 * The parent form holds the state; this component is a controlled input.
 * ═══════════════════════════════════════════════════════════════════════════ */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface ImageUploadProps {
  /** Selected File (if any) */
  imageFile?: File | null;
  /** External URL string */
  imageUrl?: string;
  /** Pre-computed preview URL (blob: or remote) */
  previewUrl?: string;
  /** Called when a file is picked or removed */
  onFileChange: (file: File | null) => void;
  /** Called when the URL input text changes */
  onUrlChange: (url: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

const ImageUpload = ({
  imageFile,
  imageUrl = "",
  previewUrl,
  onFileChange,
  onUrlChange,
  className,
  label = "Product Image",
  error,
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const validateAndSetFile = useCallback(
    (file: File | undefined) => {
      setFileError(null);
      if (!file) return;
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setFileError("Only JPG, PNG, and WebP images are allowed.");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError("File must be under 2 MB.");
        return;
      }
      onFileChange(file);
      // Clear URL when a file is selected (file takes priority)
      if (imageUrl) onUrlChange("");
      setShowUrlInput(false);
    },
    [onFileChange, onUrlChange, imageUrl],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      validateAndSetFile(e.dataTransfer.files[0]);
    },
    [validateAndSetFile],
  );

  const handleRemove = useCallback(() => {
    setFileError(null);
    onFileChange(null);
    onUrlChange("");
    if (inputRef.current) inputRef.current.value = "";
  }, [onFileChange, onUrlChange]);

  const displayError = fileError || error;
  const hasPreview = !!previewUrl;
  const activeSource = imageFile ? "file" : imageUrl ? "url" : null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium leading-none">{label}</p>

      {hasPreview ? (
        /* ── Preview ─────────────────────────────────────────── */
        <div className="relative group rounded-lg overflow-hidden border">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={() => inputRef.current?.click()}
              aria-label="Replace image"
            >
              <Upload className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          {activeSource && (
            <span className="absolute bottom-2 left-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/60 text-white">
              {activeSource === "file" ? "Uploaded File" : "External URL"}
            </span>
          )}
        </div>
      ) : (
        /* ── Drop zone ───────────────────────────────────────── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full flex flex-col items-center justify-center gap-2 py-8 border border-dashed rounded-lg transition-colors cursor-pointer",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
          )}
        >
          <div className="p-2 bg-muted rounded-lg">
            <ImagePlus className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              <Upload className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              Upload Image
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Drag & drop or click to browse — JPG, PNG, WebP up to 2 MB
            </p>
          </div>
        </button>
      )}

      {/* ── URL input toggle ──────────────────────────────── */}
      {!imageFile && (
        <div className="space-y-1.5">
          {showUrlInput ? (
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="image-url-input"
                  className="text-xs text-muted-foreground"
                >
                  Or paste an image URL
                </Label>
                <Input
                  id="image-url-input"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setShowUrlInput(false);
                  onUrlChange("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Link className="h-3 w-3" />
              Or use an image URL
            </button>
          )}
        </div>
      )}

      {/* ── Errors ────────────────────────────────────────── */}
      {displayError && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {displayError}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => validateAndSetFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default ImageUpload;
