/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NotificationPanel — Dropdown notification center attached to bell icon.
 *
 * Connects to backend NotificationController for real data.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import {
    AlertTriangle,
    Bell,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FlaskConical,
    Info,
    Loader2,
    Package,
    X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/core/api/api";
import { cn } from "@/shared/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────────────────────

export type NotificationType = "info" | "warning" | "success" | "error";

export interface ApiNotification {
  id: string;
  type: string;
  data: {
    type?: string;
    title: string;
    message: string;
    urgency?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

// ─── API ───────────────────────────────────────────────────────────────────

const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: () => [...NOTIFICATION_KEYS.all, "list"] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

async function fetchNotifications(): Promise<{
  data: ApiNotification[];
  meta: { unread_count: number };
}> {
  const res = await api.get("/notifications", { params: { per_page: 20 } });
  return res.data;
}

async function fetchUnreadCount(): Promise<number> {
  const res = await api.get("/notifications/unread-count");
  return res.data.data.count;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function mapNotificationType(n: ApiNotification): NotificationType {
  const urgency = n.data?.urgency;
  const category = n.data?.type;

  if (urgency === "critical" || category === "overdue_borrow") return "error";
  if (
    urgency === "high" ||
    category === "chemical_expiry" ||
    category === "low_stock"
  )
    return "warning";
  if (category === "maintenance_completed") return "success";
  return "info";
}

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Info; color: string; bg: string }
> = {
  info: { icon: Info, color: "text-info", bg: "bg-info/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  error: {
    icon: AlertTriangle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

const CATEGORY_ICONS: Record<string, typeof Info> = {
  chemical_expiry: FlaskConical,
  overdue_borrow: Clock,
  low_stock: Package,
  maintenance_overdue: Check,
  maintenance_upcoming: Calendar,
  contract_renewal: Calendar,
  payment_due: AlertTriangle,
  general: Bell,
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

// ─── Component ─────────────────────────────────────────────────────────────

export function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Unread count — lightweight poll every 60s
  const { data: unreadCount = 0 } = useQuery({
    queryKey: NOTIFICATION_KEYS.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  // Full list — only fetch when popover is open
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: NOTIFICATION_KEYS.list(),
    queryFn: fetchNotifications,
    enabled: open,
    staleTime: 15_000,
  });

  const notifications = notificationsData?.data ?? [];

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS.all });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: invalidate,
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post("/notifications/read-all"),
    onSuccess: invalidate,
  });

  const dismissMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: invalidate,
  });

  const markAsRead = useCallback(
    (id: string) => markReadMutation.mutate(id),
    [markReadMutation],
  );

  const markAllRead = useCallback(
    () => markAllReadMutation.mutate(),
    [markAllReadMutation],
  );

  const dismiss = useCallback(
    (id: string) => dismissMutation.mutate(id),
    [dismissMutation],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground pulse-badge">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => {
                const nType = mapNotificationType(notification);
                const config = TYPE_CONFIG[nType];
                const category = notification.data?.type ?? "general";
                const CategoryIcon = CATEGORY_ICONS[category] ?? Bell;
                const isUnread = !notification.read_at;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/50",
                      isUnread && "bg-primary/5",
                    )}
                    onClick={() => isUnread && markAsRead(notification.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center",
                        config.bg,
                      )}
                    >
                      <CategoryIcon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            isUnread ? "font-semibold" : "font-medium",
                          )}
                        >
                          {notification.data.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismiss(notification.id);
                          }}
                          className="flex-shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
                          aria-label={`Dismiss notification: ${notification.data.title}`}
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.data.message}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {isUnread && (
                      <div
                        className="flex-shrink-0 mt-2 w-2 h-2 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <button className="w-full text-center text-xs text-primary hover:underline py-1">
              View all notifications
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
