import { useState, useCallback } from "react";

/**
 * Options for the useEntityForm hook
 */
export interface UseEntityFormOptions<T> {
  /** Initial form data */
  initialData: T;

  /** Maps backend field names to form field names */
  fieldMap: Record<string, keyof T>;

  /** Called when form is submitted */
  onSubmit: (payload: T) => Promise<void>;

  /** Optional validation function */
  validate?: (form: T) => Record<keyof T, string>;
}

/**
 * Result from useEntityForm hook
 */
export interface UseEntityFormResult<T> {
  /** Current form data */
  form: T;

  /** Field error messages */
  errors: Partial<Record<keyof T, string>>;

  /** Whether form has been modified */
  isDirty: boolean;

  /** Whether form is currently submitting */
  isSubmitting: boolean;

  /** Whether form is valid (no errors) */
  isValid: boolean;

  /** Update a single form field */
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;

  /** Set error for a specific field */
  setFieldError: (field: keyof T, error: string) => void;

  /** Clear error for a specific field */
  clearFieldError: (field: keyof T) => void;

  /** Clear all field errors */
  clearErrors: () => void;

  /** Set errors from backend validation response */
  setBackendErrors: (backendErrors: Record<string, string[]>) => void;

  /** Submit the form */
  submit: () => Promise<void>;

  /** Reset form to initial state */
  reset: () => void;
}

/**
 * Generic hook for managing entity form state
 * Consolidates form fields, validation, errors, and submission
 *
 * @example
 * const form = useEntityForm({
 *   initialData: EMPTY_CHEMICAL,
 *   fieldMap: CHEMICAL_FIELD_MAP,
 *   onSubmit: async (payload) => {
 *     await createMutation.mutateAsync(payload);
 *   },
 *   validate: validateChemicalForm,
 * });
 */
export function useEntityForm<T>(
  options: UseEntityFormOptions<T>
): UseEntityFormResult<T> {
  const [form, setForm] = useState<T>(options.initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialForm] = useState<T>(options.initialData);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setBackendErrors = useCallback(
    (backendErrors: Record<string, string[]>) => {
      const mapped: Partial<Record<keyof T, string>> = {};

      Object.entries(backendErrors).forEach(([backendField, messages]) => {
        const formField = options.fieldMap[backendField];
        if (formField && messages.length > 0) {
          // Take first error message
          mapped[formField] = messages[0];
        }
      });

      setErrors(mapped);
    },
    [options.fieldMap]
  );

  const validateForm = useCallback(() => {
    if (options.validate) {
      const validationErrors = options.validate(form);
      const hasErrors = Object.keys(validationErrors).length > 0;
      if (hasErrors) {
        setErrors(validationErrors);
      }
      return !hasErrors;
    }
    return true;
  }, [form, options]);

  const submit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await options.onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  }, [form, options, validateForm]);

  const reset = useCallback(() => {
    setForm(initialForm);
    setErrors({});
    setIsDirty(false);
  }, [initialForm]);

  return {
    form,
    errors,
    isDirty,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    updateField,
    setFieldError,
    clearFieldError,
    clearErrors,
    setBackendErrors,
    submit,
    reset,
  };
}
