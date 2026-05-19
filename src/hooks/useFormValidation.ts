import { useState, useCallback } from "react";

/**
 * Checks if error is a validation error from the API
 */
function isValidationError(
  err: unknown
): err is { response: { data: { errors: Record<string, string[]> } } } {
  return (
    err !== null &&
    typeof err === "object" &&
    "response" in err &&
    err.response !== null &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data !== null &&
    typeof err.response.data === "object" &&
    "errors" in err.response.data
  );
}

/**
 * Options for useFormValidation hook
 */
export interface UseFormValidationOptions {
  /** Maps backend field names to form field names */
  fieldMap: Record<string, string>;

  /** Called when a field error is set */
  onFieldError?: (field: string, error: string) => void;
}

/**
 * Result from useFormValidation hook
 */
export interface UseFormValidationResult {
  /** Map of field → error message */
  fieldErrors: Record<string, string>;

  /** Handle backend validation error */
  handleValidationError: (err: unknown) => Record<string, string>;

  /** Set error for a specific field */
  setFieldError: (field: string, error: string) => void;

  /** Clear error for a specific field */
  clearFieldError: (field: string) => void;

  /** Clear all errors */
  clearAll: () => void;

  /** Check if specific field has error */
  hasError: (field: string) => boolean;

  /** Get error for specific field */
  getError: (field: string) => string | undefined;
}

/**
 * Generic hook for form validation and error handling
 * Handles backend error mapping and field-level error management
 *
 * @example
 * const validation = useFormValidation({
 *   fieldMap: CHEMICAL_FIELD_MAP,
 * });
 *
 * try {
 *   await submitForm();
 * } catch (err) {
 *   validation.handleValidationError(err);
 * }
 */
export function useFormValidation(
  options: UseFormValidationOptions
): UseFormValidationResult {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleValidationError = useCallback(
    (err: unknown): Record<string, string> => {
      if (!isValidationError(err)) {
        return {};
      }

      const mapped: Record<string, string> = {};
      const backendErrors = err.response.data.errors;

      Object.entries(backendErrors).forEach(([backendField, messages]) => {
        const formField = options.fieldMap[backendField];
        if (formField && Array.isArray(messages) && messages.length > 0) {
          mapped[formField] = messages[0]; // Take first error message
          options.onFieldError?.(formField, messages[0]);
        }
      });

      setFieldErrors(mapped);
      return mapped;
    },
    [options.fieldMap, options.onFieldError]
  );

  const setFieldError = useCallback(
    (field: string, error: string) => {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
      options.onFieldError?.(field, error);
    },
    [options.onFieldError]
  );

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasError = useCallback(
    (field: string) => !!fieldErrors[field],
    [fieldErrors]
  );

  const getError = useCallback(
    (field: string) => fieldErrors[field],
    [fieldErrors]
  );

  return {
    fieldErrors,
    handleValidationError,
    setFieldError,
    clearFieldError,
    clearAll,
    hasError,
    getError,
  };
}
