/**
 * ═══════════════════════════════════════════════════════════════════════════
 * useOptimisticMutation — Optimistic update pattern for React Query.
 *
 * Provides instant UI feedback while mutations are in-flight, with
 * automatic rollback on failure.
 *
 * Usage:
 *   const { mutate } = useOptimisticMutation({
 *     queryKey: ['chemicals'],
 *     mutationFn: updateChemical,
 *     updateCache: (old, newItem) => old.map(i => i.id === newItem.id ? newItem : i),
 *   });
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    useMutation,
    useQueryClient,
    type MutationFunction,
    type QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";

interface UseOptimisticMutationOptions<TData, TVariables, TContext = unknown> {
  /** React Query cache key to update optimistically */
  queryKey: QueryKey;
  /** Mutation function */
  mutationFn: MutationFunction<TData, TVariables>;
  /** How to update the cached data optimistically */
  updateCache: (currentData: TData[], variables: TVariables) => TData[];
  /** Success message for toast */
  successMessage?: string;
  /** Error message for toast */
  errorMessage?: string;
  /** Callback after successful mutation */
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ) => void;
}

export function useOptimisticMutation<TData, TVariables>({
  queryKey,
  mutationFn,
  updateCache,
  successMessage = "Changes saved",
  errorMessage = "Something went wrong",
  onSuccess,
}: UseOptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,

    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot current cache
      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      // Optimistically update cache
      if (previousData) {
        queryClient.setQueryData<TData[]>(queryKey, (old) =>
          old ? updateCache(old, variables) : old,
        );
      }

      return { previousData };
    },

    onError: (_error, _variables, context) => {
      // Rollback to snapshot on failure
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(errorMessage);
    },

    onSuccess: (data, variables, context) => {
      toast.success(successMessage);
      onSuccess?.(data, variables, context);
    },

    onSettled: () => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
