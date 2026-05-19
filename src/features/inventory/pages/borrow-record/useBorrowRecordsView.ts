/* ═══════════════════════════════════════════════════════════════════════════
 * useBorrowRecordsView — All state + logic for the Borrow Records page.
 *
 * Supports: listing, creating (borrow), returning, and viewing overdue.
 * Connects to Laravel backend via React Query + borrowRecordService.
 * ═══════════════════════════════════════════════════════════════════════════ */

import type {
    BorrowPayload,
    BorrowRecordApi,
    ReturnPayload,
} from "@/features/inventory/types";
import {
    useApproveBorrow,
    useBorrowRecordList,
    useCreateBorrowRecord,
    useOverdueBorrows,
    usePendingBorrows,
    useRejectBorrow,
    useReturnBorrowRecord,
} from "@/features/inventory/services/borrowRecordService";
import {
    getErrorMessage,
    isCustomError,
    isValidationError,
} from "@/shared/types/api-error";
import {
    BORROW_STATUSES,
    BORROWABLE_TYPES,
    formatEnumLabel,
    type BorrowableType,
} from "@/shared/types/enums";
import { useState } from "react";
import { toast } from "sonner";

// ─── Re-exports ────────────────────────────────────────────────────────────

export { BORROW_STATUSES, BORROWABLE_TYPES, formatEnumLabel };

// ─── Types ─────────────────────────────────────────────────────────────────

export type BorrowItem = BorrowRecordApi;

export type BorrowForm = {
  userId: string;
  borrowableType: string;
  borrowableId: string;
  quantity: string;
  dueAt: string;
  notes: string;
};

export type ReturnForm = {
  notes: string;
};

// ─── Tab type ──────────────────────────────────────────────────────────────

export type BorrowTab = "all" | "pending" | "overdue";

const EMPTY_BORROW_FORM: BorrowForm = {
  userId: "",
  borrowableType: "equipment",
  borrowableId: "",
  quantity: "1",
  dueAt: "",
  notes: "",
};

// ─── Helpers ───────────────────────────────────────────────────────────────

