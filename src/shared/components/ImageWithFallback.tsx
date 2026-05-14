/**
 * ImageWithFallback — Replaces the repeated image/icon fallback ternary
 * that appears in 6+ files across the codebase.
 *
 * Renders a responsive image if `src` is provided, otherwise renders
 * the given `fallback` content (typically an icon + label).
 */

import { cn } from "@/shared/lib/utils";
import { useState } from "react";

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  fallback: React.ReactNode;
  className?: string;
  imgClassName?: string;
}

const ImageWithFallback = ({
  src,
  alt,
  fallback,
  className,
  imgClassName = "w-full h-full object-cover",
}: ImageWithFallbackProps) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(imgClassName, className)}
      onError={() => setHasError(true)}
    />
  );
};

export default ImageWithFallback;
