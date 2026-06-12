import { UseFormReturn, Path } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

/**
 * Handles mapping backend 422 validation errors directly to React Hook Form fields.
 * If the error is not a 422 or doesn't have field-specific errors, it falls back
 * to showing a toast notification.
 *
 * @param err The caught error
 * @param form The useForm return object
 * @param fallbackMessage Fallback toast message if it's not a validation error
 */
export function handleFormError<TFieldValues extends Record<string, unknown>>(
  err: unknown,
  form: UseFormReturn<TFieldValues>,
  fallbackMessage = "An unexpected error occurred"
) {
  if (axios.isAxiosError(err) && err.response?.status === 422) {
    const data = err.response.data as { message?: string; errors?: Record<string, string[]> };

    if (data.errors) {
      // Map each backend error to the corresponding form field
      Object.entries(data.errors).forEach(([field, messages]) => {
        // We assume the backend field name matches the form field name.
        // If there are nested fields (e.g. user.name), react-hook-form's Path handles dot notation.
        if (messages.length > 0) {
          form.setError(field as Path<TFieldValues>, {
            type: "server",
            message: messages[0],
          });
        }
      });
      // Also show a general toast if we want, or rely on inline errors
      toast.error(data.message || "Please correct the errors in the form.");
      return;
    }
  }

  // Fallback for non-422 errors or missing error details
  const message = axios.isAxiosError(err)
    ? (err.response?.data as { message?: string })?.message || err.message
    : err instanceof Error
    ? err.message
    : fallbackMessage;

  toast.error(message);
}