export const statusBadgeClass = (status: string): string => {
  switch (status) {
    case "borrowed":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
    case "returned":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    case "overdue":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export const formatDate = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getItemName = (item: BorrowRecordApi["item"]): string => {
  if (!item.data) return `${formatEnumLabel(item.type)} #${item.id}`;
  const data = item.data as unknown as Record<string, unknown>;
  // Try common name fields from different resource types
  return (
    (data.equipment_name as string) ||
    (data.common_name as string) ||
    ((data.identity as Record<string, unknown>)?.name as string) ||
    `${formatEnumLabel(item.type)} #${item.id}`
  );
};

// ─── Backend Error Field Map ────────────────────────────────────────────

const BACKEND_FIELD_MAP: Record<string, keyof BorrowForm> = {
  user_id: "userId",
  borrowable_type: "borrowableType",
  borrowable_id: "borrowableId",
  quantity: "quantity",
  due_at: "dueAt",
  notes: "notes",
};

type FormErrors = Partial<Record<keyof BorrowForm, string>>;

function mapBackendErrors(errors: Record<string, string[]>): FormErrors {
  const mapped: FormErrors = {};
  for (const [key, msgs] of Object.entries(errors)) {
    const field = BACKEND_FIELD_MAP[key];
    if (field) mapped[field] = msgs[0];
  }
  return mapped;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useBorrowRecordsView() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<BorrowTab>("all");

  const queryParams: Record<string, unknown> = { page };
  if (searchQuery) queryParams.search = searchQuery;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const allQuery = useBorrowRecordList(queryParams);
  const pendingQuery = usePendingBorrows();
  const overdueQuery = useOverdueBorrows();

  const activeQuery =
    activeTab === "pending"
      ? pendingQuery
      : activeTab === "overdue"
        ? overdueQuery
        : allQuery;

  const response = allQuery.data;
  const items: BorrowItem[] =
    activeTab === "pending"
      ? ((Array.isArray(pendingQuery.data)
          ? pendingQuery.data
          : []) as BorrowItem[])
      : activeTab === "overdue"
        ? ((Array.isArray(overdueQuery.data)
            ? overdueQuery.data
            : []) as BorrowItem[])
        : (response?.data ?? []);
  const meta = response?.meta;
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;

  // ── Mutations ──
  const createMutation = useCreateBorrowRecord();
  const returnMutation = useReturnBorrowRecord();
  const approveMutation = useApproveBorrow();
  const rejectMutation = useRejectBorrow();

  // ── Borrow form state ──
  const [borrowFormOpen, setBorrowFormOpen] = useState(false);
  const [borrowForm, setBorrowForm] = useState<BorrowForm>(EMPTY_BORROW_FORM);
  const [borrowFormErrors, setBorrowFormErrors] = useState<FormErrors>({});

  // ── Return dialog state ──
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returningItem, setReturningItem] = useState<BorrowItem | null>(null);
  const [returnNotes, setReturnNotes] = useState("");

  // ── Approve/Reject dialog state ──
  const [approveItem, setApproveItem] = useState<BorrowItem | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectItem, setRejectItem] = useState<BorrowItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const canSubmitBorrow = Boolean(
    borrowForm.userId &&
    borrowForm.borrowableType &&
    borrowForm.borrowableId &&
    Number(borrowForm.quantity) > 0,
  );

  // ── Borrow actions ──
  const openBorrowForm = () => {
    setBorrowForm(EMPTY_BORROW_FORM);
    setBorrowFormErrors({});
    setBorrowFormOpen(true);
  };

  const closeBorrowForm = () => setBorrowFormOpen(false);

  const updateBorrowField = <K extends keyof BorrowForm>(
    field: K,
    value: BorrowForm[K],
  ) => {
    setBorrowForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitBorrow = () => {
    if (!canSubmitBorrow) {
      toast.error("Please fill in all required fields");
      return;
    }
    setBorrowFormErrors({});

    const payload: BorrowPayload = {
      user_id: Number(borrowForm.userId),
      borrowable_type: borrowForm.borrowableType as BorrowableType,
      borrowable_id: Number(borrowForm.borrowableId),
      quantity: Number(borrowForm.quantity),
      due_at: borrowForm.dueAt || null,
      notes: borrowForm.notes || null,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setBorrowFormOpen(false);
        setBorrowForm(EMPTY_BORROW_FORM);
        toast.success("Item borrowed successfully");
      },
      onError: (err) => {
        if (isValidationError(err)) {
          setBorrowFormErrors(mapBackendErrors(err.response.data.errors));
          toast.error(err.response.data.message);
        } else if (isCustomError(err)) {
          toast.error(err.response.data.message);
        } else {
          toast.error("Failed to create borrow record");
        }
      },
    });
  };

  // ── Return actions ──
  const openReturnDialog = (item: BorrowItem) => {
    setReturningItem(item);
    setReturnNotes("");
    setReturnDialogOpen(true);
  };

  const closeReturnDialog = () => {
    setReturnDialogOpen(false);
    setReturningItem(null);
  };

  const submitReturn = () => {
    if (!returningItem) return;

    const payload: ReturnPayload = {
      notes: returnNotes || null,
    };

    returnMutation.mutate(
      { id: returningItem.id, payload },
      {
        onSuccess: () => {
          setReturnDialogOpen(false);
          setReturningItem(null);
          toast.success("Item returned successfully");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err) || "Failed to return item");
        },
      },
    );
  };

  // ── Approve/Reject actions ──
  const openApproveDialog = (item: BorrowItem) => {
    setApproveItem(item);
    setApproveNotes("");
  };
  const closeApproveDialog = () => setApproveItem(null);

  const submitApprove = () => {
    if (!approveItem) return;
    approveMutation.mutate(
      { id: approveItem.id, notes: approveNotes || null },
      {
        onSuccess: () => {
          setApproveItem(null);
          toast.success("Borrow request approved");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err) || "Failed to approve");
        },
      },
    );
  };

  const openRejectDialog = (item: BorrowItem) => {
    setRejectItem(item);
    setRejectReason("");
  };
  const closeRejectDialog = () => setRejectItem(null);

  const submitReject = () => {
    if (!rejectItem || !rejectReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    rejectMutation.mutate(
      { id: rejectItem.id, rejected_reason: rejectReason },
      {
        onSuccess: () => {
          setRejectItem(null);
          toast.success("Borrow request rejected");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err) || "Failed to reject");
        },
      },
    );
  };

  const isSubmitting =
    createMutation.isPending ||
    returnMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  return {
    items,
    totalCount: meta?.total ?? items.length,
    searchQuery,
    updateSearchQuery: setSearchQuery,
    statusFilter,
    updateStatusFilter: setStatusFilter,
    activeTab,
    setActiveTab,
    // Borrow form
    borrowFormOpen,
    borrowForm,
    borrowFormErrors,
    canSubmitBorrow,
    openBorrowForm,
    closeBorrowForm,
    updateBorrowField,
    submitBorrow,
    // Return dialog
    returnDialogOpen,
    returningItem,
    returnNotes,
    setReturnNotes,
    openReturnDialog,
    closeReturnDialog,
    submitReturn,
    // Approve dialog
    approveItem,
    approveNotes,
    setApproveNotes,
    openApproveDialog,
    closeApproveDialog,
    submitApprove,
    // Reject dialog
    rejectItem,
    rejectReason,
    setRejectReason,
    openRejectDialog,
    closeRejectDialog,
    submitReject,
    isLoading,
    isError,
    isSubmitting,
    page,
    setPage,
    meta,
  };
}
