// ═══════════════════════════════════════════════════════════════════════════
// EQUIPMENT DETAIL — Pure Domain Logic (Backend-Connected)
// ═══════════════════════════════════════════════════════════════════════════

import type { EquipmentApi } from "@/features/inventory/types";
import { AlertCircle, Check, Pencil, Zap } from "lucide-react";
import type { ActionButton, InfoField, StatusAlert } from "./types";

// ─── Status Color ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  available: "hsl(145, 63%, 32%)",
  in_use: "hsl(38, 92%, 50%)",
  borrowed: "hsl(260, 60%, 50%)",
  under_maintenance: "hsl(0, 72%, 51%)",
  retired: "hsl(210, 20%, 50%)",
};

const FALLBACK_STATUS_COLOR = "hsl(210, 20%, 50%)";

export function statusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] ?? FALLBACK_STATUS_COLOR;
}

// ─── Status Badge Class ──────────────────────────────────────────────────

const STATUS_BADGE_CLASSES: Record<string, string> = {
  available: "bg-primary text-primary-foreground",
  in_use: "bg-warning text-warning-foreground",
  borrowed:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  under_maintenance: "bg-destructive text-destructive-foreground",
  retired: "bg-muted text-muted-foreground",
};

const FALLBACK_BADGE_CLASS = "bg-muted text-muted-foreground";

export function statusBadgeClass(status: string): string {
  return STATUS_BADGE_CLASSES[status.toLowerCase()] ?? FALLBACK_BADGE_CLASS;
}

// ─── Date Formatting ─────────────────────────────────────────────────────

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Action Buttons ──────────────────────────────────────────────────────

export function buildActions(
  status: string,
  isBorrowable: boolean,
): ActionButton[] {
  const actions: ActionButton[] = [
    {
      label: "Edit",
      icon: Pencil,
      variant: "outline",
      className: "gap-2 border font-medium",
      ariaLabel: "Edit equipment",
    },
  ];

  if (isBorrowable && status.toLowerCase() === "available") {
    actions.push({
      label: "Check Out",
      icon: Zap,
      variant: "default",
      className: "gap-2 font-medium border",
      ariaLabel: "Check out equipment",
    });
  }

  if (status.toLowerCase() === "in_use") {
    actions.push({
      label: "Return",
      icon: Check,
      variant: "outline",
      className: "gap-2 font-medium border",
      ariaLabel: "Return equipment",
    });
  }

  if (status.toLowerCase() === "under_maintenance") {
    actions.push({
      label: "View Issue",
      icon: AlertCircle,
      variant: "outline",
      className: "gap-2 font-medium border text-destructive border-destructive",
      ariaLabel: "View maintenance issue",
    });
  }

  return actions;
}

// ─── Status Alerts ───────────────────────────────────────────────────────

export function buildAlerts(_data: EquipmentApi): StatusAlert[] {
  // API doesn't currently provide borrowedBy / returnDate / issue fields
  // Return empty alerts — can be extended when backend adds these fields
  return [];
}

// ─── Location & Status Sidebar Fields ────────────────────────────────────

export function buildLocationStatusFields(data: EquipmentApi): InfoField[] {
  const fields: InfoField[] = [];

  if (data.location) {
    fields.push({ label: "Current Location", value: data.location });
  }
  if (data.condition) {
    fields.push({ label: "Condition", value: data.condition });
  }
  fields.push({
    label: "Borrowable",
    value: data.is_borrowable ? "Yes" : "No",
  });

  return fields;
}
