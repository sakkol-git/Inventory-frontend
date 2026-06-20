import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/core/api/api";
import AppLayout from "@/core/layouts/AppLayout";
import PageHeader from "@/shared/components/PageHeader";
import { Bell, Check, Trash2, Loader2, AlertTriangle, Calendar, Clock, FlaskConical, Info, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerPagination } from "@/shared/components/ServerPagination";
import { cn } from "@/shared/lib/utils";
import type { ApiNotification, NotificationType } from "@/shared/components/NotificationPanel";

const NOTIFICATION_KEYS = {
  all: ["notifications"] as const,
  list: (page: number) => [...NOTIFICATION_KEYS.all, "list", page] as const,
  unreadCount: () => [...NOTIFICATION_KEYS.all, "unread-count"] as const,
};

async function fetchNotifications(page: number): Promise<{
  data: ApiNotification[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number; to: number };
}> {
  const res = await api.get("/notifications", { params: { page, per_page: 20 } });
  return res.data;
}

// Map notification urgency to types/styles
function mapNotificationType(n: ApiNotification): NotificationType {
  const urgency = n.data?.urgency;
  const category = n.data?.type;

  if (urgency === "critical" || category === "overdue_borrow") return "error";
  if (urgency === "high" || category === "chemical_expiry" || category === "low_stock") return "warning";
  if (category === "maintenance_completed") return "success";
  return "info";
}

const TYPE_CONFIG: Record<NotificationType, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-info", bg: "bg-info/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  success: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  error: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
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
  return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function Notifications() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: NOTIFICATION_KEYS.list(page),
    queryFn: () => fetchNotifications(page),
    staleTime: 15_000,
  });

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

  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        <PageHeader
          icon={Bell}
          title="Notifications"
          description="View and manage all your notifications."
          actions={
            hasUnread && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={markAllRead}
                disabled={markAllReadMutation.isPending}
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-destructive">
            <p>Failed to load notifications.</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-lg border shadow-sm">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="bg-card rounded-lg border shadow-sm divide-y">
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
                    "flex gap-4 p-5 transition-colors hover:bg-muted/50 items-start",
                    isUnread ? "bg-primary/5" : ""
                  )}
                  onClick={() => isUnread && markAsRead(notification.id)}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center",
                      config.bg
                    )}
                  >
                    <CategoryIcon className={cn("h-5 w-5", config.color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p
                        className={cn(
                          "text-base leading-tight",
                          isUnread ? "font-semibold" : "font-medium"
                        )}
                      >
                        {notification.data.title}
                      </p>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                        
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              dismiss(notification.id);
                            }}
                            title="Delete notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-1.5">
                      {notification.data.message}
                    </p>
                  </div>
                  
                  {isUnread && (
                    <div
                      className="flex-shrink-0 mt-2.5 w-2.5 h-2.5 rounded-full bg-primary"
                      title="Unread"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="mt-6 flex justify-end">
            <ServerPagination meta={meta} onPageChange={setPage} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
